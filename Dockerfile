# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN pnpm i --frozen-lockfile || pnpm i

FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


