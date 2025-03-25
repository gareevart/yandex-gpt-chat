// app/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, WeakPassword } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null; // Добавляем сессию в контекст
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User; session: Session; weakPassword?: WeakPassword | undefined }>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Состояние для сессии
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthProvider: Проверка текущей сессии");
    
    // Проверяем текущую сессию
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Получена сессия:", currentSession ? "Сессия существует" : "Сессия отсутствует");
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error("Ошибка при получении сессии:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Устанавливаем слушатель изменений авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("AuthProvider: Изменение состояния авторизации", event);
      
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      
      // Обновляем страницу при изменении сессии для корректной работы серверных компонентов
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Получение профиля для userId:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Ошибка при получении профиля:', error);
      } else {
        console.log("Профиль получен:", data);
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error("Неожиданная ошибка при получении профиля:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("Попытка входа для:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Ошибка входа:", error);
      throw error;
    }
    
    console.log("Вход успешен:", data.user?.id);
    
    // Явно устанавливаем сессию и пользователя
    setSession(data.session);
    setUser(data.user);
    
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    
    return data;
  };

  const signUp = async (email: string, password: string) => {
    console.log("Регистрация пользователя:", email);
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error("Ошибка регистрации:", error);
      throw error;
    }
    
    console.log("Регистрация успешна:", data.user?.id);
    
    // Для автоматического входа после регистрации (если не требуется подтверждение email)
    if (data.user && data.session) {
      setSession(data.session);
      setUser(data.user);
    }
  };

  const signOut = async () => {
    console.log("Попытка выхода");
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Ошибка при выходе:", error);
      throw error;
    }
    
    console.log("Выход успешен");
    
    // Очищаем состояние
    setSession(null);
    setUser(null);
    setProfile(null);
    
    // Перенаправляем на страницу входа
    router.push('/auth/login');
  };

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    if (!user) {
      console.error("Нельзя обновить профиль без авторизации");
      return;
    }

    console.log("Обновление профиля для:", user.id);
    
    const { error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', user.id);

    if (error) {
      console.error("Ошибка обновления профиля:", error);
      throw error;
    }
    
    console.log("Профиль обновлен успешно");
    
    // Обновляем локальное состояние профиля
    setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
