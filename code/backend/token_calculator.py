import tiktoken
from constants import LLM
from ingest import load_jet_docs


def calculate_tokens():
    docs = load_jet_docs()
    total_tokens = {}
    for doc in docs:
        encoding = tiktoken.encoding_for_model(LLM)
        tokens = encoding.encode(doc.page_content)

        filename = doc.metadata["source"].replace("pdf/jet_docs", "")
        if filename in total_tokens:
            total_tokens[filename] += tokens
        else:
            total_tokens[filename] = tokens

    for filename, tokens in total_tokens.items():
        token_count = len(tokens)
        message = f"Document '{filename}' has been processed, resulting in a total of {token_count} tokens."
        print(message)
