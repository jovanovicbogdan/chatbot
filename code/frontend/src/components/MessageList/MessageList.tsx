import { Conversation, Role, RoleEnum } from '../../services/chat-service';
import Message from '../Message';
import SkeletonLoader from '../shared/SkeletonLoader';
import remarkGfm from 'remark-gfm';
// import rehypeHighlight from 'rehype-highlight';
import './MessageList.css';
import { MemoizedReactMarkdown } from '../MemoizedReactMarkdown';

type MessageListProps = {
  conversation: Conversation[];
  isLoading: boolean;
  sessionId: string;
};
export default function MessageList({
  conversation,
  isLoading,
  sessionId,
}: MessageListProps) {
  return (
    <div>
      {conversation.map((conv, index) => (
        <Message
          key={index}
          role={conv.role}
          sessionId={sessionId}
          currConversation={conv}
          conversation={conversation}
        >
          {isLoading && conversation.length - 1 === index ? (
            <SkeletonLoader />
          ) : (
            <MessageContent role={conv.role} message={conv.message} />
          )}
        </Message>
      ))}
    </div>
  );
}

type MessageContentProps = {
  role: Role;
  message: string;
};
function MessageContent({ role, message }: MessageContentProps) {
  if (role === RoleEnum.Assistant) {
    return (
      <MemoizedReactMarkdown
        remarkPlugins={[remarkGfm]}
        // rehypePlugins={[rehypeHighlight]}
      >
        {message}
      </MemoizedReactMarkdown>
    );
  } else {
    return <p>{message}</p>;
  }
}
