-- Fix follower/following counters so they never drift below zero.
-- Also remove the legacy trigger from migration 010, which can coexist
-- with the newer trigger and double-apply count changes.

DROP TRIGGER IF EXISTS update_follows_count_trigger ON public.follows;
DROP FUNCTION IF EXISTS public.update_follows_count();

CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users
    SET followers_count = GREATEST(COALESCE(followers_count, 0) + 1, 0)
    WHERE id = NEW.following_id;

    UPDATE public.users
    SET following_count = GREATEST(COALESCE(following_count, 0) + 1, 0)
    WHERE id = NEW.follower_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
    WHERE id = OLD.following_id;

    UPDATE public.users
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
    WHERE id = OLD.follower_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_follower_counts_trigger ON public.follows;
CREATE TRIGGER update_follower_counts_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follower_counts();

UPDATE public.users
SET
  followers_count = COALESCE((
    SELECT COUNT(*)::INTEGER
    FROM public.follows f
    WHERE f.following_id = public.users.id
  ), 0),
  following_count = COALESCE((
    SELECT COUNT(*)::INTEGER
    FROM public.follows f
    WHERE f.follower_id = public.users.id
  ), 0);

UPDATE public.users
SET
  followers_count = GREATEST(COALESCE(followers_count, 0), 0),
  following_count = GREATEST(COALESCE(following_count, 0), 0)
WHERE followers_count < 0
   OR following_count < 0
   OR followers_count IS NULL
   OR following_count IS NULL;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_followers_count_nonnegative,
  DROP CONSTRAINT IF EXISTS users_following_count_nonnegative;

ALTER TABLE public.users
  ADD CONSTRAINT users_followers_count_nonnegative CHECK (followers_count >= 0),
  ADD CONSTRAINT users_following_count_nonnegative CHECK (following_count >= 0);
