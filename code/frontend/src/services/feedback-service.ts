import { toast } from 'react-toastify';
import { API_VERSION, BASE_API_URL } from '../utils/constants';

export type MessageFeedbackPayload = {
  session_id: string;
  message_id: string;
  conversation: string;
  comment?: string | null;
  category_tag?: string | null;
  category_tag_choices?: string[] | null;
};

export async function sendMessageFeedbackData(
  feedback: MessageFeedbackPayload,
): Promise<Response> {
  const MESSAGE_FEEDBACK_API_URL = `${BASE_API_URL}/${API_VERSION}/message/feedback`;
  try {
    const response = await fetch(MESSAGE_FEEDBACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    toast('Thank you for your feedback!', {
      theme: localStorage.selectedTheme,
    });
    return response;
  } catch (error) {
    toast.error('Failed to send feedback data', {
      theme: localStorage.selectedTheme,
    });
    throw error;
  }
}

export const ConversationRatingTypeEnum = {
  ThumbsUp: 'thumbsUp',
  ThumbsDown: 'thumbsDown',
} as const;

export type ConversationRatingType =
  (typeof ConversationRatingTypeEnum)[keyof typeof ConversationRatingTypeEnum];

export type ConversationFeedbackPayload = {
  session_id: string;
  rating: ConversationRatingType;
  conversation: string;
  comment?: string | null;
};

export async function sendConversationFeedbackData(
  feedback: ConversationFeedbackPayload,
) {
  const CONVERSATION_FEEDBACK_API_URL = `${BASE_API_URL}/${API_VERSION}/conversation/feedback`;
  try {
    const response = await fetch(CONVERSATION_FEEDBACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    toast('Thank you for your feedback!', {
      theme: localStorage.selectedTheme,
    });
    return response;
  } catch (error) {
    toast.error('Failed to send feedback data', {
      theme: localStorage.selectedTheme,
    });
    throw error;
  }
}
