// app/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth-forms.module.css';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    setLoading(true);

    try {
      setDebugInfo('Попытка авторизации...');
      await signIn(email, password);
      setDebugInfo('Авторизация успешна, перенаправление...');
      
      setTimeout(() => {
        router.push('/chat');
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setError((error as Error).message);
      setDebugInfo(`Ошибка: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Вход в систему</h1>
        <p className={styles.subtitle}>Введите ваши учетные данные</p>
      </div>
      
      <div className={styles.formContainer}>
        <div className={styles.formBox}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            {debugInfo && <div className={styles.debug}>{debugInfo}</div>}
            
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}>
              <div></div>
            </div>
            <div className={styles.dividerText}>
              <span>или</span>
            </div>
          </div>

          <div className={styles.linkContainer}>
            <Link href="/auth/register" className={styles.link}>
              Создать аккаунт
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
