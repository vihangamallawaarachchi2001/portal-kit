import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = createServiceClient()

  const { data: client } = await service
    .from('clients')
    .select(`
      id,
      profiles:freelancer_id ( full_name, business_name, avatar_url, tagline, plan, hide_branding )
    `)
    .eq('portal_slug', slug)
    .is('deleted_at', null)
    .single()

  if (!client) return notFound('Portal not found')

  const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles

  const isPro        = profile?.plan !== 'free'
  const hideBranding = isPro && (profile?.hide_branding ?? false)

  return NextResponse.json(
    {
      businessName:  profile?.business_name || profile?.full_name || 'Your Portal',
      tagline:       profile?.tagline ?? null,
      avatarUrl:     profile?.avatar_url ?? null,
      hideBranding,
    },
    {
      status: 200,
      headers: {
        // Branding data changes rarely; cache at CDN edge for 60s, stale-while-revalidate 5min
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    }
  )
}
