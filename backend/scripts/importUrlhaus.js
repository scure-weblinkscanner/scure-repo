/**
 * URLhaus CSV Import Script
 *
 * Mode 1 — Download directly from URLhaus:
 *   node backend/scripts/importUrlhaus.js --download
 *   (reads URLHAUS_API_KEY from backend/.env)
 *
 * Mode 2 — Use a locally saved CSV file:
 *   node backend/scripts/importUrlhaus.js path/to/urlhaus.csv
 *
 * Re-running is safe — duplicate URLs are silently skipped (UNIQUE constraint).
 *
 * Only rows with url_status 'online' or 'unknown' are imported.
 * The URLhaus full dump contains URLs from the past 90 days that are either
 * actively distributing malware or were recently added.
 */

import fs from 'fs'
import readline from 'readline'
import https from 'https'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') })

const BATCH_SIZE = 500
const ACTIVE_STATUSES = new Set(['online', 'unknown'])

// Full URL database dump endpoint (CSV)
// Auth key is embedded in the URL as per URLhaus API v2 docs
const URLHAUS_DUMP_URL = (key) =>
  `https://urlhaus-api.abuse.ch/v2/files/exports/${key}/online.csv`

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY
)

// ── Helpers ──────────────────────────────────────────────────

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

// Download the CSV from URLhaus and return a readable stream
const downloadCsv = (key) => {
  return new Promise((resolve, reject) => {
    const url = URLHAUS_DUMP_URL(key)
    console.log(`Downloading from URLhaus...`)
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        https.get(res.headers.location, (redirected) => {
          if (redirected.statusCode !== 200) {
            reject(new Error(`URLhaus returned HTTP ${redirected.statusCode}. Check your API key.`))
          } else {
            resolve(redirected)
          }
        }).on('error', reject)
      } else if (res.statusCode !== 200) {
        reject(new Error(`URLhaus returned HTTP ${res.statusCode}. Check your API key.`))
      } else {
        resolve(res)
      }
    }).on('error', reject)
  })
}

// ── Main ─────────────────────────────────────────────────────

const processStream = async (inputStream) => {
  const rl = readline.createInterface({ input: inputStream, crlfDelay: Infinity })

  // URLhaus online.csv has no header row. Fixed column positions:
  // 0:id  1:dateadded  2:url  3:url_status  4:last_online  5:threat  6:tags  7:urlhaus_link  8:reporter
  const URL_COL    = 2
  const STATUS_COL = 3
  const THREAT_COL = 5

  let batch = []
  let totalInserted = 0
  let totalSkipped = 0

  for await (const line of rl) {
    if (line.startsWith('#') || line.trim() === '') continue

    const fields = parseCsvLine(line)

    const url = fields[URL_COL]
    const status = fields[STATUS_COL] ?? 'unknown'
    const threat = fields[THREAT_COL] ?? null

    if (!url) continue

    if (!ACTIVE_STATUSES.has(status)) {
      totalSkipped++
      continue
    }

    batch.push({ blUrl: url, blSource: 'URLhaus', blThreatType: threat || null })

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch)
      totalInserted += batch.length
      process.stdout.write(`\rInserted ${totalInserted} rows...`)
      batch = []
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch)
    totalInserted += batch.length
  }

  console.log(`\nDone. Inserted/updated: ${totalInserted} | Skipped (offline): ${totalSkipped}`)
}

const run = async () => {
  const arg = process.argv[2]

  if (!arg || arg === '--download') {
    // Download mode
    const key = process.env.URLHAUS_API_KEY
    if (!key || key === 'your_urlhaus_auth_key_here') {
      console.error('Set URLHAUS_API_KEY in backend/.env before running with --download')
      process.exit(1)
    }
    const stream = await downloadCsv(key)
    await processStream(stream)
  } else {
    // Local file mode
    if (!fs.existsSync(arg)) {
      console.error(`File not found: ${arg}`)
      process.exit(1)
    }
    console.log(`Reading from file: ${arg}`)
    await processStream(fs.createReadStream(arg))
  }
}

run().catch((err) => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
