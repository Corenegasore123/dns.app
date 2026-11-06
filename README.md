# dns.app — Duhingeneza Shop admin

Admin dashboard for Duhingeneza Shop, built with [Next.js](https://nextjs.org) (App Router) and Tailwind CSS. Shop staff use it to manage the products shown on the website and to read the messages sent through its contact form.

It is one of three repos:

| Repo | What | Local URL |
| --- | --- | --- |
| [dns.fe](https://github.com/Corenegasore123/dns.fe) | Public website (also serves the product images) | http://localhost:3000 |
| [dns.be](https://github.com/Corenegasore123/dns.be) | NestJS API + PostgreSQL | http://localhost:4000 |
| **dns.app** (this repo) | Admin dashboard | http://localhost:3002 |

## Features

- **Sign in** (`/login`) with an admin account from the API. The API's JWT is kept in an `httpOnly`, `sameSite=lax` cookie (12 h, `Secure` in production); the browser never sees it and never calls the API directly.
- **Overview** (`/`) — product and stock counts, unread messages, products per category, the latest messages.
- **Products** (`/products`) — search, category / stock / featured filters and pages in the URL; add, edit (name, category, size, description, images, in stock, featured) and delete with confirmation. API validation errors are shown next to the fields.
- **Messages** (`/messages`) — All / Unread / Read tabs. Opening a message marks it read; it can be marked unread again, answered by email or deleted.

All API calls happen on the server (Server Components and Server Actions, [lib/api.ts](lib/api.ts)). [middleware.ts](middleware.ts) sends visitors without a valid session to `/login`; if the API rejects the token, the cookie is cleared and the user is sent back to `/login`.

## Requirements

- Node.js 24+
- npm
- The API ([dns.be](https://github.com/Corenegasore123/dns.be)) running on port 4000, and ideally the website ([dns.fe](https://github.com/Corenegasore123/dns.fe)) on port 3000 for product images

## Environment

Copy [.env.example](.env.example) to `.env.local` if you need other values than the defaults:

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_URL` | `http://localhost:4000` | API base URL (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Website URL: product images (`/images/...`) and the "View website" link |
| `COOKIE_SECURE` | – | Set to `false` to drop the `Secure` cookie flag when a production build is served over plain http on a host other than localhost |

Both URLs are read at request time, so one Docker image works for any environment.

## Development

```bash
npm ci
npm run dev          # http://localhost:3002
npm run lint
npx tsc --noEmit     # type check
npm run build        # production build (also type-checks)
npm start            # serve the production build on port 3002
```

Sign in with an admin account created by the API's seed (see the dns.be README for the development credentials).

## Docker

```bash
docker compose up -d --build   # http://localhost:3002
docker compose down
```

The container reaches the API on the host through `host.docker.internal:4000`. The [Dockerfile](Dockerfile) builds Next.js in [standalone mode](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) and runs only the standalone server plus static assets, as the non-root `node` user.

## CI

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs lint and a production build on every pull request and push to `main`, then builds the Docker image and smoke-tests the container (there is no API in CI, so it checks that `/login` loads and that other pages redirect to it).

## Workflow

Never commit directly to `main`. Create a feature branch (`feat/...`, `fix/...`), open a pull request, and merge once CI passes.
