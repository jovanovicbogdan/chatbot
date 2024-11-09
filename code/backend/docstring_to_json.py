import os
import logging
from dotenv import load_dotenv
from constants import LLM
from langchain_community.document_loaders import DirectoryLoader
from langchain_openai.chat_models import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# give example in yaml because LangChain will detect '{' as variable placeholder
prompt_template = """
You will be given ruby YARD method docstring.
Convert docstring into JSON. Output only minified raw JSON. Do not output in any format including markdown.
Here is how JSON should look like but the example is given in YAML:

name: function_name_placeholder
description: function_description_placeholder
parameters:
  - name: parameter_name_placeholder
    type: parameter_type_placeholder
    description: parameter_description_placeholder
    options:
      - name: option_name_placeholder
        type: option_type_placeholder
        description: option_description_placeholder
      - name: option_name_placeholder
        type: option_type_placeholder
        description: option_description_placeholder
  - name: parameter_name_placeholder
    type: parameter_type_placeholder
    description: parameter_description_placeholder
    options:
      - name: option_name_placeholder
        type: option_type_placeholder
        description: option_description_placeholder
return:
  type: return_type_placeholder
  description: return_description_placeholder
examples:
  - example_usage_placeholder

Anything between the following `context` html blocks is docstring you should convert to JSON.

<context>
    {context}
</context>
"""


def convert_docstring_to_json():
    log.info("Converting...")
    prompt = ChatPromptTemplate.from_template(prompt_template)
    jet_faq_loader = DirectoryLoader(os.path.join("data", "jet_docs", "docstrings"))
    docs = jet_faq_loader.load()
    chain = prompt | ChatOpenAI(model=LLM, temperature=0) | StrOutputParser()
    response = chain.invoke({"context": docs[0].page_content})
    log.info(response)


if __name__ == "__main__":
    convert_docstring_to_json()
