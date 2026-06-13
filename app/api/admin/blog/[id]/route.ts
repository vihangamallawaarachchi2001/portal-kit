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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const service = createServiceClient()
  const { data, error } = await service
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const service = createServiceClient()

  // Fetch existing to know old slug + old status
  const { data: existing } = await service
    .from('blog_posts')
    .select('slug, status')
    .eq('id', id)
    .single()

  const {
    slug, title, excerpt, content, cover_image_url,
    tags, status, author_name, seo_title, seo_description,
  } = body

  const now = new Date().toISOString()
  const wasUnpublished = existing?.status !== 'published'
  const becomesPublished = status === 'published'

  const { data, error } = await service
    .from('blog_posts')
    .update({
      ...(slug !== undefined && { slug }),
      ...(title !== undefined && { title }),
      excerpt: excerpt ?? null,
      ...(content !== undefined && { content }),
      cover_image_url: cover_image_url ?? null,
      tags: tags ?? [],
      status: status ?? 'draft',
      published_at: becomesPublished && wasUnpublished ? now : (status === 'draft' ? null : undefined),
      reading_time_mins: content ? calcReadingTime(content) : undefined,
      author_name: author_name ?? 'PortalKit Team',
      seo_title: seo_title ?? null,
      seo_description: seo_description ?? null,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/blog')
  // Revalidate old slug path if slug changed
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)
  if (data.slug && data.slug !== existing?.slug) revalidatePath(`/blog/${data.slug}`)

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const service = createServiceClient()

  // Fetch slug before delete for revalidation
  const { data: existing } = await service
    .from('blog_posts')
    .select('slug')
    .eq('id', id)
    .single()

  const { error } = await service
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/blog')
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)

  return NextResponse.json({ success: true })
}
