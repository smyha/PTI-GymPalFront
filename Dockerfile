# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN pnpm i --frozen-lockfile || pnpm i

FROM deps AS build
WORKDIR /app
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source code and configuration files
COPY src ./src
# Copy configuration files
COPY next.config.mjs tsconfig.json tailwind.config.ts postcss.config.js components.json package.json next-env.d.ts ./
# Copy env file if it exists (wildcard won't fail if file doesn't exist)
COPY .env.local* ./
# Create empty public directory (Next.js optional static assets directory)
RUN mkdir -p public
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from build stage
# Next.js standalone output includes server.js and necessary runtime files
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Public directory is optional for Next.js, create empty if needed
RUN mkdir -p public

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]


