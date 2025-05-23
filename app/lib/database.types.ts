// app/lib/database.types.ts
export type Database = {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string;
            email: string;
            yandex_api_key?: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id: string;
            email: string;
            yandex_api_key?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            email?: string;
            yandex_api_key?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };
        conversations: {
          Row: {
            id: string;
            user_id: string;
            title: string;
            created_at: string;
            updated_at: string;
            share_id?: string | null;
            is_shared: boolean;
          };
          Insert: {
            id?: string;
            user_id: string;
            title?: string;
            created_at?: string;
            updated_at?: string;
            share_id?: string | null;
            is_shared?: boolean;
          };
          Update: {
            id?: string;
            user_id?: string;
            title?: string;
            created_at?: string;
            updated_at?: string;
            share_id?: string | null;
            is_shared?: boolean;
          };
        };
        messages: {
          Row: {
            id: string;
            conversation_id: string;
            role: 'user' | 'assistant';
            content: string;
            created_at: string;
          };
          Insert: {
            id?: string;
            conversation_id: string;
            role: 'user' | 'assistant';
            content: string;
            created_at?: string;
          };
          Update: {
            id?: string;
            conversation_id?: string;
            role?: 'user' | 'assistant';
            content?: string;
            created_at?: string;
          };
        };
      };
      Views: {
        [_ in never]: never;
      };
      Functions: {
        [_ in never]: never;
      };
      Enums: {
        [_ in never]: never;
      };
    };
  };
