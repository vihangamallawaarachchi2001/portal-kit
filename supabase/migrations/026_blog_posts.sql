-- Blog posts table for PortalKit public blog
-- Written/published via admin panel (/admin/blog), served publicly via ISR

CREATE TABLE public.blog_posts (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  slug              TEXT         UNIQUE NOT NULL,
  title             TEXT         NOT NULL,
  excerpt           TEXT,
  content           TEXT         NOT NULL DEFAULT '',   -- Tiptap HTML output
  cover_image_url   TEXT,
  tags              TEXT[]       DEFAULT '{}',
  status            TEXT         NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft', 'published')),
  published_at      TIMESTAMPTZ,
  reading_time_mins INTEGER,
  author_name       TEXT         NOT NULL DEFAULT 'PortalKit Team',
  seo_title         TEXT,
  seo_description   TEXT,
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- Index for public listing query
CREATE INDEX blog_posts_status_published_at_idx
  ON public.blog_posts (status, published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts (needed for ISR + public routes using anon key)
CREATE POLICY "Published posts readable by anyone"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- All writes go through service role (admin panel API routes) — no extra policy needed
