// app/shared/[shareId]/SharedChatView.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { MessageList } from '@/app/components/chat/MessageList';
import { Message } from '@/app/types';
import './SharedChatView.module.css';

interface SharedChatViewProps {
  conversationId: string;
  ownerEmail: string;
}

export default function SharedChatView({ conversationId, ownerEmail }: SharedChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Загружаем сообщения
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Ошибка при загрузке сообщений:', error);
      } else {
        setMessages(data as Message[]);
      }
      setLoading(false);
    };
    
    fetchMessages();
    
    // Подписываемся на обновления
    const subscription = supabase
      .channel(`shared_messages_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(currentMessages => {
          const messageExists = currentMessages.some(msg => msg.id === newMessage.id);
          return messageExists ? currentMessages : [...currentMessages, newMessage];
        });
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);
  
  return (
    <div className="shared-chat-container">
      <div className="messages-area">
        <MessageList messages={messages} loading={loading} />
      </div>
      
      {/* Информационное сообщение вместо формы отправки */}
      <div className="guest-info-banner">
        <p>Вы просматриваете чат в режиме "только для чтения"</p>
        <p className="guest-info-secondary">Владелец чата: {ownerEmail}</p>
      </div>
    </div>
  );
}
