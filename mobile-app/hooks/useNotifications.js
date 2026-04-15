import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notificationsEnabled';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'true') setNotificationsEnabled(true);
    });
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return false;
    }
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
    return true;
  };

  const sendScanCompleteNotification = async (result) => {
    const verdict = result?.overallVerdict;
    const url = result?.url ?? 'the link';

    const title =
      verdict === 'malicious' ? '⚠️ Malicious link detected' :
      verdict === 'suspicious' ? '⚠️ Suspicious link detected' :
      '✅ Scan complete';

    const body =
      verdict === 'malicious' ? `${url} was flagged as malicious. Tap to view the full report.` :
      verdict === 'suspicious' ? `${url} looks suspicious. Tap to view the full report.` :
      `${url} appears clean. Tap to view the full report.`;

    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { navigateTo: 'scanURLResult' } },
      trigger: null,
    });
  };

  return { notificationsEnabled, toggleNotifications, sendScanCompleteNotification };
};
