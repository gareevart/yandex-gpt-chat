// app/chat/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '../components/chat/ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import styles from "./page.module.css";

export default function ChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Показываем загрузку на стороне клиента
  if (loading || !isClient) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Если пользователь не авторизован, не рендерим содержимое
  if (!user) {
    return null;
  }

  return (
    <div className={styles.chat}>
      <ChatInterface />
    </div>
  );
}
