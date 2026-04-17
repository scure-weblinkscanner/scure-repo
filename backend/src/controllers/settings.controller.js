import { getUserSettings, updateUserSettings } from '../services/settings.service.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await getUserSettings(req.user.uaId);
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const patchSettings = async (req, res) => {
  try {
    const updated = await updateUserSettings(req.user.uaId, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
