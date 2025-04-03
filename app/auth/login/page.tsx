// app/auth/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../LoginForm';
import { useAuth } from '../../contexts/AuthContext';
import '../../page.styles.css';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    console.log("LoginPage: Проверка авторизации", { user, loading });
    
    if (!loading) {
      if (user) {
        console.log("Пользователь авторизован, перенаправление на /chat");
        router.push('/chat');
      } else {
        setChecking(false);
      }
    }
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <LoginForm />
      </div>
    </div>
  );
}
