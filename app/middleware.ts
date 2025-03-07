// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Проверяем сессию
  const { data: { session } } = await supabase.auth.getSession();

  // Получаем целевой URL
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // Защищенные маршруты (требуют авторизации)
  const protectedRoutes = ['/chat', '/profile'];
  
  // Маршруты для неавторизованных пользователей
  const authRoutes = ['/auth/login', '/auth/register'];

  // Проверяем, авторизован ли пользователь и куда он пытается перейти
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname === route);

// middleware.ts (продолжение)
if (isProtectedRoute && !session) {
    // Если пользователь не авторизован и пытается перейти на защищенный маршрут
    // перенаправляем на страницу входа
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    // Если пользователь авторизован и пытается перейти на страницу входа/регистрации
    // перенаправляем на страницу чата
    url.pathname = '/chat';
    return NextResponse.redirect(url);
  }

  await supabase.auth.getSession();
  
  return res;
}

// Определяем, для каких путей будет работать middleware
export const config = {
  matcher: ['/chat/:path*', '/profile/:path*', '/auth/login', '/auth/register'],
};
