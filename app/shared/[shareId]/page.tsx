// app/shared/[shareId]/page.tsx (обновленная версия)
import { createServerClient } from '@/app/lib/supabase';
import { notFound } from 'next/navigation';
import SharedChatView from './SharedChatView';
import './SharedChatView.module.css';

export default async function SharedChatPage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;
  const supabase = createServerClient();
  
  // Проверяем, существует ли чат с указанным shareId
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('id, title, user_id, is_shared, created_at')
    .eq('share_id', shareId)
    .eq('is_shared', true)
    .single();
  
  if (error || !conversation) {
    console.error('Ошибка при получении разговора:', error || 'Разговор не найден');
    notFound();
  }
  
  // Получаем информацию о владельце чата
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', conversation.user_id)
    .single();
  
  const ownerEmail = ownerProfile?.email || 'Неизвестный пользователь';
  
  // Получаем количество сообщений в чате
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversation.id);
  
  const messageCount = count || 0;
  
  // Форматируем дату создания
  const createdDate = new Date(conversation.created_at).toLocaleDateString();
  
  return (
    <div className="shared-page-container">
      <div className="shared-page-header">
        <div>
          <h1 className="shared-page-title">{conversation.title}</h1>
          <p className="shared-page-owner">
            Владелец: {ownerEmail}
          </p>
        </div>
        <div className="shared-page-stats">
          <span className="shared-page-stat-item">Создан: {createdDate}</span>
          <span className="shared-page-stat-item">Сообщений: {messageCount}</span>
          <span className="shared-page-badge">Режим чтения</span>
        </div>
      </div>
      
      <SharedChatView 
        conversationId={conversation.id} 
        ownerEmail={ownerEmail} 
      />
    </div>
  );
}
