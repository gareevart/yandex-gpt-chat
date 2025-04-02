// app/components/chat/ChatInterface.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
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

  useEffect(() => {
    if (!profile?.yandex_api_key) {
      setShowApiKeyForm(true);
    } else {
      setShowApiKeyForm(false);
    }
  }, [profile?.yandex_api_key]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data as Message[]);
      }
    };

    fetchMessages();

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

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversationId]);

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'Новый диалог',
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
      
      <div className="main-content">
        {showApiKeyForm ? (
          <div className="welcome-container">
            <ApiKeyForm />
          </div>
        ) : (
          <>
            {selectedConversationId ? (
              <>
                <MessageList messages={messages} loading={loading} />
                <MessageInput 
                  onSendMessage={sendMessage} 
                  disabled={!profile?.yandex_api_key || !selectedConversationId} 
                />
              </>
            ) : (
              <div className="welcome-container">
                <div className="welcome-content">
                  <h2 className="welcome-title">Добро пожаловать в чат с Yandex GPT</h2>
                  <p className="welcome-text">Выберите существующий диалог или создайте новый</p>
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
