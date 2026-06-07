import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  const xSecret = req.headers.get('x-cron-secret')
  if (xSecret === process.env.CRON_SECRET) return true
  return false
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  // Before hard-deleting file rows, collect their storage paths so we can remove the objects too.
  // Without this step the DB rows vanish but the storage objects remain, accumulating cost indefinitely.
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: filesToDelete } = await service
    .from('files')
    .select('storage_path')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff)

  const storagePaths = (filesToDelete ?? [])
    .map(f => (f as { storage_path: string }).storage_path)
    .filter(Boolean)

  if (storagePaths.length > 0) {
    const { error: storageErr } = await service.storage.from('portalkit_bucket').remove(storagePaths)
    if (storageErr) console.error('[cron/cleanup] storage remove failed', storageErr)
  }

  const [{ data: hardDeleted, error: e1 }, { data: sessionsPurged, error: e2 }] = await Promise.all([
    service.rpc('hard_delete_old_soft_deleted'),
    service.rpc('purge_expired_portal_sessions'),
  ])

  if (e1) console.error('[cron/cleanup] hard_delete_old_soft_deleted failed', e1)
  if (e2) console.error('[cron/cleanup] purge_expired_portal_sessions failed', e2)

  return NextResponse.json({
    ok: true,
    storagePathsRemoved: storagePaths.length,
    hardDeleted: hardDeleted ?? null,
    sessionsPurged: sessionsPurged ?? 0,
  })
}

export async function POST(req: Request) {
  return GET(req)
}
