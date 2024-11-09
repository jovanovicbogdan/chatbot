import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faSmile } from '@fortawesome/free-solid-svg-icons';
import './Message.css';
import { Conversation, Role, RoleEnum } from '../../services/chat-service';
import { ReactNode } from 'react';
import MessageFeedback from '../MessageFeedback';

type MessageProps = {
  children: ReactNode;
  role: Role;
  sessionId: string;
  currConversation: Conversation;
  conversation: Conversation[];
};
export default function Message({
  children,
  role,
  sessionId,
  currConversation,
  conversation,
}: MessageProps) {
  let bgColorClassName, userBgColorClassName;

  if (role === RoleEnum.Assistant) {
    bgColorClassName = 'bg-goldenYellow';
    userBgColorClassName = '';
  } else {
    bgColorClassName = 'bg-salmonRed';
    userBgColorClassName = 'bg-gray-200 dark:bg-darkGray';
  }

  return (
    <div
      className={`relative z-[-1] flex gap-x-4 ${userBgColorClassName} p-4 rounded-md mx-auto mb-4 md:w-[740px] sm:w-10/12`}
    >
      <div
        className={`flex justify-center items-center ${bgColorClassName} rounded-lg w-9 h-9`}
      >
        {role === RoleEnum.Assistant ? (
          <FontAwesomeIcon icon={faRobot} size="lg" color="#ffffff" />
        ) : (
          <FontAwesomeIcon icon={faSmile} size="lg" color="#ffffff" />
        )}
      </div>
      <div
        className={`relative z-[-1] w-full dark:text-lightGray ${
          role === RoleEnum.Assistant ? 'assistant-output' : 'flex items-center'
        }`}
      >
        {children}
        {role === RoleEnum.Assistant &&
          !currConversation.isStreaming &&
          currConversation.messageId && (
            <MessageFeedback
              sessionId={sessionId}
              messageId={currConversation.messageId}
              conversation={conversation}
            />
          )}
      </div>
    </div>
  );
}
