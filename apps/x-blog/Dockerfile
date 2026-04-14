# 多阶段构建 Dockerfile for x-blog (monorepo)
# 阶段 1: 依赖安装
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@10

# 复制 monorepo 根配置
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/x-blog/package.json ./apps/x-blog/
COPY packages/heitu/package.json ./packages/heitu/

# 安装依赖（包括编译 better-sqlite3 原生模块）
RUN pnpm install --frozen-lockfile || pnpm install

# 将 pnpm 符号链接解析为实际文件，供后续阶段 COPY
RUN mkdir -p /tmp/native-modules && \
    cp -rL /app/node_modules/.pnpm/better-sqlite3*/node_modules/better-sqlite3 /tmp/native-modules/better-sqlite3 || \
    cp -rL /app/apps/x-blog/node_modules/better-sqlite3 /tmp/native-modules/better-sqlite3 || \
    cp -rL /app/node_modules/better-sqlite3 /tmp/native-modules/better-sqlite3 && \
    cp -rL /app/node_modules/.pnpm/bindings*/node_modules/bindings /tmp/native-modules/bindings 2>/dev/null || \
    cp -rL /app/node_modules/bindings /tmp/native-modules/bindings 2>/dev/null || true && \
    cp -rL /app/node_modules/.pnpm/file-uri-to-path*/node_modules/file-uri-to-path /tmp/native-modules/file-uri-to-path 2>/dev/null || \
    cp -rL /app/node_modules/file-uri-to-path /tmp/native-modules/file-uri-to-path 2>/dev/null || true

# 阶段 1.5: 独立编译 better-sqlite3（备用，确保原生模块可用）
FROM node:22-alpine AS native-builder
RUN apk add --no-cache python3 make g++
WORKDIR /native
RUN npm init -y && npm install better-sqlite3

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

# 复制 better-sqlite3 原生模块（使用独立编译的版本，避免 pnpm 符号链接问题）
COPY --from=native-builder /native/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=native-builder /native/node_modules/bindings ./node_modules/bindings
COPY --from=native-builder /native/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
COPY --from=native-builder /native/node_modules/node-addon-api ./node_modules/node-addon-api

RUN mkdir -p /app/apps/x-blog/data && \
    mkdir -p /app/apps/x-blog/.next/cache && \
    chown -R nextjs:nodejs /app/apps/x-blog/data /app/apps/x-blog/.next

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/x-blog/server.js"]
