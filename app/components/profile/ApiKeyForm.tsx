// app/components/profile/ApiKeyForm.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const ApiKeyForm: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [apiKey, setApiKey] = useState(profile?.yandex_api_key || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      await updateProfile({ yandex_api_key: apiKey });
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">API ключ Yandex GPT</h2>
      {!profile?.yandex_api_key && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          Для использования чата необходимо добавить API ключ Yandex GPT
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          // app/components/profile/ApiKeyForm.tsx (продолжение)
          API ключ успешно сохранен
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            API ключ
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Введите ваш API ключ Yandex GPT"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Ваш API ключ хранится в зашифрованном виде и используется только для запросов к Yandex GPT
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? 'Сохранение...' : 'Сохранить API ключ'}
        </button>
      </form>
    </div>
  );
};

