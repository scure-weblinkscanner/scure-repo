import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, ImageBackground } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notificationsEnabled, toggleNotifications } = useNotifications();
  const [notifMsg, setNotifMsg] = useState('');
  const [notifMsgType, setNotifMsgType] = useState('success');

  const handleToggle = async () => {
    const result = await toggleNotifications();
    if (result === true) {
      setNotifMsgType('success');
      setNotifMsg('Security notifications are now enabled.');
      setTimeout(() => setNotifMsg(''), 3000);
    } else if (result === false) {
      setNotifMsgType('success');
      setNotifMsg('Security notifications are now disabled.');
      setTimeout(() => setNotifMsg(''), 3000);
    } else if (result === 'error') {
      setNotifMsgType('error');
      setNotifMsg('Failed to save preference. Please try again.');
      setTimeout(() => setNotifMsg(''), 3000);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.wrapper}
      resizeMode="cover"
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>APP NOTIFICATIONS</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="notifications-active" size={20} color="#555" style={{ marginRight: 12 }} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Security Notifications</Text>
                <Text style={styles.rowDesc}>
                  Receive a notification banner when your scan finishes.
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: '#333', true: '#0E0E95' }}
              thumbColor="#fff"
            />
          </View>
          {notifMsg ? (
            <View style={styles.toastRow}>
              <MaterialIcons
                name={notifMsgType === 'error' ? 'error-outline' : 'check-circle'}
                size={14}
                color={notifMsgType === 'error' ? '#ff6b6b' : '#4AFF91'}
              />
              <Text style={[styles.toastText, notifMsgType === 'error' && { color: '#ff6b6b' }]}>{notifMsg}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#0E0E95',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  sectionCard: {
    backgroundColor: '#141414',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#222',
    gap: 14,
  },
  sectionTitle: {
    fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 1.5,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12, color: '#888', lineHeight: 17,
  },
  toastRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#2a2a2a',
  },
  toastText: {
    fontSize: 12, color: '#4AFF91',
  },
});
