# pyright: reportOptionalIterable=false

import os
import uuid
import hashlib
import json
from typing import (
    Any,
    List,
)
from log import log
from db import execute_query, get_database_url
from constants import (
    COLLECTION_NAME_QABOT,
    EMBEDDING_MODEL,
    NAMESPACE,
    COLLECTION_NAME_TSBOT,
)
from gpt_splitter import GPTSplitter
from langchain_core.embeddings import Embeddings
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_postgres.vectorstores import PGVector
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

NAMESPACE_UUID = uuid.UUID(int=1984)


def get_embeddings_model() -> Embeddings:
    return OpenAIEmbeddings(model=EMBEDDING_MODEL, dimensions=1536)


def hash_string_to_uuid(input_string: str) -> uuid.UUID:
    """Hashes a string and returns the corresponding UUID."""
    hash_value = hashlib.sha1(input_string.encode("utf-8")).hexdigest()
    return uuid.uuid5(NAMESPACE_UUID, hash_value)


def hash_nested_dict_to_uuid(data: dict[Any, Any]) -> uuid.UUID:
    """Hashes a nested dictionary and returns the corresponding UUID."""
    serialized_data = json.dumps(data, sort_keys=True)
    hash_value = hashlib.sha1(serialized_data.encode("utf-8")).hexdigest()
    return uuid.uuid5(NAMESPACE_UUID, hash_value)


def sync_docs(documents: List[Document]):
    uuids = []
    for doc in documents:
        content_hash = str(hash_string_to_uuid(doc.page_content))
        metadata_hash = str(hash_nested_dict_to_uuid(doc.metadata))
        hashed_content_and_metadata = str(
            hash_string_to_uuid(content_hash + metadata_hash)
        )
        uuids.append(
            {
                "doc_hash_uuid": hashed_content_and_metadata,
                "document": doc,
            }
        )

    # exists_query = f"SELECT doc_hash_uuid, source_doc FROM doc_record WHERE source_doc IN ({','.join(['%s'] * len(uuids))})"
    doc_records_query = "SELECT doc_hash_uuid, source_doc FROM doc_record"

    # Find documents that exists in 'doc_record' table
    # doc_records = execute_query(query=doc_records_query, params=tuple([uid["document"].metadata["source"] for uid in uuids]),
    #                             is_select=True)
    doc_records = execute_query(query=doc_records_query, is_select=True)
    existing_docs = [doc_record[1] for doc_record in doc_records]

    add_to_vectorstore = []
    for uid in uuids:
        if uid["document"].metadata["source"] not in existing_docs:
            add_to_vectorstore.append(
                {"doc_hash_uuid": uid["doc_hash_uuid"], "document": uid["document"]}
            )

    delete_docs = []
    for uid in uuids:
        for doc_record in doc_records:
            doc_hash_uuid = doc_record[0]
            source_doc = doc_record[1]
            if uid["document"].metadata["source"] == source_doc:
                if uid["doc_hash_uuid"] != doc_hash_uuid:
                    # Update doc by deleting it first and then add it in vectorstore again
                    delete_docs.append(uid["document"].metadata["source"])
                    add_to_vectorstore.append(
                        {
                            "doc_hash_uuid": uid["doc_hash_uuid"],
                            "document": uid["document"],
                        }
                    )

    source_docs = [uid["document"].metadata["source"] for uid in uuids]
    for existing_doc in existing_docs:
        if existing_doc not in source_docs:
            delete_docs.append(existing_doc)

    if delete_docs:
        where_clause_embedding = " OR ".join(
            [f"cmetadata ->> 'source' = '{doc}'" for doc in delete_docs]
        )
        delete_embedding_query = (
            f"DELETE FROM langchain_pg_embedding WHERE {where_clause_embedding}"
        )
        execute_query(query=delete_embedding_query)
        in_clause_delete_doc_record = ",".join([f"'{doc}'" for doc in delete_docs])
        delete_doc_record_query = f"DELETE FROM doc_record WHERE source_doc IN ({in_clause_delete_doc_record})"
        execute_query(query=delete_doc_record_query)

    if add_to_vectorstore:
        values_clause = ",".join(["(%s, %s, %s)"] * len(add_to_vectorstore))
        values = []
        for doc in add_to_vectorstore:
            values.extend(
                [doc["doc_hash_uuid"], NAMESPACE, doc["document"].metadata["source"]]
            )
        insert_doc_record_query = f"INSERT INTO doc_record (doc_hash_uuid, namespace, source_doc) VALUES {values_clause}"
        execute_query(query=insert_doc_record_query, params=tuple(values))

    return [doc["document"] for doc in add_to_vectorstore]


def load_docs() -> dict:
    docs_dir = os.getenv("DOCS_DIR", None)
    if docs_dir:
        docs_root_dir = docs_dir
    else:
        docs_root_dir = os.path.join("data", "docs")
    if not os.path.exists(docs_root_dir):
        raise RuntimeError(f"Path to '{docs_root_dir}' doesn't exist")

    qabot_dir = os.path.join(docs_root_dir, "qabot")
    jet_examples_dir = os.path.join(docs_root_dir, "qabot", "jet_examples")
    jet_faq_dir = os.path.join(docs_root_dir, "qabot", "jet_faq")
    tsbot_dir = os.path.join(docs_root_dir, "tsbot")
    qabot_raw_docs = DirectoryLoader(qabot_dir)
    ts_raw_docs = DirectoryLoader(tsbot_dir)

    all_docs = sync_docs(qabot_raw_docs.load() + ts_raw_docs.load())
    qabot_docs = []
    jet_faq_docs = []
    ts_docs = []
    for doc in all_docs:
        source = doc.metadata["source"]
        if jet_examples_dir or qabot_dir in source and jet_faq_dir not in source:
            qabot_docs.append(doc)
        if jet_faq_dir in source:
            jet_faq_docs.append(doc)
        if tsbot_dir in source:
            ts_docs.append(doc)

    log.info("Loaded '%s' qa bot doc(s)", len(qabot_docs + jet_faq_docs))
    log.info("Loaded '%s' tech support doc(s)", len(ts_docs))
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=27000, chunk_overlap=2700)
    jet_example_split_docs = text_splitter.split_documents(qabot_docs)
    jet_faq_split_docs = GPTSplitter().split_text(jet_faq_docs)
    ts_split_docs = text_splitter.split_documents(ts_docs)

    return {
        "qabot_docs": jet_example_split_docs + jet_faq_split_docs,
        "tsbot_docs": ts_split_docs,
    }


def ingest_docs():
    docs = load_docs()

    qabot_docs = docs["qabot_docs"]
    tsbot_docs = docs["tsbot_docs"]

    connection_string = get_database_url()
    embeddings = get_embeddings_model()

    if qabot_docs:
        PGVector.from_documents(
            documents=qabot_docs,
            embedding=embeddings,
            collection_name=COLLECTION_NAME_QABOT,
            connection=connection_string,
            use_jsonb=True,
        )

    if tsbot_docs:
        PGVector.from_documents(
            documents=tsbot_docs,
            embedding=embeddings,
            collection_name=COLLECTION_NAME_TSBOT,
            connection=connection_string,
            use_jsonb=True,
        )
    return {
        "qabot_docs": [doc.metadata["source"] for doc in qabot_docs],
        "tsbot_docs": [doc.metadata["source"] for doc in tsbot_docs],
    }
