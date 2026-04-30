import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../constants/api';

const STORAGE_KEY = 'adDetectionEnabled';

export const useAdDetection = () => {
  const { token } = useAuth();
  const [adDetectionEnabled, setAdDetectionEnabled] = useState(false);

  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          const val = data.sAdDetectionEnabled ?? false;
          setAdDetectionEnabled(val);
          AsyncStorage.setItem(STORAGE_KEY, String(val));
        })
        .catch(() => {
          AsyncStorage.getItem(STORAGE_KEY).then((val) => {
            if (val === 'true') setAdDetectionEnabled(true);
          });
        });
    } else {
      AsyncStorage.getItem(STORAGE_KEY).then((val) => {
        if (val === 'true') setAdDetectionEnabled(true);
      });
    }
  }, [token]);

  const toggleAdDetection = async () => {
    const previous = adDetectionEnabled;
    const next = !adDetectionEnabled;
    setAdDetectionEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
    try {
      if (token) {
        const res = await fetch(`${BASE_URL}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sAdDetectionEnabled: next }),
        });
        if (!res.ok) throw new Error('Save failed');
      }
      return next;
    } catch {
      setAdDetectionEnabled(previous);
      await AsyncStorage.setItem(STORAGE_KEY, String(previous));
      return 'error';
    }
  };

  return { adDetectionEnabled, toggleAdDetection };
};
