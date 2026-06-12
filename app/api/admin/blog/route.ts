import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ADMIN_COOKIE, verifySessionValue } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/service'
import { calcReadingTime } from '@/lib/blog'

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE)?.value
  return !!(session && verifySessionValue(session))
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    slug, title, excerpt, content, cover_image_url,
    tags, status, author_name, seo_title, seo_description,
  } = body

  if (!slug || !title) {
    return NextResponse.json({ error: 'slug and title are required' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const service = createServiceClient()
  const { data, error } = await service
    .from('blog_posts')
    .insert({
      slug,
      title,
      excerpt: excerpt || null,
      content: content || '',
      cover_image_url: cover_image_url || null,
      tags: tags || [],
      status: status || 'draft',
      published_at: status === 'published' ? now : null,
      reading_time_mins: content ? calcReadingTime(content) : 1,
      author_name: author_name || 'PortalKit Team',
      seo_title: seo_title || null,
      seo_description: seo_description || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/blog')
  return NextResponse.json(data, { status: 201 })
}
