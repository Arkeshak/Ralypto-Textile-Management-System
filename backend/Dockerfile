# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install system deps for Prisma (OpenSSL for @prisma/client sqlite)
RUN apk add --no-cache openssl libc6-compat

# --- Dependencies layer ---
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# --- Prisma client generation ---
FROM deps AS prisma
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate

# --- Build ---
FROM prisma AS build
WORKDIR /app
COPY . .
RUN npm run build

# --- Runtime ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

EXPOSE 5000
CMD ["node", "dist/index.js"]
