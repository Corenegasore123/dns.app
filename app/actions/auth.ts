'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiUrl, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/config';

export type LoginState = { error?: string; email?: string };

/** Only allow redirects to paths on this site (no //evil.com or absolute URLs). */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/';
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Enter your email and password.', email };

  let res: Response;
  try {
    res = await fetch(`${apiUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch {
    return { error: 'Cannot reach the server. Please try again in a moment.', email };
  }

  if (res.status === 401 || res.status === 400) return { error: 'Incorrect email or password.', email };
  if (res.status === 429) return { error: 'Too many login attempts. Wait a minute and try again.', email };
  if (!res.ok) return { error: 'Something went wrong. Please try again.', email };

  const { accessToken } = (await res.json()) as { accessToken: string };
  (await cookies()).set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && process.env['COOKIE_SECURE'] !== 'false',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  redirect(safeNext(formData.get('next')));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
}
