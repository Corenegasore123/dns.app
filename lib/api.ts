// Typed helpers for the DNS API. Server-only: used from Server Components and Server Actions,
// with the admin JWT read from the httpOnly session cookie.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiUrl, SESSION_COOKIE } from './config';
import { queryString } from './format';

// ---- types (mirror the API's JSON)

export type CategorySlug =
  | 'fertilizers'
  | 'fungicides'
  | 'insecticides'
  | 'agricultural-tools'
  | 'animal-products'
  | 'other';

export type Category = { slug: CategorySlug; name: string; badge: string };

export type Admin = { id: string; email: string; name: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  size: string;
  inStock: boolean;
  featured: boolean;
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  category: string;
  size: string;
  images: string[];
  description: string;
  slug?: string;
  inStock?: boolean;
  featured?: boolean;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type Stats = {
  products: number;
  inStock: number;
  outOfStock: number;
  featured: number;
  messages: number;
  unreadMessages: number;
  productsByCategory: { slug: CategorySlug; name: string; count: number }[];
};

// ---- errors

/** Non-2xx API response. `messages` holds the validation messages of a 400. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[],
  ) {
    super(messages[0] ?? `API request failed (${status})`);
    this.name = 'ApiError';
  }
}

async function readError(res: Response): Promise<ApiError> {
  let messages: string[] = [];
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) messages = body.message;
    else if (typeof body.message === 'string') messages = [body.message];
  } catch {
    // no JSON body
  }
  return new ApiError(res.status, messages);
}

// ---- session

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** The token was rejected: drop the cookie and send the user to the login page. */
async function endSession(): Promise<never> {
  try {
    // Allowed in Server Actions and Route Handlers...
    (await cookies()).delete(SESSION_COOKIE);
  } catch {
    // ...but not while rendering a Server Component: let a Route Handler clear it instead
    redirect('/session-expired');
  }
  redirect('/login?expired=1');
}

// ---- fetch helpers

/** Public, unauthenticated request. */
export async function publicFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
    cache: 'no-store',
  });
  if (!res.ok) throw await readError(res);
  return (await res.json()) as T;
}

/** Authenticated admin request. Redirects to /login when there is no valid session. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  if (!token) redirect('/login');
  const res = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: 'no-store',
  });
  if (res.status === 401) return endSession();
  if (!res.ok) throw await readError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---- endpoints

export const getCategories = () => publicFetch<Category[]>('/categories');

export const getMe = () => apiFetch<Admin>('/auth/me');

export const getStats = () => apiFetch<Stats>('/admin/stats');

export type ProductQuery = {
  q?: string;
  category?: string;
  featured?: boolean;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
};

export const listProducts = (query: ProductQuery = {}) =>
  apiFetch<Paginated<Product>>(`/admin/products${queryString(query)}`);

export const getProduct = (id: string) => apiFetch<Product>(`/admin/products/${encodeURIComponent(id)}`);

export const createProduct = (input: ProductInput) =>
  apiFetch<Product>('/admin/products', { method: 'POST', body: JSON.stringify(input) });

export const updateProduct = (id: string, input: Partial<ProductInput>) =>
  apiFetch<Product>(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteProduct = (id: string) =>
  apiFetch<void>(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });

export type MessageQuery = { read?: boolean; page?: number; pageSize?: number };

export const listMessages = (query: MessageQuery = {}) =>
  apiFetch<Paginated<ContactMessage>>(
    `/admin/contact-messages${queryString(query)}`,
  );

export const getMessage = (id: string) =>
  apiFetch<ContactMessage>(`/admin/contact-messages/${encodeURIComponent(id)}`);

export const setMessageRead = (id: string, read: boolean) =>
  apiFetch<ContactMessage>(`/admin/contact-messages/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ read }),
  });

export const deleteMessage = (id: string) =>
  apiFetch<void>(`/admin/contact-messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
