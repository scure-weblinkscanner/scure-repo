import { useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
  ImageBackground,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { getSubscriptionByUser, cancelSubscription } from '../services/subscriptionPlan.service';
import { getUserAccountById } from '../services/userAccount.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const UPGRADE_URL = 'https://scure.up.railway.app/upgrade';

const FREE_FEATURES = [
  'Basic URL Scanning',
  '10 Scans Per Day',
  'Single Engine Scanning',
  'Basic Scan History (last 10 scans)',
];

const PREMIUM_FEATURES = [
  'Unlimited Scans',
  'View Public Scans',
  'Ad Intensive Mode',
  'Multi-Engine Scanning (VirusTotal, URLScan.io, Google Safe Browsing, Gemini AI)',
  'AI Script Analysis',
  'Camera URL Detection',
  'QR Code Scanner',
  'Full Scan History',
];

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token, account, login } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const isPremium = account?.uaUserProfileId === 3;
  const formatStatus = (status) => status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    if (loading) loop.start();
    return () => loop.stop();
  }, [loading]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubscriptionByUser(account.uaId, token);
        setSubscription(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (account?.uaId) {
      load();
    } else {
      setLoading(false);
    }
  }, []);

  const handleCancelSubscription = () => setShowCancelModal(true);

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    setCancelling(true);
    try {
      await cancelSubscription(subscription.spId, account.uaId, token);
      const updatedAccount = await getUserAccountById(account.uaId, token);
      await login(token, updatedAccount);
      const updatedSub = await getSubscriptionByUser(account.uaId, token);
      setSubscription(updatedSub);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleUpgrade = () => {
    Linking.openURL(UPGRADE_URL);
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.wrapper}
      resizeMode="cover"
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 90}]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Animated.View style={{ opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }}>
            {/* Header skeleton */}
            <View style={styles.skeletonHeaderRow}>
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonLineLg} />
              <View style={styles.skeletonLineSm} />
            </View>
            {/* Card skeleton */}
            <View style={styles.sectionCard}>
              <View style={styles.skeletonLineSm} />
              <View style={styles.skeletonPlanRow}>
                <View style={styles.skeletonLineMd} />
                <View style={styles.skeletonLineXs} />
              </View>
              <View style={styles.divider} />
              <View style={[styles.skeletonLineSm, { width: '60%' }]} />
              <View style={[styles.skeletonLineSm, { width: '45%', marginTop: 10 }]} />
            </View>
            {/* Features card skeleton */}
            <View style={styles.sectionCard}>
              <View style={styles.skeletonLineSm} />
              {[...Array(4)].map((_, i) => (
                <View key={i} style={styles.skeletonFeatureRow}>
                  <View style={styles.skeletonIcon} />
                  <View style={[styles.skeletonLineSm, { flex: 1, width: undefined }]} />
                </View>
              ))}
            </View>
          </Animated.View>
        ) : error ? (
          <View style={styles.errorRow}>
            <MaterialIcons name="error-outline" size={15} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerIcon}>
                <MaterialIcons
                  name={isPremium ? 'workspace-premium' : 'card-membership'}
                  size={32}
                  color="#fff"
                />
              </View>
              <Text style={styles.headerTitle}>
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isPremium
                  ? 'You have full access to all Premium features.'
                  : 'Upgrade to unlock all Premium features.'}
              </Text>
            </View>

            {/* Current Plan Card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>CURRENT PLAN</Text>

              <View style={styles.planRow}>
                <Text style={styles.planName}>
                  {isPremium ? 'Premium Plan' : 'Free Plan'}
                </Text>
                <Text style={styles.planPrice}>
                  {isPremium ? '$9.99 / mo' : '$0 / mo'}
                </Text>
              </View>

              {isPremium && subscription?.spNextBillingDate && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Next Billing Date</Text>
                    <Text style={styles.metaValue}>
                      {new Date(subscription.spNextBillingDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Status</Text>
                    <Text style={[styles.metaValue, {color: subscription.spStatus === 'active' ? '#4AFF91' : '#ff6b6b'}]}>{formatStatus(subscription.spStatus)}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Features Card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {isPremium ? 'YOUR FEATURES' : 'FREE FEATURES'}
              </Text>

              {(isPremium ? PREMIUM_FEATURES : FREE_FEATURES).map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <MaterialIcons name="check-circle" size={16} color="#4AFF91" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Premium Features Preview (free users only) */}
            {!isPremium && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>PREMIUM FEATURES</Text>

                {PREMIUM_FEATURES.map((feature, i) => (
                  <View key={i} style={styles.featureRow}>
                    <MaterialIcons name="lock" size={16} color="#555" />
                    <Text style={[styles.featureText, { color: '#555' }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      {!loading && !error && (
        <View style={[styles.bottomBar, {paddingBottom: insets.bottom + 15}]}>
          {isPremium ? (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelSubscription}
              disabled={cancelling}
              activeOpacity={0.85}
            >
              <MaterialIcons name="cancel" size={20} color={cancelling ? 'rgba(255,255,255,0.2)' : '#ff6b6b'} />
              <Text style={[styles.cancelBtnText, cancelling && { color: 'rgba(255,255,255,0.2)' }]}>
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={handleUpgrade}
              activeOpacity={0.85}
            >
              <MaterialIcons name="workspace-premium" size={20} color="#000" />
              <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Cancel Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showCancelModal}
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <MaterialIcons name="cancel" size={48} color="#ff6b6b" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Cancel Subscription?</Text>
            <Text style={styles.modalMessage}>
              You will be downgraded to the Free plan immediately and lose access to all Premium features.
            </Text>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={handleConfirmCancel}>
              <Text style={styles.modalCancelBtnText}>Yes, Cancel Subscription</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalKeepBtn} onPress={() => setShowCancelModal(false)}>
              <Text style={styles.modalKeepBtnText}>Keep Premium</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  content: { paddingHorizontal: 20},

  infoText: { color: '#fff', fontSize: 14, textAlign: 'center', paddingVertical: 40 },

  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 20, paddingHorizontal: 4,
  },
  errorText: { color: '#ff6b6b', fontSize: 13 },

  headerRow: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  headerIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#0E0E95',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 19 },

  sectionCard: {
    backgroundColor: '#141414', borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1.5, borderColor: '#222', marginBottom: 10,
  },
  sectionTitle: { fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },

  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  planPrice: { fontSize: 15, fontWeight: '600', color: '#fff' },

  divider: { height: 1, backgroundColor: '#222', marginVertical: 14 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaLabel: { fontSize: 13, color: '#fff' },
  metaValue: { fontSize: 13, color: '#fff', fontWeight: '600' },

  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  featureText: { fontSize: 14, color: '#fff', flex: 1, lineHeight: 20 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0A0A0A', paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#1E1E1E',
  },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFD60A', borderRadius: 50, paddingVertical: 17,
  },
  upgradeBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },

  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1E1E1E', borderRadius: 50, paddingVertical: 17,
    borderWidth: 1, borderColor: '#ff6b6b',
  },
  cancelBtnText: { color: '#ff6b6b', fontSize: 16, fontWeight: '700' },

  skeletonHeaderRow: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  skeletonCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#222' },
  skeletonLineLg: { width: '50%', height: 16, borderRadius: 8, backgroundColor: '#222' },
  skeletonLineMd: { width: '40%', height: 14, borderRadius: 6, backgroundColor: '#222' },
  skeletonLineSm: { width: '30%', height: 10, borderRadius: 6, backgroundColor: '#222', marginBottom: 8 },
  skeletonLineXs: { width: '20%', height: 10, borderRadius: 6, backgroundColor: '#222' },
  skeletonPlanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  skeletonFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  skeletonIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#222' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#141414', borderRadius: 20,
    padding: 28, width: '80%', alignItems: 'center',
    borderWidth: 1, borderColor: '#222',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalCancelBtn: {
    backgroundColor: '#ff6b6b', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
    width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalCancelBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalKeepBtn: {
    backgroundColor: '#1E1E1E', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
    width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: '#333',
  },
  modalKeepBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 15 },
});
