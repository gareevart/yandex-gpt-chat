// app/hooks/useProfile.ts
import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useAuth } from '../contexts/AuthContext';

const fetcher = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as Profile;
};

export function useProfile() {
  const { user } = useAuth();
  
  const { data, error, mutate } = useSWR(
    user ? user.id : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 секунд
    }
  );

  return {
    profile: data,
    isLoading: !error && !data,
    isError: error,
    mutate // функция для ручного обновления данных
  };
}
