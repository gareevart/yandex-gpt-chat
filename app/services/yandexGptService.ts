// services/yandexGptService.ts
interface YandexGptResponse {
    result: {
      alternatives: {
        message: {
          role: string;
          content: string;
        }
      }[];
    }
  }
  
  export const sendMessageToYandexGpt = async (
    messages: { role: 'user' | 'assistant'; content: string }[], 
    apiKey: string
  ): Promise<string> => {
    try {
      const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${apiKey}`,
        },
        body: JSON.stringify({
          modelUri: 'gpt://b1gb5lrqp1jr1tmamu2t/yandexgpt/rc',
          completionOptions: {
            stream: false,
            temperature: 0.6,
            maxTokens: 2000,
          },
          messages: messages,
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка при запросе к Yandex GPT API');
      }
  
      const data = await response.json() as YandexGptResponse;
      return data.result.alternatives[0].message.content;
    } catch (error) {
      console.error('Error sending message to Yandex GPT:', error);
      throw error;
    }
  };
  