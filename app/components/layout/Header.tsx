// app/components/layout/Header.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiKeyForm } from '../profile/ApiKeyForm';
import Link from 'next/link';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Yandex GPT Chat
            </Link>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <span>API Ключ</span>
                  {profile?.yandex_api_key ? (
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  ) : (
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                  )}
                </button>
                
                {showApiKeyForm && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-10">
                    <div className="p-4">
                      <ApiKeyForm />
                    </div>
                  </div>
                )}
              </div>
              
              <span className="text-gray-700">{user.email}</span>
              
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Войти
              </Link>
              <Link 
                href="/auth/register" 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
