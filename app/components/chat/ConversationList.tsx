// app/components/chat/ConversationList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation } from '../../types';

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  selectedConversationId, 
  onSelect, 
  onNewConversation 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations(data as Conversation[]);
      }
      setLoading(false);
    };

    fetchConversations();

    // Подписываемся на изменения
    const subscription = supabase
      .channel('conversation_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <div className="bg-gray-100 p-4 h-full">
      <button
        onClick={onNewConversation}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Новый чат
      </button>

      {loading ? (
        <div className="text-center py-4">Загрузка...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-4 text-gray-500">Нет сохраненных чатов</div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                onClick={() => onSelect(conversation.id)}
                className={`w-full text-left p-2 rounded truncate ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-100 font-medium'
                    : 'hover:bg-gray-200'
                }`}
              >
                {conversation.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
