-- 彻底清空 public schema 下所有对象，让 migrate deploy 面对空库
-- 使用动态 SQL 删除所有表、序列、枚举类型，不受对象名限制
DO $$
DECLARE
    r RECORD;
BEGIN
    -- 删除 public schema 下所有表
    FOR r IN (
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
    END LOOP;

    -- 删除 public schema 下所有序列
    FOR r IN (
        SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS public.%I CASCADE', r.sequencename);
    END LOOP;

    -- 删除 public schema 下所有枚举类型
    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typtype = 'e'
    ) LOOP
        EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', r.typname);
    END LOOP;
END $$;
