import { API_VERSION, BASE_API_URL } from '../utils/constants';

export const RoleEnum = {
  Assistant: 'assistant',
  User: 'user',
} as const;

export type Role = (typeof RoleEnum)[keyof typeof RoleEnum];

export type Conversation = {
  messageId: string;
  message: string;
  role: Role;
  isStreaming?: boolean;
};

export type ConversationPayload = {
  content: string;
  role: Role;
};

export async function sendQaBotConversationData(
  conversation: ConversationPayload[],
): Promise<Response> {
  const CONVERSATION_API_URL = `${BASE_API_URL}/${API_VERSION}/qabot/conversation`;
  return await fetch(CONVERSATION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ conversation }),
  });
}

export async function sendTsBotConversationData(
  conversation: ConversationPayload[],
): Promise<Response> {
  const CONVERSATION_API_URL = `${BASE_API_URL}/${API_VERSION}/tsbot/conversation`;
  return await fetch(CONVERSATION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ conversation }),
  });
}
