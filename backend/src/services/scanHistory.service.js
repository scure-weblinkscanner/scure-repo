import * as scanHistoryDb from '../database/scanHistory.db.js'

export const createScanHistory = async (userId, scanMethod, scanData) => {
  return await scanHistoryDb.createScanHistory({
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
  })
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