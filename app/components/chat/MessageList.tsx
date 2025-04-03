// components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import styles from "./page.module.css";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !loading) {
    return (
      <div className={styles.emptyState}>
        Начните новый диалог с Yandex GPT
      </div>
    );
  }

  return (
    <div className={styles.messageContainer}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={message.role === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper}
        >
          <div
            className={message.role === 'user' ? styles.userMessage : styles.botMessage}
          >
            <div className={styles.messageSender}>
              {message.role === 'user' ? 'Вы' : 'Yandex GPT'}
            </div>
            <div className={styles.messageContent}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className={styles.left_message}>
          <div className={styles.botMessage}>
            <div className={styles.messageSender}>YaGPT</div>
            <div className={styles.typingIndicator}>
              <div className={styles.dot} style={{ animationDelay: '0ms' }}></div>
              <div className={styles.dot} style={{ animationDelay: '150ms' }}></div>
              <div className={styles.dot} style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
