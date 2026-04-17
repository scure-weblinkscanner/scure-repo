import * as blocklistDb from '../database/blocklist.db.js'

// Normalize a URL for consistent blocklist lookups:
// - Lowercases scheme and host (paths are case-sensitive so left as-is)
// - Strips a single trailing slash from the path
const normalizeUrl = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl)
    parsed.hostname = parsed.hostname.toLowerCase()
    parsed.protocol = parsed.protocol.toLowerCase()
    // Remove trailing slash only when there is no path beyond '/'
    const normalized = parsed.toString()
    return normalized.endsWith('/') && parsed.pathname === '/'
      ? normalized.slice(0, -1)
      : normalized
  } catch {
    return rawUrl
  }
}

export const checkBlocklist = async (url) => {
  const normalized = normalizeUrl(url)
  return await blocklistDb.checkUrlInBlocklist(normalized)
}

export const addMaliciousUrlToBlocklist = async (url, source, threatType = null) => {
  const normalized = normalizeUrl(url)
  await blocklistDb.addToBlocklist(normalized, source, threatType)
}
