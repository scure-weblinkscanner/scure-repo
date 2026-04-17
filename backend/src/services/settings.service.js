import { getSettings, upsertSettings } from '../database/settings.db.js';

export const getUserSettings = async (uaId) => {
  const row = await getSettings(uaId);
  return row ?? { sNotificationsEnabled: false, sAdDetectionEnabled: false };
};

export const updateUserSettings = async (uaId, updates) => {
  const allowed = {};
  if (typeof updates.sNotificationsEnabled === 'boolean') allowed.sNotificationsEnabled = updates.sNotificationsEnabled;
  if (typeof updates.sAdDetectionEnabled === 'boolean') allowed.sAdDetectionEnabled = updates.sAdDetectionEnabled;
  return await upsertSettings(uaId, allowed);
};
