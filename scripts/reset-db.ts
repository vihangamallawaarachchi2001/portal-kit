#!/usr/bin/env node
/**
 * scripts/reset-db.ts
 *
 * Empties all data from every application table.
 * Does NOT drop tables, schemas, or auth.users — structure is preserved.
 *
 * Run:
 *   pnpm dlx tsx scripts/reset-db.ts
 */

import { readFileSync } from 'fs'
import { resolve }      from 'path'
import { createInterface } from 'readline'
import { createClient }    from '@supabase/supabase-js'

// ── load .env ──────────────────────────────────────────────────────────────
try {
  const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/)
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* no .env file — rely on actual environment vars */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('\n  ✗  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY\n')
  process.exit(1)
}

// ── prompt helper ──────────────────────────────────────────────────────────
function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()) }))
}

// ── deletion order (leaf tables first — respects all FK constraints) ───────
//
//  admin_tokens       — no FK
//  team_invites       — FK → auth.users only
//  push_subscriptions — no public FK
//  portal_sessions    — FK → clients
//  messages           — FK → projects
//  files              — FK → projects
//  invoices           — FK → clients, projects
//  projects           — FK → clients
//  clients            — FK → profiles
//  profiles           — FK → auth.users  (root public table)
//
const TABLES = [
  'admin_tokens',
  'team_invites',
  'push_subscriptions',
  'portal_sessions',
  'messages',
  'files',
  'invoices',
  'projects',
  'clients',
  'profiles',
] as const

async function main() {
  const service = createClient(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('\n  ┌─────────────────────────────────────────┐')
  console.log('  │         DATABASE RESET — PORTALKIT      │')
  console.log('  └─────────────────────────────────────────┘')
  console.log(`\n  Project:  ${SUPABASE_URL}`)
  console.log(`  Tables:   ${TABLES.length} public tables will be cleared`)
  console.log('\n  This removes ALL rows from every table.')
  console.log('  Schema, migrations, and auth.users are NOT touched.\n')

  const answer = await prompt('  Type "yes" to continue, anything else to abort: ')
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n  Aborted — no changes made.\n')
    process.exit(0)
  }

  console.log('\n  Clearing tables...\n')

  let totalDeleted = 0
  let errCount     = 0

  for (const table of TABLES) {
    const { error, count } = await service
      .from(table)
      .delete({ count: 'exact' })
      .not('id', 'is', null)

    const pad = table.padEnd(22)

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log(`  ⊘  ${pad}  (table not found — migration not yet run)`)
      } else {
        console.error(`  ✗  ${pad}  ERROR: ${error.message}`)
        errCount++
      }
    } else {
      const n = count ?? 0
      totalDeleted += n
      console.log(`  ✓  ${pad}  ${String(n).padStart(5)} row${n !== 1 ? 's' : ' '} deleted`)
    }
  }

  console.log(`\n  ────────────────────────────────────────────`)
  console.log(`  Total rows removed: ${totalDeleted}`)
  if (errCount) console.error(`  Errors:             ${errCount} (see above)`)
  console.log('')
  console.log('  Note: auth.users (Supabase Auth) are NOT deleted.')
  console.log('  To clear test auth users, use the Supabase Dashboard → Authentication.')
  if (process.env.STORAGE_BUCKET) {
    console.log(`  Note: Storage bucket "${process.env.STORAGE_BUCKET}" was NOT cleared.`)
    console.log('  To clear storage, delete objects via Supabase Dashboard → Storage.')
  }
  console.log('')
}

main().catch(err => {
  console.error('\n  Fatal error:', err)
  process.exit(1)
})
