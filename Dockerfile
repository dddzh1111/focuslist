# ============ 1. 构建前端 ============
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ============ 2. 构建后端 ============
FROM node:20-alpine AS server-build
WORKDIR /app/server
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

# 智能数据库部署：先尝试基线已有表，再应用迁移，兼容空库/半建库/已部署三种状态
# 1. migrate resolve 为已有表建立基线（空库时报错被 || true 忽略）
# 2. migrate deploy 实际执行迁移（已有基线则跳过）
CMD ["sh", "-c", "(npx prisma migrate resolve --applied 20260718000000_init || true) && npx prisma migrate deploy && node dist/index.js"]
