import { createServiceClient } from '@/lib/supabase/service'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  tags: string[]
  status: 'draft' | 'published'
  published_at: string | null
  reading_time_mins: number | null
  author_name: string
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('getPublishedPosts error:', error)
    return []
  }
  return (data ?? []) as BlogPost[]
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as BlogPost
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllPosts error:', error)
    return []
  }
  return (data ?? []) as BlogPost[]
}

export async function getAllPublishedSlugs(): Promise<{ slug: string }[]> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')

  if (error) return []
  return (data ?? []) as { slug: string }[]
}

export function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
