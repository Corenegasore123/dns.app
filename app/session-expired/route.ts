import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/config';

// Server Components cannot change cookies, so when the API rejects the token during a render
// they redirect here: clear the session cookie, then go to the login page.
export async function GET() {
  (await cookies()).delete(SESSION_COOKIE);
  // Relative Location: correct behind proxies / in Docker whatever the Host the server sees
  return new Response(null, { status: 303, headers: { Location: '/login?expired=1' } });
}
