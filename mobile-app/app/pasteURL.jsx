import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Clipboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { analyzeUrl } from '../services/scanApi.service';
import { useScan } from '../context/ScanContext';

const normalizeUrl = (url) => {
  const u = url.trim().toLowerCase();
  if (u.startsWith('http://') || u.startsWith('https://')) return url.trim();
  return 'https://' + url.trim();
};

const isValidUrl = (url) => {
  try {
    new URL(normalizeUrl(url));
    return true;
  } catch {
    return false;
  }
};

export default function PasteURLScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { setScanResult } = useScan();

  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      if (text?.trim()) {
        setUrl(text.trim());
        setError('');
      } else {
        Alert.alert('Clipboard is empty', 'Copy a URL first then tap Paste.');
      }
    } catch {
      Alert.alert('Could not read clipboard');
    }
  };

  const handleClear = () => {
    setUrl('');
    setError('');
  };

  const handleScan = async () => {
    if (!url.trim() || scanning) return;
    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL (e.g. https://example.com)');
      return;
    }
    setError('');
    setScanning(true);
    try {
      const normalized = normalizeUrl(url.trim());
      const result = await analyzeUrl(normalized, token);
      setScanResult(result);
      router.push({ pathname: '/scanURLResult' });
    } catch (err) {
      setError('Scan failed: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const canScan = url.trim().length > 0 && !scanning;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Paste URL</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.heroRow}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="content-paste" size={28} color="#111" />
              </View>
              <Text style={styles.headline}>Check a link</Text>
              <Text style={styles.subheadline}>
                Paste or type any URL below to scan it for threats across multiple security engines.
              </Text>
            </View>

            <View style={[styles.inputCard, error ? styles.inputCardError : null]}>
              <Text style={styles.inputLabel}>URL TO SCAN</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com"
                  placeholderTextColor="#AAA"
                  value={url}
                  onChangeText={(t) => { setUrl(t); setError(''); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="done"
                  onSubmitEditing={handleScan}
                  editable={!scanning}
                />
                {url.length > 0 ? (
                  <TouchableOpacity style={styles.clearBtn} onPress={handleClear} hitSlop={8}>
                    <MaterialIcons name="close" size={18} color="#999" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.pasteRow} onPress={handlePaste} disabled={scanning}>
                <MaterialIcons name="content-paste" size={18} color="#555" />
                <Text style={styles.pasteText}>Paste from clipboard</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <MaterialIcons name="error-outline" size={15} color="#E53935" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.enginesCard}>
              <Text style={styles.enginesTitle}>Scanned by 4 engines</Text>
              <View style={styles.enginesList}>
                {[
                  { icon: 'bug-report', label: 'VirusTotal' },
                  { icon: 'security', label: 'Safe Browsing' },
                  { icon: 'travel-explore', label: 'URLScan.io' },
                  { icon: 'smart-toy', label: 'AI Analysis' },
                ].map(({ icon, label }) => (
                  <View key={label} style={styles.engineChip}>
                    <MaterialIcons name={icon} size={14} color="#555" />
                    <Text style={styles.engineLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.bottomBar}>
          {scanning ? (
            <View style={styles.scanningContainer}>
              <View style={styles.analyzingPill}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.analyzingPillText}>Analyzing...</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.scanBtn, !canScan && styles.scanBtnDisabled]}
              onPress={handleScan}
              disabled={!canScan}
              activeOpacity={canScan ? 0.85 : 1}
            >
              <MaterialIcons
                name="shield"
                size={20}
                color={canScan ? '#fff' : 'rgba(255,255,255,0.3)'}
              />
              <Text style={[styles.scanBtnText, !canScan && styles.scanBtnTextDisabled]}>
                {url.trim() ? 'Scan this URL' : 'Enter a URL above'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F5F5' },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  heroRow: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#E8E8E8', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  headline: { fontSize: 24, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  subheadline: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  inputCard: {
    backgroundColor: '#fff', borderRadius: 18,
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4,
    borderWidth: 1.5, borderColor: '#E8E8E8',
    marginBottom: 10,
  },
  inputCardError: { borderColor: '#E53935' },
  inputLabel: { fontSize: 10, color: '#AAA', fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1, fontSize: 15, color: '#111',
    paddingVertical: 4, paddingRight: 8,
    minHeight: 40,
  },
  clearBtn: {
    padding: 4, backgroundColor: '#F0F0F0',
    borderRadius: 50, marginLeft: 4,
  },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  pasteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10,
  },
  pasteText: { color: '#555', fontSize: 14, fontWeight: '500' },
  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 12, paddingHorizontal: 4,
  },
  errorText: { color: '#E53935', fontSize: 13 },
  enginesCard: {
    backgroundColor: '#fff', borderRadius: 18,
    padding: 18, borderWidth: 1.5, borderColor: '#E8E8E8',
    gap: 12,
  },
  enginesTitle: { fontSize: 13, fontWeight: '700', color: '#111' },
  enginesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  engineChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F5F5', borderRadius: 50,
    paddingVertical: 7, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  engineLabel: { fontSize: 12, color: '#555', fontWeight: '500' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#F5F5F5', paddingHorizontal: 20,
    paddingTop: 12, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: '#E8E8E8',
  },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#111', borderRadius: 50, paddingVertical: 17,
  },
  scanBtnDisabled: { backgroundColor: '#CBCBCB' },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scanBtnTextDisabled: { color: 'rgba(255,255,255,0.5)' },
  scanningContainer: { alignItems: 'center', paddingVertical: 6 },
  analyzingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#222', borderRadius: 50,
    paddingVertical: 14, paddingHorizontal: 28,
  },
  analyzingPillText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});