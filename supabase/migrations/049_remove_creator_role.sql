UPDATE public.users
SET role = 'user'
WHERE role = 'creator';

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname
  INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'users'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%role%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check
CHECK (role IN ('user', 'admin'));
