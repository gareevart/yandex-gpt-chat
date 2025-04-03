// app/auth/register/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '../RegisterForm';
import { createServerClient } from '../../lib/supabase';
import styles from '../auth-forms.module.css';

export default async function RegisterPage() {
  const supabase = createServerClient();
  
  // Проверяем авторизацию на сервере
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Если пользователь авторизован, перенаправляем на страницу чата
    redirect('/chat');
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Yandex GPT Chat</h1>
        <h2 className={styles.subtitle}>Создайте аккаунт</h2>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formBox}>
          <RegisterForm />
          
          <div className={styles.divider}>
            <div className={styles.dividerLine}>
              <div></div>
            </div>
            <div className={styles.dividerText}>
              <span>Уже есть аккаунт?</span>
            </div>
          </div>

          <div className={styles.linkContainer}>
            <Link href="/auth/login" className={styles.link}>
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
