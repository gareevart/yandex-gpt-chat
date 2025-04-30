// app/shared/[shareId]/page.tsx (упрощенный вариант)
import { createServerClient } from '@/app/lib/supabase';
import { notFound } from 'next/navigation';
import SharedChatView from './SharedChatView';
import './SharedChatView.module.css';
import { Metadata } from 'next';

// Define the generateMetadata function to handle the dynamic route parameter
export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Shared Chat: ${resolvedParams.shareId}`,
  };
}

// Только основная функция страницы
export default async function SharedChatPage(props: any) {
  // Get the shareId from the params object
  const resolvedParams = await props.params;
  const shareId = resolvedParams.shareId;
  
  // Create the Supabase client
  const supabase = createServerClient();
  
  try {
    // Проверяем, существует ли чат с указанным shareId
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('id, title, user_id, is_shared')
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
    
    return (
      <div className="shared-page-container">
        <div className="shared-page-header">
          <div>
            <h1 className="shared-page-title">{conversation.title}</h1>
            <p className="shared-page-owner">
              Владелец: {ownerEmail}
            </p>
          </div>
        </div>
        
        <SharedChatView 
          conversationId={conversation.id} 
          ownerEmail={ownerEmail} 
        />
      </div>
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    notFound();
  }
}
