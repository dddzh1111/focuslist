-- 清空当前用户拥有的表、序列、枚举，跳过腾讯云系统表（如 tencentdb_*）
-- 只删除 current_user 拥有的对象，避免权限报错
DO $$
DECLARE
    r RECORD;
BEGIN
    -- 删除当前用户拥有的所有表（跳过系统表）
    FOR r IN (
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tableowner = current_user
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
    END LOOP;

    -- 删除当前用户拥有的所有序列
    FOR r IN (
        SELECT c.relname AS seqname
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_roles r2 ON c.relowner = r2.oid
        WHERE n.nspname = 'public' AND c.relkind = 'S' AND r2.rolname = current_user
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS public.%I CASCADE', r.seqname);
    END LOOP;

    -- 删除当前用户拥有的所有枚举类型
    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typtype = 'e' AND t.typowner = (SELECT oid FROM pg_roles WHERE rolname = current_user)
    ) LOOP
        EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', r.typname);
    END LOOP;
END $$;
