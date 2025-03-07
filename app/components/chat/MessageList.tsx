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
      <div className="flex items-center justify-center h-full text-gray-500">
        Начните новый диалог с Yandex GPT
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto flex-1">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`mb-4 ${
            message.role === 'user' ? 'text-right' : 'text-left'
          }`}
        >
          <div
            className={`inline-block p-3 rounded-lg max-w-[80%] ${
              message.role === 'user'
                ? 'bg-blue-100 text-blue-900'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="text-xs font-bold mb-1">
              {message.role === 'user' ? 'Вы' : 'Yandex GPT'}
            </div>
            <div className="prose">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className={styles.left_message}>
          <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-900">
            <div className="text-xs font-bold mb-1">YaGPT</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
