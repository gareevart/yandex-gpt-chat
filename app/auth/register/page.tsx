// app/auth/register/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '../RegisterForm';
import { createServerClient } from '../../lib/supabase';
import '../auth.css';

export default async function RegisterPage() {
  const supabase = createServerClient();
  
  // Проверяем авторизацию на сервере
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Если пользователь авторизован, перенаправляем на страницу чата
    redirect('/chat');
  }
  
  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">Yandex GPT Chat</h1>
        <h2 className="auth-subtitle">Создайте аккаунт</h2>
      </div>

      <div className="auth-form-container">
        <div className="auth-form-box">
          <RegisterForm />
          
          <div className="auth-divider">
            <div className="auth-divider-line">
              <div></div>
            </div>
            <div className="auth-divider-text">
              <span>Уже есть аккаунт?</span>
            </div>
          </div>

          <div className="auth-link-container">
            <Link href="/auth/login" className="auth-link">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
