import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../constants/api';

const STORAGE_KEY = 'notificationsEnabled';

const CHANNEL_ALERT = 'scure-alerts';
const CHANNEL_INFO  = 'scure-scans';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const setupChannels = async () => {
  await Notifications.setNotificationChannelAsync(CHANNEL_ALERT, {
    name: 'Threat Alerts',
    description: 'Urgent alerts for malicious or suspicious URLs',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#FF6B6B',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_INFO, {
    name: 'Scan Complete',
    description: 'Notifications when your background scan finishes',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
};

const VERDICT_CONFIG = {
  malicious:  { emoji: '🚨', color: '#FF6B6B', channel: CHANNEL_ALERT, subtitle: 'Dangerous URL detected' },
  suspicious: { emoji: '⚠️', color: '#FFD60A', channel: CHANNEL_ALERT, subtitle: 'Suspicious URL detected' },
  clean:      { emoji: '✅', color: '#4AFF91', channel: CHANNEL_INFO,  subtitle: 'Scan complete'           },
  unknown:    { emoji: '🔍', color: '#0E0E95', channel: CHANNEL_INFO,  subtitle: 'Scan complete'           },
};

export const useNotifications = () => {
  const { token } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setupChannels().catch(() => {});
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          const val = data.sNotificationsEnabled ?? false;
          setNotificationsEnabled(val);
          AsyncStorage.setItem(STORAGE_KEY, String(val));
        })
        .catch(() => {
          AsyncStorage.getItem(STORAGE_KEY).then((val) => {
            if (val === 'true') setNotificationsEnabled(true);
          });
        });
    } else {
      AsyncStorage.getItem(STORAGE_KEY).then((val) => {
        if (val === 'true') setNotificationsEnabled(true);
      });
    }
  }, [token]);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return false;
    }
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
    if (token) {
      fetch(`${BASE_URL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sNotificationsEnabled: next }),
      }).catch(() => {});
    }
    return true;
  };

  const sendScanCompleteNotification = async (result) => {
    const verdict = result?.overallVerdict ?? 'unknown';
    const url = result?.url ?? 'the scanned link';
    const cfg = VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG.unknown;

    const title =
      verdict === 'malicious'  ? `${cfg.emoji} Dangerous link detected` :
      verdict === 'suspicious' ? `${cfg.emoji} Suspicious link detected` :
                                 `${cfg.emoji} Scan complete — link is safe`;

    const body =
      verdict === 'malicious'  ? `This URL was flagged as malicious. Do not visit it.\n${url}` :
      verdict === 'suspicious' ? `This URL looks suspicious. Tap to view the full report.\n${url}` :
                                 `No threats found. Tap to view the full report.\n${url}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        subtitle: cfg.subtitle,       // iOS: smaller line under the title
        color: cfg.color,             // Android: accent colour on the icon
        data: { navigateTo: 'scanURLResult' },
        sound: 'default',
      },
      trigger: { channelId: cfg.channel },
    });
  };

  return { notificationsEnabled, toggleNotifications, sendScanCompleteNotification };
};
