import os
import psycopg
from log import log
from dotenv import load_dotenv
from constants import COLLECTION_NAME_QABOT, EMBEDDING_MODEL, COLLECTION_NAME_TSBOT
from langchain_openai import OpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector

load_dotenv()


def get_database_url() -> str:
    """
    Fetches the DATABASE_URL from the environment and raises an error if it is not set.
    """
    connection_string = os.getenv("DATABASE_URL", "")
    if not connection_string:
        raise RuntimeError(
            "No database connection string found. DATABASE_URL is required"
        )
    return connection_string


def create_all():
    query = """
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rating_type') THEN
            CREATE TYPE rating_type AS ENUM ('thumbsUp', 'thumbsDown');
        END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS conversation_feedback (
        conversation_feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL UNIQUE,
        rating rating_type NOT NULL,
        conversation JSONB NULL,
        comment TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS message_feedback (
        message_feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL,
        message_id UUID NOT NULL,
        conversation JSONB NOT NULL,
        comment TEXT NULL,
        category_tag VARCHAR(255) NOT NULL,
        category_tag_choices VARCHAR(255)[] NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doc_record (
        doc_record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        doc_hash_uuid CHARACTER VARYING NULL,
        namespace CHARACTER VARYING NOT NULL,
        source_doc CHARACTER VARYING NULL
    );

    CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email CHARACTER VARYING NOT NULL,
        first_name CHARACTER VARYING NOT NULL,
        last_name CHARACTER VARYING NOT NULL
    );
    """
    execute_query(query=query)


def get_qabot_vector_db():
    embedding_function = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    db = PGVector(
        collection_name=COLLECTION_NAME_QABOT,
        connection=get_database_url(),
        embeddings=embedding_function,
        use_jsonb=True,
    )
    return db


def get_tsbot_vector_db():
    embedding_function = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    db = PGVector(
        collection_name=COLLECTION_NAME_TSBOT,
        connection=get_database_url(),
        embeddings=embedding_function,
        use_jsonb=True,
    )
    return db


def execute_query(query, params=None, is_select=False):
    with psycopg.connect(get_database_url()) as conn:
        with conn.cursor() as cur:
            log.debug("Executing query: %s", query)
            cur.execute(query, params)
            if is_select:
                result = cur.fetchall()
                return result if result else []
            conn.commit()
