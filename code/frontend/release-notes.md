# About

QA bot is a web application built with Python, LangChain, FastAPI and pgvector on the backend and ReactJS on a frontend. As initial release, QA bot can answer questions only about JET framework, e.g. "What is JET?", "Does it support visual testing?", "How to get started with JET?", etc.

## v0.0.1

**Backend**:

- Initial application architecture, skeleton and project setup
- Functionality provided for _ingesting_ the QA documents into `pgvector` database.
- QA documents have been exported as PDF from Confluence (only JET documents for the initial release), converted to vector embeddings and stored into vector database.
- Implement LangChain conversation functionality to perform database similarity search based on user query, pass db results to the LLM (`gpt-4-32k`) along with the user query and get a response.
- POST `/api/v1/conversation` generates SSE (server-sent events) as a response. Conversation won't be persisted and on every page refresh conversation will be lost (client is responsible for maintaining chat history).
- Very deterministic approach, for the same question the answer is going to be always the same. This option is configurable on the server side.

**Frontend**:

- The response stream received from a server (`text/event-stream`) is a text representation of a markdown and it's automatically rendered as HTML using markdown parser `react-markdown` along with the plugin to perform syntax highlighting `rehype-highlight`.
- Automatic scrolling: The page will scroll automatically when the user reaches the bottom as new content appears. This auto-scrolling stops if the user scrolls up, and resumes when the user scrolls back down to the bottom.
- Show server errors to the user as _Toast_ error messages.
- Show a warning _Toast_ message to a user when he tries to send a message while assistent is responding.
