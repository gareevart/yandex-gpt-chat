// app/components/layout/Header.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiKeyForm } from '../profile/ApiKeyForm';
import Link from 'next/link';
import './Header.css';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-container">
            <Link href="/" className="logo">
              Yandex GPT Chat
            </Link>
          </div>
          
          {user ? (
            <div className="user-section">
              <div className="relative">
                <button
                  onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                  className="api-key-button"
                >
                  <span>API Ключ</span>
                  {profile?.yandex_api_key ? (
                    <span className="status-dot active"></span>
                  ) : (
                    <span className="status-dot inactive"></span>
                  )}
                </button>
                
                {showApiKeyForm && (
                  <div className="api-key-form-container">
                    <div className="api-key-form-content">
                      <ApiKeyForm />
                    </div>
                  </div>
                )}
              </div>
              
              <span className="user-email">{user.email}</span>
              
              <button
                onClick={() => signOut()}
                className="sign-out-button"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link 
                href="/auth/login" 
                className="login-button"
              >
                Войти
              </Link>
              <Link 
                href="/auth/register" 
                className="register-button"
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
