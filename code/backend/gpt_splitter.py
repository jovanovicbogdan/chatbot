import re
from dotenv import load_dotenv
from log import log
from constants import LLM
from langchain_openai import ChatOpenAI
from typing import Any, List
from langchain_text_splitters import TextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document

load_dotenv()


class GPTSplitter(TextSplitter):
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.prompt = ChatPromptTemplate.from_template(
            """
            You are an expert in identifying the semantic meaning of text, particularly in structured documents such as code, markdown, or technical manuals. 
            Your task is to wrap each semantically coherent chunk of text in §§§, ensuring that logical groupings are preserved. For example, functions and their associated descriptions, parameters, and examples should be treated as a single chunk to maintain context.
            Make sure to preserve the exact formatting, including spaces, line breaks, and special characters such as hashtags (`#` in ruby comments). For example:
            - Ensure that all comments (e.g., `#`) and the lines they are on remain exactly as they appear.
            - Do not insert additional new lines or modify the spacing within comments, code blocks, or headers.
            - When processing a function or test header, ensure that it remains a single chunk and that the formatting (e.g., indentation, comment symbols) is preserved as is.

            For instance:
            - If a function description spans multiple lines, including its parameters and examples, it should be wrapped as one chunk to avoid losing context.
            - For markdown documents, ensure headers and their related sections (including code blocks, explanations, lists) are grouped together within the same chunk.

            This is important to ensure that when performing retrieval-based tasks, such as RAG (Retrieval Augmented Generation), the entire context of a function or concept is preserved.

            Now, process the following markdown text:
            {text}
            """
        )
        self.model = ChatOpenAI(model=LLM, temperature=0)
        self.output_parser = StrOutputParser()
        self.chain = (
            {"text": RunnablePassthrough()}
            | self.prompt
            | self.model
            | self.output_parser
        )

    def split_text(self, docs: List[Document]) -> List[Document]:
        """
            Splits a list of documents into semantically coherent chunks.

            Args:
                docs (List[Document]): A list of Document objects to be split.

            Returns:
                List[Document]: A list of Document objects where each document contains one semantically coherent chunk
                of the original content.

            Raises:
                ValueError: If the document type cannot be detected.
        """

        split_docs = []

        for doc in docs:
            response = self.chain.invoke({"text": doc.page_content})
            # Use regex to split properly by §§§ and §§§ markers
            chunks = re.findall(r'§§§(.*?)§§§', response, re.DOTALL)
            for chunk in chunks:
                log.info("Extracted semantic chunk from a document '%s': '%s'", doc.metadata["source"],
                         chunk.strip())
                chunked_doc = Document(page_content=chunk.strip(), metadata=doc.metadata)
                split_docs.append(chunked_doc)

        return split_docs
