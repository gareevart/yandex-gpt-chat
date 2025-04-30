// app/shared/[shareId]/head.tsx
import { createServerClient } from '@/app/lib/supabase';

export default async function Head({ params }: { params: { shareId: string } }) {
  const { shareId } = params;
  const supabase = createServerClient();

  // Получаем основную информацию о чате для заголовка
  const { data: conversation } = await supabase
    .from('conversations')
    .select('title')
    .eq('share_id', shareId)
    .single();

  const title = conversation?.title || 'Чат с Yandex GPT';

  return (
    <>
      <title>{title} - Чат с Yandex GPT</title>
      <meta name="description" content="Просмотр архива чата с Yandex GPT" />
    </>
  );
}
