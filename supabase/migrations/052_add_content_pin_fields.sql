ALTER TABLE public.contents
ADD COLUMN IF NOT EXISTS is_profile_pinned BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_site_pinned BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_contents_profile_pinned
ON public.contents (author_id, is_profile_pinned DESC, created_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contents_site_pinned
ON public.contents (is_site_pinned DESC, created_at DESC)
WHERE deleted_at IS NULL;
