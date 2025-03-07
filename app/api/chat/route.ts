// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Создаем клиент Supabase для обработчика маршрутов с доступом к cookies
    const supabase = createRouteHandlerClient({ cookies });

    // Получаем сессию пользователя
    const { data: { session } } = await supabase.auth.getSession();

    // Проверка аутентификации
    if (!session) {
      console.error('API route: Нет сессии для пользователя');
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    console.log('API route: Получена сессия для пользователя', session.user.id);

    // Получаем данные из запроса
    const { conversationId, message } = await req.json();

    if (!conversationId || !message) {
      console.error('API route: Отсутствуют необходимые параметры');
      return NextResponse.json({ error: 'Отсутствуют необходимые параметры' }, { status: 400 });
    }

    // Получаем профиль пользователя с API ключом
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('yandex_api_key')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile?.yandex_api_key) {
      console.error('API route: Ошибка получения API ключа', profileError);
      return NextResponse.json({ error: 'API ключ не найден' }, { status: 400 });
    }

    // Проверяем формат API ключа
    if (!profile.yandex_api_key.match(/^[a-zA-Z0-9_-]{32,}$/)) {
      console.error('API route: Неверный формат API ключа');
      return NextResponse.json({ error: 'Неверный формат API ключа' }, { status: 400 });
    }

    // Проверяем, что разговор принадлежит пользователю
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', session.user.id)
      .single();

    if (conversationError || !conversation) {
      console.error('API route: Разговор не найден или доступ запрещен', conversationError);
      return NextResponse.json({ error: 'Разговор не найден или доступ запрещен' }, { status: 403 });
    }

    // Сохраняем сообщение пользователя
    const { data: userMessage, error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
      })
      .select()
      .single();

    if (userMessageError) {
      console.error('API route: Ошибка при сохранении сообщения', userMessageError);
      return NextResponse.json({ error: 'Ошибка при сохранении сообщения' }, { status: 500 });
    }

    // Получаем историю сообщений для контекста (последние 10 сообщений)
    const { data: messageHistory } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    // Отправляем запрос к Yandex GPT API
    try {
      console.log('API route: Отправка запроса к Yandex GPT');
      
      const messages = (messageHistory?.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        text: msg.content
      })) || []);

      // Добавляем текущее сообщение
      messages.push({
        role: 'user',
        text: message
      });

      console.log('API route: Подготовленные сообщения:', JSON.stringify(messages, null, 2));

      const requestBody = {
        modelUri: 'gpt://b1gb5lrqp1jr1tmamu2t/yandexgpt-lite',
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000,
        },
        messages: messages,
      };

      console.log('API route: Отправляемый запрос:', JSON.stringify(requestBody, null, 2));
      console.log('API route: Отправляемые заголовки:', {
        'Content-Type': 'application/json',
        'Authorization': 'Api-Key <hidden>',
        'x-folder-id': 'b1gb5lrqp1jr1tmamu2t',
        'Accept': 'application/json'
      });

      const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${profile.yandex_api_key}`,
          'x-folder-id': 'b1gb5lrqp1jr1tmamu2t',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      console.log('API route: Получен ответ со статусом:', response.status);
      console.log('API route: Заголовки ответа:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API route: Текст ошибки:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        // Сохраняем сообщение об ошибке с более подробной информацией
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: `Произошла ошибка при получении ответа от Yandex GPT (${response.status}): ${errorData.message || 'Неизвестная ошибка'}. Пожалуйста, проверьте свой API ключ или попробуйте позже.`,
          });
        
        throw new Error(errorData.message || 'Ошибка при запросе к Yandex GPT API');
      }

      const data = await response.json();
      console.log('API route: Получен ответ от Yandex GPT:', data);

      if (!data.result?.alternatives?.[0]?.message?.text) {
        console.error('API route: Некорректный формат ответа:', data);
        throw new Error('Некорректный формат ответа от Yandex GPT API');
      }

      const aiResponse = data.result.alternatives[0].message.text;

      // Сохраняем ответ ассистента
      const { data: assistantMessage, error: assistantMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiResponse,
        })
        .select()
        .single();

      if (assistantMessageError) {
        console.error('API route: Ошибка при сохранении ответа', assistantMessageError);
        return NextResponse.json({ error: 'Ошибка при сохранении ответа' }, { status: 500 });
      }

      // Обновляем заголовок диалога, если это первое сообщение
      const { data: conversationData } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', conversationId)
        .single();

      if (conversationData?.title === 'Новый диалог') {
        // Используем первые 30 символов сообщения как заголовок
        const newTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
        await supabase
          .from('conversations')
          .update({ title: newTitle, updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } else {
        // Просто обновляем время последнего обновления
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }

      console.log('API route: Успешно обработан запрос');
      
      return NextResponse.json({ 
        userMessage: userMessage,
        assistantMessage: assistantMessage
      });
    } catch (error: unknown) {
      console.error('API route: Ошибка при обработке запроса к Yandex GPT', {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      // Сохраняем сообщение об ошибке
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: `Ошибка при обработке запроса: ${error instanceof Error ? error.message : String(error)}. Пожалуйста, попробуйте позже.`,
        });
      
      return NextResponse.json({ 
        error: 'Внутренняя ошибка сервера при обработке запроса к Yandex GPT',
        details: {
          message: error instanceof Error ? error.message : String(error),
          type: error instanceof Error ? error.constructor.name : typeof error
        }
      }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('API route: Общая ошибка', {
      error: error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: {
        message: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 });
  }
}
