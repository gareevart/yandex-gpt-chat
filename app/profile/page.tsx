// app/profile/page.tsx
import { redirect } from 'next/navigation';
import { ApiKeyForm } from '../components/profile/ApiKeyForm';
import { createServerClient } from '../lib/supabase';


export default async function ProfilePage() {
    const supabase = createServerClient();
    
    // Проверяем авторизацию на сервере
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      redirect('/auth/login');
    }
    
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Профиль пользователя</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Настройки вашего аккаунта и API ключа</p>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{session.user.email}</dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Настройки API ключа</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <ApiKeyForm />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  }
  