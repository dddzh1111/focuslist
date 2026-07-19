-- 清空 focuslist schema 下所有对象
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'focuslist' AND tableowner = current_user
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS focuslist.%I CASCADE', r.tablename);
    END LOOP;

    FOR r IN (
        SELECT c.relname AS seqname
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_roles r2 ON c.relowner = r2.oid
        WHERE n.nspname = 'focuslist' AND c.relkind = 'S' AND r2.rolname = current_user
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS focuslist.%I CASCADE', r.seqname);
    END LOOP;

    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'focuslist' AND t.typtype = 'e' AND t.typowner = (SELECT oid FROM pg_roles WHERE rolname = current_user)
    ) LOOP
        EXECUTE format('DROP TYPE IF EXISTS focuslist.%I CASCADE', r.typname);
    END LOOP;
END $$;
