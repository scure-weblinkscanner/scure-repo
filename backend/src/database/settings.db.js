import { supabase } from '../utils/supabaseClient.js';

export const getSettings = async (uaId) => {
  const { data, error } = await supabase
    .from('settings')
    .select('sNotificationsEnabled, sAdDetectionEnabled')
    .eq('sUaId', uaId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertSettings = async (uaId, updates) => {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ sUaId: uaId, ...updates, sUpdatedAt: new Date().toISOString() }, { onConflict: 'sUaId' })
    .select('sNotificationsEnabled, sAdDetectionEnabled')
    .single();
  if (error) throw error;
  return data;
};
