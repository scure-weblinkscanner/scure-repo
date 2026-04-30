import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, ImageBackground } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useAdDetection } from '../hooks/useAdDetection';

const PREMIUM_PROFILE_ID = 3;

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { account } = useAuth();
  const { adDetectionEnabled, toggleAdDetection } = useAdDetection();
  const isPremium = account?.uaUserProfileId === PREMIUM_PROFILE_ID;
  const [adToggleMsg, setAdToggleMsg] = useState('');
  const [adToggleMsgType, setAdToggleMsgType] = useState('success');

  const handleAdToggle = async () => {
    if (!isPremium) return;
    const result = await toggleAdDetection();
    if (result === 'error') {
      setAdToggleMsgType('error');
      setAdToggleMsg('Failed to save preference. Please try again.');
    } else {
      setAdToggleMsgType('success');
      setAdToggleMsg(result
        ? 'Ad Intensive Detection is now enabled.'
        : 'Ad Intensive Detection is now disabled.'
      );
    }
    setTimeout(() => setAdToggleMsg(''), 3000);
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
        <Text style={styles.navTitle}>Security Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SCAN FEATURES</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="ad-units" size={20} color="#555" style={{ marginRight: 12 }} />
              <View style={styles.rowText}>
                <View style={styles.rowTitleRow}>
                  <Text style={styles.rowTitle}>Ad Intensive Detection</Text>
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="workspace-premium" size={10} color="#FFD60A" />
                    <Text style={styles.premiumBadgeText}>Premium</Text>
                  </View>
                </View>
                <Text style={styles.rowDesc}>
                  Analyzes the page for excessive ads, pop-ups, and ad scripts that may slow down or disrupt your browsing experience.
                </Text>
                {!isPremium && (
                  <Text style={styles.lockedNote}>Upgrade to Premium to use this feature.</Text>
                )}
              </View>
            </View>
            <Switch
              value={isPremium ? adDetectionEnabled : false}
              onValueChange={handleAdToggle}
              disabled={!isPremium}
              trackColor={{ false: '#333', true: '#0E0E95' }}
              thumbColor={isPremium ? '#fff' : '#555'}
            />
          </View>
          {adToggleMsg ? (
            <View style={styles.toastRow}>
              <MaterialIcons
                name={adToggleMsgType === 'error' ? 'error-outline' : 'check-circle'}
                size={14}
                color={adToggleMsgType === 'error' ? '#ff6b6b' : '#4AFF91'}
              />
              <Text style={[styles.toastText, adToggleMsgType === 'error' && { color: '#ff6b6b' }]}>{adToggleMsg}</Text>
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
    flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 12,
  },
  rowText: { flex: 1 },
  rowTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2,
  },
  rowTitle: {
    fontSize: 15, fontWeight: '600', color: '#fff',
  },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,214,10,0.12)', borderRadius: 50,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255,214,10,0.3)',
  },
  premiumBadgeText: {
    fontSize: 10, color: '#FFD60A', fontWeight: '700',
  },
  rowDesc: {
    fontSize: 12, color: '#888', lineHeight: 17,
  },
  lockedNote: {
    fontSize: 11, color: 'rgba(255,214,10,0.6)', marginTop: 4,
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
