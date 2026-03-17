import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { updateUserAccount } from '../services/userAccount.service';

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { token, account, login } = useAuth();

  const [username, setUsername] = useState(account?.uaUsername ?? '');
  const [email, setEmail] = useState(account?.uaEmail ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const saveAnim = useRef(new Animated.Value(0.2)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (saving) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(saveAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(saveAnim, { toValue: 0.2, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      saveAnim.stopAnimation();
      saveAnim.setValue(0.2);
    }
  }, [saving]);

  const hasChanges =
    username.trim() !== (account?.uaUsername ?? '') ||
    email.trim() !== (account?.uaEmail ?? '');

  const handleSave = () => {
    if (!hasChanges || saving) return;

    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    Alert.alert(
      'Save Changes',
      'Are you sure you want to update your account details?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', style: 'default', onPress: () => confirmSave() },
      ]
    );
  };

  const confirmSave = async () => {
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const updated = await updateUserAccount(
        account?.uaId,
        { uaUsername: username.trim(), uaEmail: email.trim() },
        token
      );
      await login(token, {
        ...account,
        uaUsername: updated.uaUsername ?? username.trim(),
        uaEmail: updated.uaEmail ?? email.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Account Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(account?.uaUsername ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.avatarName}>{account?.uaUsername ?? 'User'}</Text>
              <Text style={styles.avatarEmail}>{account?.uaEmail ?? ''}</Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>PROFILE INFORMATION</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>USERNAME</Text>
                <View style={styles.inputRow}>
                  <MaterialIcons name="person" size={18} color="#555" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={(t) => { setUsername(t); setError(''); setSuccess(false); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!saving}
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL</Text>
                <View style={styles.inputRow}>
                  <MaterialIcons name="email" size={18} color="#555" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(''); setSuccess(false); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!saving}
                    placeholderTextColor="#555"
                  />
                </View>
              </View>
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <MaterialIcons name="error-outline" size={15} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successRow}>
                <MaterialIcons name="check-circle" size={15} color="#34C759" />
                <Text style={styles.successText}>Account updated successfully!</Text>
              </View>
            ) : null}

            <View style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={16} color="#555" />
              <Text style={styles.infoText}>
                Changes to your username and email will be reflected immediately after saving.
              </Text>
            </View>

          </Animated.View>
        </ScrollView>

        <View style={styles.bottomBar}>
          {saving ? (
            <View style={styles.loadingBarContainer}>
              <Text style={styles.loadingBarLabel}>Saving changes…</Text>
              <View style={styles.loadingBarTrack}>
                <Animated.View style={[styles.loadingBarFill, { opacity: saveAnim }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!hasChanges}
              activeOpacity={hasChanges ? 0.85 : 1}
            >
              <MaterialIcons name="save" size={20} color={hasChanges ? '#000' : 'rgba(255,255,255,0.2)'} />
              <Text style={[styles.saveBtnText, !hasChanges && styles.saveBtnTextDisabled]}>
                {hasChanges ? 'Save Changes' : 'No Changes'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0A0A0A' },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#0A0A0A',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  avatarRow: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFD60A', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#000' },
  avatarName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  avatarEmail: { fontSize: 13, color: '#666' },
  sectionCard: {
    backgroundColor: '#141414', borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1.5, borderColor: '#222', marginBottom: 10,
  },
  sectionTitle: { fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 1.2 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, fontSize: 15, color: '#fff',
    paddingVertical: 6,
  },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 14 },
  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 12, paddingHorizontal: 4,
  },
  errorText: { color: '#ff6b6b', fontSize: 13 },
  successRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 12, paddingHorizontal: 4,
  },
  successText: { color: '#34C759', fontSize: 13 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#141414', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#222',
  },
  infoText: { color: '#555', fontSize: 12, lineHeight: 18, flex: 1 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0A0A0A', paddingHorizontal: 20,
    paddingTop: 12, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: '#1E1E1E',
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFD60A', borderRadius: 50, paddingVertical: 17,
  },
  saveBtnDisabled: { backgroundColor: '#1E1E1E' },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  saveBtnTextDisabled: { color: 'rgba(255,255,255,0.2)' },
  loadingBarContainer: {
    width: '100%', alignItems: 'center', gap: 10, paddingVertical: 15,
  },
  loadingBarLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' },
  loadingBarTrack: {
    width: '100%', height: 4, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  loadingBarFill: {
    width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#FFD60A',
  },
});