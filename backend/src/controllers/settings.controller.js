import jwt from 'jsonwebtoken';
import { getUserSettings, updateUserSettings } from '../services/settings.service.js';

const decodeUser = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const getSettings = async (req, res) => {
  try {
    const { uaId } = decodeUser(req);
    const settings = await getUserSettings(uaId);
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const patchSettings = async (req, res) => {
  try {
    const { uaId } = decodeUser(req);
    const updated = await updateUserSettings(uaId, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
