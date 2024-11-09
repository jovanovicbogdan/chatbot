import React, { useRef, useState } from 'react';
import './ChatMessageBox.css';
import { SendHorizontal } from 'lucide-react';
// import Help from '../Help';
import ConversationFeedback from '../ConversationFeedback/ConversationFeedback';
import { Conversation } from '../../services/chat-service';
import { useMatches } from 'react-router-dom';

type ChatMessageProps = {
  sessionId: string;
  conversation: Conversation[];
  onSendMessage: (message: string) => void;
};

export default function ChatMessageBox({
  sessionId,
  conversation,
  onSendMessage,
}: ChatMessageProps) {
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState<string>('');
  const [showConversationFeedbackModal, setShowConversationFeedbackModal] =
    useState(false);
  const matches = useMatches();
  const pathname = matches[0].pathname;

  function resetHeights() {
    const textarea = textareaRef.current;
    const divider = dividerRef.current;
    if (textarea && divider) {
      textarea.style.height = 'initial';
      divider.style.height = 'initial';
    }
  }

  function recalculateHeight(
    textarea: HTMLTextAreaElement,
    divider: HTMLDivElement,
  ) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    divider.style.height = `${textarea.scrollHeight + 80}px`;
  }

  function handleInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const textarea = textareaRef.current;
    const divider = dividerRef.current;
    if (textarea && divider) {
      setText(() => event.target.value);
      recalculateHeight(textarea, divider);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (text.trim()) {
        onSendMessage(text);
        setText(() => '');
        resetHeights();
      }
    }
  }

  function showConversationFeedbackHandler() {
    setShowConversationFeedbackModal(() => !showConversationFeedbackModal);
  }

  return (
    <div className="relative z-[-1]">
      <div ref={dividerRef} className="min-h-32"></div>
      <div className="fixed z-[-1] flex justify-center items-end gap-3 inset-x-0 bottom-0 min-h-32 bg-background dark:bg-dark-background">
        <div className="relative flex items-center w-[400px] md:w-[770px]">
          <textarea
            rows={1}
            ref={textareaRef}
            value={text}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="bg-gray-200 resize-none overflow-y-auto rounded-md mx-auto mb-12 pl-2 pr-10 py-[10px] max-h-32 w-[760px] placeholder:text-gray-500 dark:bg-darkGray dark:text-white dark:placeholder:text-gray-400"
            placeholder={`Message ${
              pathname.includes('qabot') ? 'QA' : 'TS'
            } bot...`}
            autoFocus
          ></textarea>
          <button
            type="button"
            disabled={!text.trim()}
            className={`absolute right-2 z-10 mb-12 ${
              text.trim()
                ? 'cursor-pointer text-gray-600'
                : 'disabled:opacity-50'
            }`}
            onClick={() => {
              onSendMessage(text);
              setText(() => '');
              resetHeights();
            }}
          >
            <span>
              <SendHorizontal
                size={38}
                className="p-2 rounded-md hover:bg-salmonRed hover:text-white dark:text-white"
              />
            </span>
          </button>
        </div>
        <p className="absolute bottom-4 text-sm text-darkGray dark:text-gray-400">
          {pathname.includes('qabot') ? 'QA' : 'TS'} bot can produce mistakes.
          Feel free to leave anonymous{' '}
          <button
            className="text-blue-500 hover:underline"
            onClick={() => showConversationFeedbackHandler()}
          >
            feedback
          </button>
          .
        </p>
        {/* <Help /> */}
        {showConversationFeedbackModal && (
          <ConversationFeedback
            sessionId={sessionId}
            conversation={conversation}
            showConversationFeedbackHandler={showConversationFeedbackHandler}
          />
        )}
      </div>
    </div>
  );
}
