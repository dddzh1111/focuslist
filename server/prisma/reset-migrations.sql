-- 清理可能残留的 _prisma_migrations 表，让 migrate deploy 重新执行
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
