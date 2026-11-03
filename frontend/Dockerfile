# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# --- Build ---
FROM deps AS build
WORKDIR /app
COPY . .
ENV VITE_USE_PROXY=false
RUN npm run build

# --- Serve with nginx ---
FROM nginx:alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
