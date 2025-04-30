// app/shared/[shareId]/SharedChatView.tsx (обновление с кнопкой обновления)
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const fetchMessages = async () => {
    const wasRefreshing = refreshing;
    if (!wasRefreshing) setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Ошибка при загрузке сообщений:', error);
      } else {
        setMessages(data as Message[]);
        setLastRefreshed(new Date());
      }
    } catch (error) {
      console.error('Неожиданная ошибка:', error);
    } finally {
      if (!wasRefreshing) setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Загружаем сообщения при первоначальной загрузке
  useEffect(() => {
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
        setLastRefreshed(new Date());
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);
  
  // Функция для ручного обновления чата
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };
  
  // Форматируем время последнего обновления
  const formattedLastRefreshed = lastRefreshed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  return (
    <div className="shared-chat-container">
      <div className="shared-chat-toolbar">
        <div className="shared-chat-refresh-info">
          Последнее обновление: {formattedLastRefreshed}
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing || loading}
          className="shared-chat-refresh-button"
        >
          {refreshing ? 'Обновление...' : 'Обновить чат'}
        </button>
      </div>
      
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
