import { ThumbsDown } from 'lucide-react';
import { Conversation } from '../../services/chat-service';
import MessageFeedbackCategoryTag from './MessageFeedbackCategoryTag';
import { Dispatch, SetStateAction, useState } from 'react';
import {
  MessageFeedbackPayload,
  sendMessageFeedbackData,
} from '../../services/feedback-service';

type MessageFeedbackProps = {
  sessionId: string;
  messageId: string;
  conversation: Conversation[];
};
export default function MessageFeedback({
  sessionId,
  messageId,
  conversation,
}: MessageFeedbackProps) {
  const [showCategoryTag, setShowCategoryTag] = useState(false);

  async function sendMessageFeedback(
    feedbackComment?: string | null,
    categoryTag?: string | null,
    categoryTags?: string[] | null,
  ) {
    const message = conversation.find(conv => conv.messageId === messageId);
    if (!message) return;
    const feedback: MessageFeedbackPayload = {
      session_id: sessionId,
      message_id: message.messageId,
      conversation: JSON.stringify(conversation),
      comment: feedbackComment,
      category_tag: categoryTag,
      category_tag_choices: categoryTags,
    };
    await sendMessageFeedbackData(feedback);
    setShowCategoryTag(() => false);
  }

  return (
    <>
      <CategoryTags
        sendMessageFeedback={sendMessageFeedback}
        showCategoryTag={showCategoryTag}
        setShowCategoryTag={setShowCategoryTag}
      />
    </>
  );
}

type CategoryTagsProps = {
  sendMessageFeedback: (
    feedbackComment?: string | null,
    categoryTag?: string | null,
    categoryTags?: string[] | null,
  ) => void;
  showCategoryTag: boolean;
  setShowCategoryTag: Dispatch<SetStateAction<boolean>>;
};
function CategoryTags({
  sendMessageFeedback,
  showCategoryTag,
  setShowCategoryTag,
}: CategoryTagsProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [thumbsDownClassName, setThumbsDownClassName] = useState('');

  function messageFeedbackSubmit(
    feedbackComment?: string | null,
    categoryTag?: string | null,
    categoryTags?: string[] | null,
  ) {
    setFeedbackSubmitted(() => true);
    setThumbsDownClassName(() => 'text-red-400');
    sendMessageFeedback(feedbackComment, categoryTag, categoryTags);
  }

  return (
    <>
      <button
        className="text-gray-400 mb-4 cursor-pointer hover:text-black dark:hover:text-white"
        onClick={() => setShowCategoryTag(() => !showCategoryTag)}
      >
        <ThumbsDown size={18} className={thumbsDownClassName} />
      </button>
      {showCategoryTag && !feedbackSubmitted && (
        <MessageFeedbackCategoryTag
          sendMessageFeedback={messageFeedbackSubmit}
        />
      )}
    </>
  );
}
