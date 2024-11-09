import psycopg
from log import log
from db import execute_query, get_database_url
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from fastapi import status, HTTPException


class MessageFeedbackModel(BaseModel):
    message_feedback_id: UUID
    session_id: UUID
    message_id: UUID
    conversation: str
    comment: Optional[str] = None
    category_tag: str
    category_tag_choices: list[str]
    created_at: str


class MessageFeedbackBody(BaseModel):
    session_id: str
    message_id: str
    conversation: str
    comment: Optional[str] = None
    category_tag: str
    category_tag_choices: list[str]


def save_message_feedback(feedback: MessageFeedbackBody):
    with psycopg.connect(get_database_url()) as conn:
        with conn.cursor() as cur:
            feedback_exists = find_message_feedback_by_message_id(
                cur, feedback.message_id
            )
            if feedback_exists:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Feedback already exists for this message.",
                )
            insert_message_feedback(cur, feedback)


def find_message_feedback_by_message_id(cur, message_id: str):
    find_message_feedback_query = (
        "SELECT * FROM message_feedback WHERE message_id = %s FOR UPDATE;"
    )
    cur.execute(find_message_feedback_query, (message_id,))
    return cur.fetchall()


# def update_message_feedback(cur, feedback: MessageFeedbackBody):
#     update_message_feedback_query = """
#             UPDATE message_feedback
#             SET session_id = %s, conversation = %s, comment = %s, category_tag = %s, category_tag_choices = %s
#             WHERE message_id = %s
#             """
#     cur.execute(
#         update_message_feedback_query,
#         (
#             feedback.session_id,
#             feedback.conversation,
#             feedback.comment,
#             feedback.category_tag,
#             feedback.category_tag_choices,
#             feedback.message_id,
#         ),
#     )


def insert_message_feedback(cur, feedback: MessageFeedbackBody):
    insert_message_feedback_query = """
            INSERT INTO message_feedback (session_id, message_id, conversation, comment, category_tag, category_tag_choices)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
    cur.execute(
        insert_message_feedback_query,
        (
            feedback.session_id,
            feedback.message_id,
            feedback.conversation,
            feedback.comment,
            feedback.category_tag,
            feedback.category_tag_choices,
        ),
    )


def get_message_feedbacks_by_date() -> list[MessageFeedbackModel]:
    # query = "SELECT * FROM message_feedback WHERE DATE(created_at) = %s;"
    query = "SELECT * FROM message_feedback ORDER BY message_feedback_id DESC LIMIT 50;"
    message_feedbacks = []
    result = execute_query(query=query, is_select=True)
    # result = execute_query(query=query, params=("2024-05-29",), is_select=True)
    for row in result:
        message_feedback = MessageFeedbackModel(
            message_feedback_id=row[0],
            session_id=row[1],
            message_id=row[2],
            conversation=row[3],
            comment=row[4],
            category_tag=row[5],
            category_tag_choices=row[6],
            created_at=row[7].strftime("%Y-%m-%dT%H:%M:%S"),
        )
        message_feedbacks.append(message_feedback)
    return message_feedbacks
