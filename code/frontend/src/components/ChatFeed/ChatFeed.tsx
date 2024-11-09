import { useEffect, useRef, useState } from 'react';
import ChatMessageBox from '../ChatMessageBox';
import hljs from 'highlight.js';
import ruby from 'highlight.js/lib/languages/ruby';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import {
  Conversation,
  ConversationPayload,
  RoleEnum,
  sendQaBotConversationData,
  sendTsBotConversationData,
} from '../../services/chat-service';
import MessageList from '../MessageList';
import { toast } from 'react-toastify';
import { useMatches } from 'react-router-dom';

hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

export default function ChatFeed() {
  const [conversation, setConversation] = useState<Conversation[]>([
    {
      messageId: '',
      message: 'Hi, how can I help you today?',
      role: RoleEnum.Assistant,
      isStreaming: false,
    },
  ]);
  const [sessionId, setSessionId] = useState<string>('');
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [enableAutoScroll, setEnableAutoScroll] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const matches = useMatches();
  const pathname = matches[0].pathname;

  useEffect(() => {
    setSessionId(() => crypto.randomUUID());
  }, []);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop < lastScrollTop) {
        setEnableAutoScroll(() => false);
      } else {
        setEnableAutoScroll(() => true);
      }
      setLastScrollTop(() => scrollTop);
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollTop]);

  useEffect(() => {
    const lastMessage = lastMessageRef.current;
    if (lastMessage && enableAutoScroll) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              lastMessage.scrollIntoView({ behavior: 'instant' });
            }
          });
        },
        { threshold: 1 },
      );
      observer.observe(lastMessage);
      return () => observer.disconnect();
    }
  }, [conversation, enableAutoScroll]);

  function scrollToLastMessage(behavior: 'smooth' | 'instant') {
    const lastMessage = lastMessageRef.current;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior });
    }
  }

  function removeSkeletonLoader() {
    setConversation(prevMessages => {
      const messageIndex = prevMessages.findIndex(
        message => message.messageId === 'skeleton-loader',
      );
      if (messageIndex >= 0) {
        const newMessages = [...prevMessages];
        newMessages.splice(messageIndex, 1);
        return newMessages;
      }
      return prevMessages;
    });
  }

  function updateCurrentlyStreamingMessage(
    token: string,
    messageId: string,
    isStreaming: boolean,
  ) {
    setConversation(prevMessages => {
      const messageIndex = prevMessages.findIndex(
        message => message.messageId === messageId,
      );
      if (messageIndex >= 0) {
        const newMessages = [...prevMessages];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          message: newMessages[messageIndex].message + token,
          isStreaming,
        };
        return newMessages;
      } else {
        return [
          ...prevMessages,
          {
            messageId: messageId,
            message: token,
            role: 'assistant',
            isStreaming,
            messageFeedbackProvided: false,
          },
        ];
      }
    });
  }

  function readStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = new TextDecoder('utf-8');
    const currentStreamedMessageId = crypto.randomUUID();
    reader
      .read()
      .then(async function processChunk({ done, value }): Promise<void> {
        if (done) {
          setIsStreaming(() => false);
          updateCurrentlyStreamingMessage('', currentStreamedMessageId, false);
          return Promise.resolve();
        }
        setIsLoading(() => {
          removeSkeletonLoader();
          return false;
        });
        const token = decoder.decode(value);
        updateCurrentlyStreamingMessage(token, currentStreamedMessageId, true);
        return reader.read().then(processChunk);
      })
      .then(() => hljs.highlightAll())
      .catch(() =>
        toast.error('An error occurred.', {
          theme: localStorage.selectedTheme,
        }),
      );
  }

  async function streamResponse(newMessage: string) {
    setIsStreaming(() => true);

    const conversationPayload = conversation
      .filter(conv => {
        return conv.messageId !== '';
      })
      .map(conv => {
        return { content: conv.message, role: conv.role };
      });
    conversationPayload.push({ content: newMessage, role: RoleEnum.User });
    try {
      const response = pathname.includes('qabot')
        ? await sendQaBotConversationData(
            conversationPayload as ConversationPayload[],
          )
        : await sendTsBotConversationData(
            conversationPayload as ConversationPayload[],
          );

      if (response.status !== 200) {
        setIsLoading(() => {
          removeSkeletonLoader();
          return false;
        });
        toast.error('An error occurred.', {
          theme: localStorage.selectedTheme,
        });
        return;
      }

      if (!response.body) {
        setIsLoading(() => {
          removeSkeletonLoader();
          return false;
        });
        toast.error('An error occurred.', {
          theme: localStorage.selectedTheme,
        });
        return;
      }

      scrollToLastMessage('smooth');

      const reader = response.body.getReader();
      readStream(reader);
    } catch (error) {
      setIsLoading(() => {
        removeSkeletonLoader();
        return false;
      });
      toast.error('An error occurred.', {
        theme: localStorage.selectedTheme,
      });
      return;
    }
  }

  function handleSendMessage(newMessage: string) {
    if (isStreaming) {
      toast.info(
        'You cannot send messages while the assistant is responding.' +
          'Please wait for the assistant to finish typing.',
        {
          theme: localStorage.selectedTheme,
        },
      );
      return;
    }
    setConversation(prevMessages => [
      ...prevMessages,
      {
        messageId: crypto.randomUUID(),
        message: newMessage,
        role: 'user',
      },
    ]);
    setIsLoading(() => {
      setConversation(prevMessages => [
        ...prevMessages,
        {
          messageId: 'skeleton-loader',
          message: '',
          role: 'assistant',
          isStreaming: true,
        },
      ]);
      return true;
    });
    streamResponse(newMessage);
  }

  return (
    <>
      <MessageList
        conversation={conversation}
        isLoading={isLoading}
        sessionId={sessionId}
      />
      <div ref={lastMessageRef} />
      <ChatMessageBox
        sessionId={sessionId}
        conversation={conversation}
        onSendMessage={handleSendMessage}
      />
    </>
  );
}
