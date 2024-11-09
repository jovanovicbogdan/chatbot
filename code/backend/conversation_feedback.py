from db import execute_query
from pydantic import BaseModel
from enum import Enum
from fastapi import HTTPException, status
from typing import Optional


class RatingType(str, Enum):
    thumbsUp = "thumbsUp"
    thumbsDown = "thumbsDown"


class ConversationFeedbackBody(BaseModel):
    session_id: str
    rating: RatingType
    conversation: str
    comment: Optional[str] = None


def save_conversation_feedback(feedback: ConversationFeedbackBody):
    session_id = feedback.session_id
    if feedback.rating == RatingType.thumbsDown and not feedback.comment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment is required for thumbs down rating.",
        )
    find_conversation_query = (
        "SELECT session_id FROM conversation_feedback WHERE session_id = %s"
    )
    result = execute_query(find_conversation_query, (session_id,), True)
    if result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conversation feedback already provided.",
        )
    insert_conversation_feedback_query = """
            INSERT INTO conversation_feedback (session_id, rating, conversation, comment)
            VALUES (%s, %s, %s, %s)
            """
    execute_query(
        insert_conversation_feedback_query,
        (session_id, feedback.rating, feedback.conversation, feedback.comment),
    )
