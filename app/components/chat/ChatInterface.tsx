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

export const ChatInterface: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="flex h-screen bg-white">
      <div className="w-64 border-r">
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelect={setSelectedConversationId}
          onNewConversation={createNewConversation}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {showApiKeyForm ? (
          <div className="flex-1 flex items-center justify-center p-6">
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
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Добро пожаловать в чат с Yandex GPT</h2>
                  <p className="text-gray-600">Выберите существующий диалог или создайте новый</p>
                  <button
                    onClick={createNewConversation}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
