// app/components/chat/ShareChatButton.tsx (обновление)
'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './ChatInterface.page.css';

interface ShareChatButtonProps {
  conversationId: string;
  shareId: string | null;
  isShared: boolean;
}

export const ShareChatButton: React.FC<ShareChatButtonProps> = ({
  conversationId,
  shareId,
  isShared,
}) => {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const handleShareToggle = async () => {
    if (!user) return;
    
    setIsSharing(true);
    
    try {
      // Если мы выключаем доступ по ссылке или включаем, но share_id еще не был создан
      const needNewShareId = !isShared || !shareId;
      const newShareId = needNewShareId ? crypto.randomUUID() : shareId;
      
      const { error } = await supabase
        .from('conversations')
        .update({ 
          is_shared: !isShared,
          share_id: newShareId
        })
        .eq('id', conversationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Уведомление об успешном изменении доступа
      if (!isShared) {
        // Если мы только что включили доступ по ссылке, копируем URL в буфер обмена
        const shareLink = `${window.location.origin}/shared/${newShareId}`;
        navigator.clipboard.writeText(shareLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса доступа:', error);
      alert('Не удалось изменить статус доступа к чату');
    } finally {
      setIsSharing(false);
    }
  };
  
  const copyShareLink = () => {
    if (!shareId) return;
    
    const shareLink = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  
  if (!user) return null;
  
  return (
    <div className="share-button-container">
      <button
        onClick={handleShareToggle}
        disabled={isSharing}
        className={`share-toggle-button ${isShared ? 'shared' : ''}`}
        title={isShared ? 'Отключить доступ по ссылке' : 'Включить доступ по ссылке'}
      >
        {isShared ? 'Отключить доступ' : 'Поделиться для чтения'}
      </button>
      
      {isShared && shareId && (
        <button
          onClick={copyShareLink}
          className={`copy-link-button ${isCopied ? 'copied' : ''}`}
          title="Копировать ссылку"
        >
          {isCopied ? 'Скопировано!' : 'Копировать ссылку'}
        </button>
      )}
    </div>
  );
}
