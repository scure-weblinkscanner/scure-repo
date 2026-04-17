import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'adDetectionEnabled';

export const useAdDetection = () => {
  const [adDetectionEnabled, setAdDetectionEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'true') setAdDetectionEnabled(true);
    });
  }, []);

  const toggleAdDetection = async () => {
    const next = !adDetectionEnabled;
    setAdDetectionEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
  };

  return { adDetectionEnabled, toggleAdDetection };
};
