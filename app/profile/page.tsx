// app/profile/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiKeyForm } from '../components/profile/ApiKeyForm';
import { Header } from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';
import styles from './page.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
    
  return (
    <>
      <Header />
      <div className={styles.profileContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Профиль пользователя</h3>
              <p className={styles.cardSubtitle}>Настройки вашего аккаунта и API ключа</p>
            </div>
            
            <div className={styles.cardDivider}>
              <div className={styles.cardContent}>
                <div className={styles.infoRow}>
                  <dt className={styles.infoLabel}>Email</dt>
                  <dd className={styles.infoValue}>{user.email}</dd>
                </div>
                
                <div className={styles.infoRow}>
                  <dt className={styles.infoLabel}>Настройки API ключа</dt>
                  <dd className={styles.infoValue}>
                    <ApiKeyForm />
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
  