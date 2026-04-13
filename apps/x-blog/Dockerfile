# 多阶段构建 Dockerfile for x-blog (monorepo)
# 阶段 1: 依赖安装
FROM node:22-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@10

# 复制 monorepo 根配置
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/x-blog/package.json ./apps/x-blog/
COPY packages/heitu/package.json ./packages/heitu/

# 安装依赖
RUN pnpm install --frozen-lockfile || pnpm install

# 阶段 2: 构建组件库
FROM node:22-alpine AS heitu-builder
WORKDIR /app
RUN npm install -g pnpm@10

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/x-blog/node_modules ./apps/x-blog/node_modules
COPY --from=deps /app/packages/heitu/node_modules ./packages/heitu/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY packages/heitu/ ./packages/heitu/

RUN pnpm --filter heitu build

# 阶段 3: 构建应用
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/x-blog/node_modules ./apps/x-blog/node_modules
COPY --from=heitu-builder /app/packages/heitu/ ./packages/heitu/
COPY package.json pnpm-workspace.yaml ./
COPY apps/x-blog/ ./apps/x-blog/

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm --filter x-blog build

# 阶段 4: 生产运行
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/x-blog/public ./apps/x-blog/public
COPY --from=builder /app/apps/x-blog/.next/standalone ./
COPY --from=builder /app/apps/x-blog/.next/static ./apps/x-blog/.next/static

RUN mkdir -p /app/apps/x-blog/data && \
    mkdir -p /app/apps/x-blog/.next/cache && \
    chown -R nextjs:nodejs /app/apps/x-blog/data /app/apps/x-blog/.next

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/x-blog/server.js"]
