// app/components/chat/ChatInterface.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ShareChatButton } from './ShareChatButton'; // Добавляем импорт нового компонента
import { Message, Conversation } from '../../types';
import { ApiKeyForm } from '../profile/ApiKeyForm';
import './ChatInterface.page.css';

export const ChatInterface: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile } = useAuth();
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  // Добавляем состояние для информации о выбранном разговоре
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    title: string;
    share_id: string | null;
    is_shared: boolean;
  } | null>(null);

  useEffect(() => {
    if (!profile?.yandex_api_key) {
      setShowApiKeyForm(true);
    } else {
      setShowApiKeyForm(false);
    }
  }, [profile?.yandex_api_key]);

  useEffect(() => {
    if (!selectedConversationId) {
      setSelectedConversation(null);
      return;
    }

    // Обновленная функция для получения данных разговора и сообщений
    const fetchConversationData = async () => {
      // Получаем информацию о выбранном разговоре
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('id, title, share_id, is_shared')
        .eq('id', selectedConversationId)
        .single();

      if (conversationError) {
        console.error('Error fetching conversation:', conversationError);
      } else {
        setSelectedConversation(conversationData);
      }

      // Получаем сообщения
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        setMessages(messagesData as Message[]);
      }
    };

    fetchConversationData();

    // Подписываемся на изменения сообщений
    const subscription = supabase
      .channel(`messages_${selectedConversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversationId}`,
      }, (payload) => {
        console.log('Новое сообщение получено:', payload);
        // Проверяем, нет ли уже такого сообщения
        setMessages(currentMessages => {
          const newMessage = payload.new as Message;
          const messageExists = currentMessages.some(msg => msg.id === newMessage.id);
          return messageExists ? currentMessages : [...currentMessages, newMessage];
        });
      })
      .subscribe();

    // Подписываемся на изменения в самом разговоре (изменение share_id, is_shared и т.д.)
    const conversationSubscription = supabase
      .channel(`conversation_${selectedConversationId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `id=eq.${selectedConversationId}`,
      }, () => {
        fetchConversationData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      conversationSubscription.unsubscribe();
    };
  }, [selectedConversationId]);

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'Новый диалог',
        is_shared: false, // По умолчанию, чат не доступен по ссылке
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating new conversation:', error);
    } else {
      setSelectedConversationId(data.id);
      setMessages([]);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !selectedConversationId || !profile?.yandex_api_key) return;

    setLoading(true);

    try {
      console.log('Sending message to API:', { conversationId: selectedConversationId, messagePreview: content.substring(0, 30) });
      
      // Используем API Route для отправки сообщения
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          message: content,
        }),
        // Важно для работы с сессией и cookies
        credentials: 'same-origin', 
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке сообщения');
      }
      
      console.log('Message sent successfully');
      
      // Обновляем сообщения локально
      if (data.userMessage && data.assistantMessage) {
        setMessages(currentMessages => [...currentMessages, data.userMessage, data.assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // В случае ошибки показываем сообщение пользователю
      alert(`Ошибка: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleConversationSelect = (id: string) => {
    setSelectedConversationId(id);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="chat-container">
      {!isSidebarOpen && (
        <button className="burger-menu" onClick={toggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="close-menu" onClick={toggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelect={handleConversationSelect}
          onNewConversation={createNewConversation}
        />
      </div>
      
      <div className="chat-main">
        {/* Добавляем панель с информацией о чате и кнопкой "Поделиться" */}
        {selectedConversation && (
        <div className="chat-header">
          <div className="chat-title">
            <h2>{selectedConversation.title}</h2>
            {selectedConversation.is_shared && (
              <span className="share-badge">Доступен для чтения</span>
            )}
          </div>
          
          <ShareChatButton
            conversationId={selectedConversation.id}
            shareId={selectedConversation.share_id}
            isShared={selectedConversation.is_shared}
          />
          </div>
        )}
        
        {showApiKeyForm ? (
          <div className="api-key-form-container">
            <ApiKeyForm />
          </div>
        ) : (
          <>
            {selectedConversationId ? (
              <div className="messages-container">
                <MessageList messages={messages} loading={loading} />
                <MessageInput 
                  onSendMessage={sendMessage} 
                  disabled={!profile?.yandex_api_key || !selectedConversationId} 
                />
              </div>
            ) : (
              <div className="welcome-screen">
                <div className="welcome-content">
                  <h2>Добро пожаловать в чат с Yandex GPT</h2>
                  <p>Выберите существующий диалог или создайте новый</p>
                  <button
                    onClick={createNewConversation}
                    className="new-chat-button"
                  >
                    Новый диалог
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
