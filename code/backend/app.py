import os
import hashlib
import secrets
import shutil
import nltk
import psycopg
from db import create_all, get_database_url
from log import log
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from conversation import (
    run_qabot_conversation,
    run_tsbot_conversation,
    ConversationBody,
)
from conversation_feedback import save_conversation_feedback, ConversationFeedbackBody
from message_feedback import (
    MessageFeedbackModel,
    MessageFeedbackBody,
    save_message_feedback,
    get_message_feedbacks_by_date,
)
from typing import Annotated
from ingest import ingest_docs
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials

load_dotenv()

app_env = os.getenv("APP_ENV", "development")
if app_env == "production":
    nltk.data.path.append(os.path.join("data", "nltk_data"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all()
    ingest_docs()
    yield


# syntaxHighlight.theme: agate (default), arta, monokai, nord, obsidian, tomorrow-night, and idea
app = FastAPI(
    root_path="/api/v1",
    docs_url="/swagger",
    swagger_ui_parameters={"syntaxHighlight.theme": "arta"},
    lifespan=lifespan,
)
security = HTTPBasic()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def hash_password(password: str) -> str:
    sha256_hash = hashlib.sha256()
    sha256_hash.update(password.encode("utf-8"))
    hashed_value = sha256_hash.hexdigest()
    return hashed_value


def is_authenticated(credentials: Annotated[HTTPBasicCredentials, Depends(security)]):
    current_username_bytes = credentials.username.encode("utf8")
    correct_username_bytes = os.getenv("USERNAME", "").encode("utf8")
    is_correct_username = secrets.compare_digest(
        current_username_bytes, correct_username_bytes
    )
    current_password_bytes = hash_password(credentials.password).encode("utf8")
    correct_password_bytes = os.getenv("PASSWORD_HASH", "").encode("utf8")
    is_correct_password = secrets.compare_digest(
        current_password_bytes, correct_password_bytes
    )
    return is_correct_username and is_correct_password


@app.get("/")
async def health_check():
    try:
        connection_string = get_database_url()
        with psycopg.connect(connection_string) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
    except Exception:
        return JSONResponse(content={"status": "unhealthy"}, status_code=500)

    return JSONResponse(content={"status": "healthy"}, status_code=200)


@app.get("/users/me")
async def get_auth_user():
    # raise HTTPException(
    #     status_code=status.HTTP_401_UNAUTHORIZED,
    #     detail="Unauthorized",
    # )
    return JSONResponse(
        content={
            "user_id": "291dae30-1169-4d77-811a-f5a2889ea6d9",
            "email": "johndoe@cloud.upwork.com",
            "first_name": "John",
            "last_name": "Doe",
        },
        status_code=200,
    )


@app.post("/qabot/conversation")
async def qabot_conversation(conversation_body: ConversationBody):
    try:
        conv = conversation_body.conversation
        query = conv[-1].content
        return StreamingResponse(
            run_qabot_conversation(query, conversation_body),
            media_type="text/event-stream",
        )
    except Exception as e:
        log.error("Unexpected error occurred: %s", e)
        return JSONResponse(content={"status": "failed"}, status_code=500)


@app.post("/tsbot/conversation")
async def tsbot_conversation(conversation_body: ConversationBody):
    try:
        conv = conversation_body.conversation
        query = conv[-1].content
        return StreamingResponse(
            run_tsbot_conversation(query, conversation_body),
            media_type="text/event-stream",
        )
    except Exception as e:
        log.error("Unexpected error occurred: %s", e)
        return JSONResponse(content={"status": "failed"}, status_code=500)


@app.post("/conversation/feedback", status_code=201)
async def conversation_feedback(feedback: ConversationFeedbackBody):
    save_conversation_feedback(feedback)


@app.post(
    "/message/feedback",
    status_code=201,
    responses={
        409: {
            "content": {
                "application/json": {
                    "example": {"detail": "Feedback already exists for this message."}
                }
            }
        }
    },
)
async def message_feedback(feedback: MessageFeedbackBody):
    save_message_feedback(feedback)


@app.get("/message/feedback")
async def get_message_feedbacks() -> list[MessageFeedbackModel]:
    return get_message_feedbacks_by_date()


@app.post("/ingest")
async def ingest(credentials: Annotated[HTTPBasicCredentials, Depends(security)]):
    try:
        if not is_authenticated(credentials):
            log.warning("Unauthorized request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Basic"},
            )
        ingested_docs = ingest_docs()
        return JSONResponse(content={"ingested_docs": ingested_docs}, status_code=200)
    except Exception as e:
        log.error("Unexpected error occurred during document ingestion: %s", e)
        return JSONResponse(content={"status": "failed"}, status_code=500)


@app.post("/update-docs")
async def update_docs(
    # credentials: Annotated[HTTPBasicCredentials, Depends(security)],
    file: UploadFile = File(...),
):
    try:
        # if not is_authenticated(credentials):
        #     log.warning("Unauthorized request")
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Incorrect username or password",
        #         headers={"WWW-Authenticate": "Basic"},
        #     )
        docs_root_dir = os.path.join("/", "data", "docs")
        if os.path.exists(docs_root_dir) and os.path.isdir(docs_root_dir):
            shutil.rmtree(docs_root_dir)
        with open(f"/data/uploaded_{file.filename}", "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        shutil.unpack_archive(f"/data/uploaded_{file.filename}", docs_root_dir)
        ingested_docs = ingest_docs()
        return JSONResponse(content={"ingested_docs": ingested_docs}, status_code=200)
    except Exception as e:
        log.error("Unexpected error occurred: %s", e)
        return JSONResponse(content={"status": "error"}, status_code=500)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8080)
