// app/components/chat/ConversationList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation } from '../../types';
import styles from './ConversationList.module.css';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [hoverConversation, setHoverConversation] = useState<string | null>(null);
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

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;
    
    try {
      // First delete all related messages
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);
        
      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        return;
      }
      
      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);
        
      if (conversationError) {
        console.error('Error deleting conversation:', conversationError);
        return;
      }
      
      // If the deleted conversation was selected, clear selection
      if (selectedConversationId === conversationId) {
        onSelect('');
      }
      
      // Hide confirm dialog
      setShowDeleteConfirm(null);
      
    } catch (error) {
      console.error('Error during deletion process:', error);
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={onNewConversation}
        className={styles.newChatButton}
      >
        Новый чат
      </button>

      {loading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : conversations.length === 0 ? (
        <div className={styles.noChatsText}>Нет сохраненных чатов</div>
      ) : (
        <ul className={styles.conversationList}>
          {conversations.map((conversation) => (
            <li key={conversation.id} className={styles.conversationItem}>
              <div 
                className={styles.conversationItemContent}
                onMouseEnter={() => setHoverConversation(conversation.id)}
                onMouseLeave={() => setHoverConversation(null)}
              >
                <button
                  onClick={() => onSelect(conversation.id)}
                  className={`${styles.conversationButton} ${
                    selectedConversationId === conversation.id
                      ? styles.conversationButtonSelected
                      : styles.conversationButtonHover
                  }`}
                >
                  {conversation.title}
                </button>
                {hoverConversation === conversation.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(conversation.id);
                    }}
                    className={styles.deleteButton}
                    title="Удалить чат"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={styles.deleteIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              
              {showDeleteConfirm === conversation.id && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modalContent}>
                    <h3 className={styles.modalTitle}>Подтверждение удаления</h3>
                    <p className={styles.modalText}>Вы уверены, что хотите удалить чат "{conversation.title}"?</p>
                    <div className={styles.modalActions}>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className={styles.cancelButton}
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => deleteConversation(conversation.id)}
                        className={styles.deleteConfirmButton}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
