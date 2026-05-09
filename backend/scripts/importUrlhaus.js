/**
 * URLhaus Import Script
 *
 * Mode 1 — Download directly from URLhaus (no API key needed):
 *   node backend/scripts/importUrlhaus.js --download
 *
 * Mode 2 — Use a locally saved URLhaus CSV file (includes threat type):
 *   node backend/scripts/importUrlhaus.js path/to/csv_recent.csv
 *
 * Re-running is safe — duplicate URLs are silently skipped (UNIQUE constraint).
 * --download fetches the public online-URL text list (~100k entries).
 * CSV mode parses the full dump for threat type metadata.
 */

import fs from 'fs'
import readline from 'readline'
import https from 'https'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') })

const BATCH_SIZE = 500
const URLHAUS_TEXT_URL = 'https://urlhaus.abuse.ch/downloads/text/'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY
)

// ── Helpers ──────────────────────────────────────────────────

const fetchText = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`URLhaus returned HTTP ${res.statusCode}`))
        return
      }
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data))
      res.on('error', reject)
    }).on('error', reject)
  })

const parseCsvLine = (line) => {
  const fields = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

const insertBatch = async (batch) => {
  const { error } = await supabase
    .from('blocklist')
    .upsert(batch, { onConflict: 'blUrl', ignoreDuplicates: true })
  if (error) throw error
}

// ── Download mode: plain text list, one URL per line ─────────

const runDownload = async () => {
  console.log('Downloading URLhaus online URL list...')
  const raw = await fetchText(URLHAUS_TEXT_URL)
  const lines = raw.split('\n').filter((l) => l.trim() && !l.startsWith('#'))
  console.log(`Got ${lines.length} URLs. Inserting in batches of ${BATCH_SIZE}...`)

  let inserted = 0
  for (let i = 0; i < lines.length; i += BATCH_SIZE) {
    const batch = lines.slice(i, i + BATCH_SIZE).map((url) => ({
      blUrl: url.trim(),
      blSource: 'URLhaus',
      blThreatType: null,
    }))
    await insertBatch(batch)
    inserted += batch.length
    process.stdout.write(`\r${inserted} / ${lines.length}`)
  }
  console.log(`\nDone. Inserted/updated: ${inserted}`)
}

// ── CSV mode: local file with full metadata ───────────────────

const runCsv = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }
  console.log(`Reading from file: ${filePath}`)

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  })

  // CSV columns: id, dateadded, url, url_status, last_online, threat, tags, urlhaus_link, reporter
  const ACTIVE_STATUSES = new Set(['online', 'unknown'])
  let batch = []
  let inserted = 0
  let skipped = 0

  for await (const line of rl) {
    if (line.startsWith('#') || !line.trim()) continue
    const f = parseCsvLine(line)
    const url = f[2]
    const status = f[3] ?? 'unknown'
    const threat = f[5] ?? null
    if (!url || !url.startsWith('http')) continue
    if (!ACTIVE_STATUSES.has(status)) { skipped++; continue }

    batch.push({ blUrl: url, blSource: 'URLhaus', blThreatType: threat || null })

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch)
      inserted += batch.length
      process.stdout.write(`\rInserted ${inserted}...`)
      batch = []
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch)
    inserted += batch.length
  }

  console.log(`\nDone. Inserted/updated: ${inserted} | Skipped (offline): ${skipped}`)
}

// ── Entry point ───────────────────────────────────────────────

const arg = process.argv[2]
const run = !arg || arg === '--download' ? runDownload : () => runCsv(arg)

run().catch((err) => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
