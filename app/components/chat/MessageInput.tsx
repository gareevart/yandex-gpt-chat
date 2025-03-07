// app/components/chat/MessageInput.tsx
'use client';

import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex rounded-lg border overflow-hidden">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled || isSubmitting}
          placeholder={disabled ? "Для начала диалога необходимо добавить API ключ" : "Введите сообщение..."}
          className="flex-1 px-4 py-2 outline-none resize-none"
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
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Отправить
        </button>
      </div>
    </form>
  );
};
