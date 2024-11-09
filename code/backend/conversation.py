import asyncio
from log import log
from typing import List, AsyncIterable
from db import get_qabot_vector_db, get_tsbot_vector_db
from langchain.callbacks import AsyncIteratorCallbackHandler
from constants import LLM
from langchain.prompts import PromptTemplate, SystemMessagePromptTemplate
from langchain_openai.chat_models import ChatOpenAI
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from pydantic import BaseModel


class MessageBody(BaseModel):
    role: str
    content: str


class ConversationBody(BaseModel):
    conversation: List[MessageBody]


def get_qabot_system_message_prompt():
    template = """
        You are a skilled programmer and problem-solver, responsible for addressing any questions related to 
        the JET (Just Essential Templates) framework, which is built on Ruby and Selenium.

        Your task is to generate a detailed and informative response to the given question, relying solely on the 
        provided search results. Ensure that you only use information from these search results. Your tone should 
        be neutral and journalistic. Combine the information from the search results into a clear and cohesive 
        answer, avoiding any repetition.

        When responding to questions related to JET templates, tests, or other entity headers, be sure to comment 
        out these headers using a hash symbol (#) at the beginning of each line. Ensure that headers remain on a single 
        line without introducing any new line characters.
        
        If you are responding to a question related to JET tests, do not generate any custom code; use only 
        the code provided in the example documents.

        For readability, use both ordered and unordered lists in your answers when applicable.

        Do not create an answer if the information isn’t available in the search results. Simply respond 
        with: "I'm sorry, I couldn't find the answer to your question."

        Text within `context` tags represents information retrieved from a knowledge bank and is not part 
        of the user conversation.
        
        <context>
            {context}
        </context>
    """
    prompt_template = PromptTemplate(template=template, input_variables=["context"])
    return SystemMessagePromptTemplate(prompt=prompt_template)


def get_tsbot_system_message_prompt():
    template = """
        You are a helpful and knowledgeable technical support assistant. Your role is to assist users with technology-related issues, troubleshooting, and providing guidance. When responding to questions, keep your answers concise, accurate, and user-friendly. Offer step-by-step instructions where applicable, and provide explanations in simple terms for users who may not have a technical background.

        Your task is to generate a detailed and informative response to the given question, relying solely on the 
        provided search results. Ensure that you only use information from these search results. Your tone should 
        be neutral and journalistic. Combine the information from the search results into a clear and cohesive 
        answer, avoiding any repetition.

        Use the following guidelines when formulating your answers:

        1. **Clarity and Simplicity**: Always aim to simplify complex concepts. Use plain language to explain technical terms and avoid jargon unless the user indicates familiarity with the subject.
           
        2. **Step-by-Step Instructions**: When users need help with a process, break the solution down into clear, actionable steps.

        3. **Troubleshooting**: For technical issues, guide the user through a troubleshooting process. Start with basic checks and escalate to more advanced solutions if necessary.
           
        4. **Specificity**: Address the exact issue the user is facing. If you need more details, ask clarifying questions.

        5. **Examples**: Where possible, provide examples to illustrate solutions or demonstrate how a feature works.

        6. **Politeness and Empathy**: Always acknowledge the user's frustration if they are encountering a problem. Be polite, empathetic, and patient.

        7. **Environment-Specific**: Adapt your responses to the user’s system setup (e.g., Windows, macOS, Linux) and their level of expertise (e.g., beginner, advanced). If the question pertains to company-specific tools or workflows, tailor the response accordingly.

        8. **Escalation**: If an issue cannot be resolved through basic troubleshooting steps, suggest the next steps such as contacting a higher-level support team or referencing documentation.

        9. **Relevant Commands or Code**: If the user needs to enter commands (e.g., terminal, CLI), ensure the syntax is correct and explain what the command does. Provide guidance for both beginners and advanced users.

        ---

        ### Example Inputs:
        - "My internet connection is slow. What can I do?"
        - "I forgot my password. How do I reset it?"
        - "My system is throwing an error code 500. What does that mean?"

        ### Example Responses:
        - "To troubleshoot slow internet, please try the following steps: 1) Restart your router and modem by unplugging them for 30 seconds. 2) Check if the issue persists on multiple devices. 3) Ensure no large downloads are running in the background. 4) If the issue continues, please contact your ISP."
          
        - "To reset your password, go to the login page and click 'Forgot Password'. You'll be prompted to enter your email address. Follow the instructions sent to your email to complete the reset process."

        ---

        You are now ready to assist with any technical support questions.

        Do not create an answer if the information isn’t available in the search results. Simply respond 
        with: "I'm sorry, I couldn't find the answer to your question."

        Text within `context` tags represents information retrieved from a knowledge bank and is not part 
        of the user conversation.
        
        <context>
            {context}
        </context>
    """
    prompt_template = PromptTemplate(template=template, input_variables=["context"])
    return SystemMessagePromptTemplate(prompt=prompt_template)


def create_messages(conversation):
    role_class_map = {
        "assistant": AIMessage,
        "user": HumanMessage,
        "system": SystemMessage,
    }
    return [
        role_class_map[message.role](content=message.content)
        for message in conversation
    ]


async def response_generator(messages) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    chat = ChatOpenAI(model=LLM, temperature=0, streaming=True, callbacks=[callback])

    task = asyncio.create_task(chat.agenerate(messages=[messages]))

    answer = ""
    try:
        async for token in callback.aiter():
            answer += token
            yield token
    except Exception as e:
        log.error("An error occurred while generating a response: %s", e)
    finally:
        callback.done.set()

    await task


def run_qabot_conversation(query: str, conversation: ConversationBody):
    db = get_qabot_vector_db()
    retriever = db.as_retriever()

    chat_history = create_messages(conversation=conversation.conversation)
    docs = retriever.invoke(input=query)

    system_message_prompt = get_qabot_system_message_prompt()
    prompt = system_message_prompt.format(context=docs)
    messages = [prompt] + chat_history

    return response_generator(messages)


def run_tsbot_conversation(query: str, conversation: ConversationBody):
    db = get_tsbot_vector_db()
    retriever = db.as_retriever()

    chat_history = create_messages(conversation=conversation.conversation)
    docs = retriever.invoke(input=query)

    system_message_prompt = get_tsbot_system_message_prompt()
    prompt = system_message_prompt.format(context=docs)
    messages = [prompt] + chat_history

    return response_generator(messages)
