# ============ 1. 构建前端 ============
FROM node:20-alpine AS client-build
WORKDIR /app/client

# 使用国内 npm 镜像，避免 CloudBase 构建环境连接 npm 官方源超时
RUN npm config set registry https://registry.npmmirror.com

COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ============ 2. 构建后端 ============
FROM node:20-alpine AS server-build
WORKDIR /app/server

# 使用国内 npm 镜像，避免 CloudBase 构建环境连接 npm 官方源超时
RUN npm config set registry https://registry.npmmirror.com

COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npm run build
RUN npx prisma generate

# ============ 3. 运行镜像 ============
FROM node:20-alpine AS runtime
WORKDIR /app/server

# 复制后端运行时依赖与构建产物
COPY --from=server-build /app/server/node_modules ./node_modules
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/prisma ./prisma
COPY --from=server-build /app/server/package.json ./package.json

# 复制前端构建产物到 dist/public，由 Express 托管
COPY --from=client-build /app/client/dist ./dist/public

ENV NODE_ENV=production
# DATABASE_URL 由 CloudBase 运行时环境变量注入，不在此处硬编码
ENV SERVER_PORT=3001

EXPOSE 3001

# 数据库部署：
# 1. 先清理可能残留的 _prisma_migrations 记录（上次 resolve 标记但未真正建表）
# 2. 执行 migrate deploy 真正创建所有表
CMD ["sh", "-c", "(npx prisma db execute --file prisma/reset-migrations.sql --schema prisma/schema.prisma || true) && npx prisma migrate deploy && node dist/index.js"]
