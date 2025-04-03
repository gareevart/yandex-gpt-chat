// app/components/chat/MessageInput.tsx
'use client';

import React, { useState } from 'react';
import './MessageInput.module.css';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(message);
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <div className="input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled || isSubmitting}
          placeholder={disabled ? "Для начала диалога необходимо добавить API ключ" : "Введите сообщение..."}
          className="message-textarea"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled || isSubmitting}
          className="send-button"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </form>
  );
};
