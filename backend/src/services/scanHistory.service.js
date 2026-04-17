import * as scanHistoryDb from '../database/scanHistory.db.js'
import { addMaliciousUrlToBlocklist } from './blocklist.service.js'

export const createScanHistory = async (userId, scanMethod, scanData) => {
  const result = await scanHistoryDb.createScanHistory({
    shUserId: userId,
    shScanMethod: scanMethod,
    shUrl: scanData.url,
    shVerdict: scanData.overallVerdict,
    shRiskScore: scanData.riskScore,
    shScoreLabel: scanData.scoreLabel,
    shSuggestion: scanData.suggestion,
    shFlaggedBy: scanData.flaggedBy,
    shUrlscan: scanData.urlscan,
    shVirustotal: scanData.virustotal,
    shSafebrowsing: scanData.safebrowsing,
    shScriptAnalysis: scanData.scriptAnalysis,
    shEmbeddedLinks: scanData.embeddedLinks,
  })

  // Auto-sync malicious URLs to blocklist so future scans are instant.
  // Guard: skip if this scan was itself a blocklist hit (url is already there).
  if (scanData.overallVerdict === 'malicious' && !scanData.blocklist) {
    const source = Array.isArray(scanData.flaggedBy) && scanData.flaggedBy.length
      ? scanData.flaggedBy.join(', ')
      : 'scan_history'
    addMaliciousUrlToBlocklist(scanData.url, source, scanData.overallVerdict).catch((err) =>
      console.error('Failed to sync malicious URL to blocklist:', err.message)
    )
  }

  return result
}

export const getScanHistoryByUserId = async (userId) => {
  return await scanHistoryDb.getScanHistoryByUserId(userId)
}

export const publishScanHistory = async (shId, userId) => {
  return await scanHistoryDb.publishScanHistory(shId, userId)
}

export const getPublicScans = async () => {
  return await scanHistoryDb.getPublicScans()
}

export const getScanActivity = async (period) => {
  return await scanHistoryDb.getScanActivity(period)
}

export const getAllScansAdmin = async () => {
  return await scanHistoryDb.getAllScansAdmin()
}