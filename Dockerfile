# syntax=docker/dockerfile:1

# ---- deps: install dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: produce the standalone Next.js server
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime: standalone server + static assets only
# API_URL and NEXT_PUBLIC_SITE_URL are read by the server at request time, so set them when running
# the container (see docker-compose.yml), not at build time.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3002 \
    HOSTNAME=0.0.0.0 \
    API_URL=http://host.docker.internal:4000 \
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3002
CMD ["node", "server.js"]
