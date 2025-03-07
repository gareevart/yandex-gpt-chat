// types/index.ts
export interface Profile {
    id: string;
    email: string;
    yandex_api_key?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Message {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }
  