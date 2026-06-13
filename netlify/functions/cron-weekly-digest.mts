import type { Config } from '@netlify/functions'

export default async function handler() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/digest/weekly`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
  if (!res.ok) {
    throw new Error(`Weekly digest cron failed: ${res.status} ${await res.text()}`)
  }
}

export const config: Config = {
  schedule: '0 8 * * 1',
}
