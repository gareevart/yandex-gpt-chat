// app/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from './auth/LoginForm';
import { useAuth } from './contexts/AuthContext';
import './page.styles.css';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [clientLoading, setClientLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!loading) {
      setClientLoading(false);
      if (user && isMounted) {
        router.push('/chat');
      }
    }
  }, [user, loading, router, isMounted]);

  if (loading || clientLoading) {
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

          <div className="mt-6">
          </div>

      </div>
    </div>
  );
}
