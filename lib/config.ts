// Server-side configuration. Read at request time (not inlined at build time), so the
// Docker image can be pointed at another API / website through environment variables.

const trimSlash = (url: string) => url.replace(/\/+$/, '');

/** Base URL of the NestJS API (server-only: the browser never talks to the API directly). */
export function apiUrl(): string {
  return trimSlash(process.env['API_URL'] || 'http://localhost:4000');
}

/** Base URL of the public website, which also serves the product images (/images/...). */
export function siteUrl(): string {
  return trimSlash(process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000');
}

export const SESSION_COOKIE = 'dns_admin_token';
export const SESSION_MAX_AGE = 12 * 60 * 60; // seconds; matches the API's JWT lifetime
