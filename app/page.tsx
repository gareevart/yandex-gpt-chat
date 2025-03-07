import Image from "next/image";
import Link from "next/link";
import { redirect } from 'next/navigation';
import { createServerClient } from './lib/supabase';

import styles from "./page.module.css";

export default async function Home() {
  const supabase = createServerClient();

    // Проверяем авторизацию на сервере
    const { data: { session } } = await supabase.auth.getSession();
  
    if (session) {
      // Если пользователь авторизован, перенаправляем на страницу чата
      redirect('/chat');
    }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
       <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Общение с Yandex GPT</h1>
       <p>Задавайте вопросы и получайте ответы от искусственного интеллекта Yandex</p>

        <ol>
          <li>
            Get started go to <code>chat page</code>.
          </li>
          <li>Sing Up or Login</li>
          <li>Start chatting with YaGPT 5 Pro Ultra Violet</li>
        </ol>

        <div className={styles.ctas}>
          <Link
            href='/auth/login'
            className={styles.primary} >
            Войти
          </Link>
          <Link
            href='/auth/register'
            className={styles.secondary} >
            Зарегистрироваться
          </Link>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
