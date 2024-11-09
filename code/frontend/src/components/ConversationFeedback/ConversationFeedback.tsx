import { ThumbsDown, ThumbsUp } from 'lucide-react';
import Modal from '../Modal';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  ConversationFeedbackPayload,
  ConversationRatingType,
  ConversationRatingTypeEnum,
  sendConversationFeedbackData,
} from '../../services/feedback-service';
import { Conversation } from '../../services/chat-service';
import { useMatches } from 'react-router-dom';

type ConversationFeedbackProps = {
  sessionId: string;
  conversation: Conversation[];
  showConversationFeedbackHandler: () => void;
};

export default function ConversationFeedback({
  sessionId,
  conversation,
  showConversationFeedbackHandler,
}: ConversationFeedbackProps) {
  const [selectedRating, setSelectedRating] =
    useState<ConversationRatingType | null>(null);
  const [feedbackComment, setFeedbackComment] = useState<string | null>(null);
  const matches = useMatches();
  const pathname = matches[0].pathname;

  async function sendConversationFeedback() {
    if (!selectedRating) return;
    const feedback: ConversationFeedbackPayload = {
      session_id: sessionId,
      rating: selectedRating,
      conversation: JSON.stringify(conversation),
      comment: feedbackComment,
    };
    await sendConversationFeedbackData(feedback);
    showConversationFeedbackHandler();
  }

  return (
    <Modal onBackdropClickHandler={showConversationFeedbackHandler}>
      <h6 className="text-lg mb-4 font-bold dark:text-white">
        How was your overall experience with{' '}
        {pathname.includes('qabot') ? 'QA' : 'TS'} bot?
      </h6>
      <ConversationRatingSection
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
      />
      {selectedRating === ConversationRatingTypeEnum.ThumbsDown && (
        <ConversationCommentSection setFeedbackComment={setFeedbackComment} />
      )}
      <div className="flex justify-content mt-4">
        <button
          className={`${
            !selectedRating ||
            (selectedRating === ConversationRatingTypeEnum.ThumbsDown &&
              !feedbackComment)
              ? 'cursor-not-allowed opacity-50'
              : ''
          } feedback-submit-btn text-blue-500 font-medium px-4 py-2 rounded-full focus:outline-none dark:text-lightSkyBlue`}
          disabled={
            !selectedRating ||
            (selectedRating === ConversationRatingTypeEnum.ThumbsDown &&
              !feedbackComment)
          }
          onClick={() => sendConversationFeedback()}
        >
          Submit
        </button>
        <button
          onClick={() => showConversationFeedbackHandler()}
          className="feedback-submit-btn text-darkGray font-medium px-4 py-2 rounded-full focus:outline-none dark:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

function ConversationRatingSection({
  selectedRating,
  setSelectedRating,
}: {
  selectedRating: ConversationRatingType | null;
  setSelectedRating: Dispatch<SetStateAction<ConversationRatingType | null>>;
}) {
  const [selectedRatingClassName, setSelectedRatingClassName] = useState('');

  useEffect(() => {
    const selectedRatingClassNames =
      'text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500';
    if (selectedRating) {
      setSelectedRatingClassName(selectedRatingClassNames);
    } else {
      setSelectedRatingClassName('');
    }
  }, [selectedRating]);

  return (
    <div className="flex items-center justify-around h-20">
      <div
        className={`${
          selectedRating === ConversationRatingTypeEnum.ThumbsUp
            ? selectedRatingClassName
            : ''
        } p-4`}
      >
        <ThumbsUp
          className="cursor-pointer"
          onClick={() =>
            setSelectedRating(prev =>
              prev === ConversationRatingTypeEnum.ThumbsUp
                ? null
                : ConversationRatingTypeEnum.ThumbsUp,
            )
          }
        />
      </div>
      <div
        className={`${
          selectedRating === ConversationRatingTypeEnum.ThumbsDown
            ? selectedRatingClassName
            : ''
        } p-4`}
      >
        <ThumbsDown
          className="cursor-pointer"
          onClick={() =>
            setSelectedRating(prev =>
              prev === ConversationRatingTypeEnum.ThumbsDown
                ? null
                : ConversationRatingTypeEnum.ThumbsDown,
            )
          }
        />
      </div>
    </div>
  );
}

function ConversationCommentSection({
  setFeedbackComment,
}: {
  setFeedbackComment: Dispatch<SetStateAction<string | null>>;
}) {
  return (
    <>
      <h6 className="text-lg my-4 font-bold dark:text-white">
        What can we improve?
      </h6>
      <div>
        <input
          type="text"
          id="large-input"
          placeholder="Additional comments"
          className="block w-full mt-6 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={e => setFeedbackComment(() => e.target.value)}
        />
      </div>
    </>
  );
}
