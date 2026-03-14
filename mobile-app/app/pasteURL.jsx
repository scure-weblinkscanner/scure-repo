import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Clipboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { analyzeUrl } from '../services/scanApi.service';
import { useScan } from '../context/ScanContext';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const scanAnim = useRef(new Animated.Value(0.2)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0.2, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0.2);
    }
  }, [scanning]);

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
      const result = await analyzeUrl(normalized, token, 'pasteUrl');
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
      <SafeAreaView style={{ flex: 1}} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ImageBackground
              source={require('../assets/background.png')}
              style={styles.wrapper}
              resizeMode="cover"
        >
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
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
                <MaterialIcons name="content-paste" size={28} color="#fff" />
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
                  placeholderTextColor="#555"
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
                    <MaterialIcons name="close" size={18} color="#666" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.pasteRow} onPress={handlePaste} disabled={scanning}>
                <MaterialIcons name="content-paste" size={18} color="#ffffff" />
                <Text style={styles.pasteText}>Paste from clipboard</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <MaterialIcons name="error-outline" size={15} color="#ff6b6b" />
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
                    <MaterialIcons name={icon} size={14} color="#888" />
                    <Text style={styles.engineLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.bottomBar}>
          {scanning ? (
            <View style={styles.loadingBarContainer}>
              <Text style={styles.loadingBarLabel}>Analyzing…</Text>
              <View style={styles.loadingBarTrack}>
                <Animated.View style={[styles.loadingBarFill, { opacity: scanAnim }]} />
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
                color={canScan ? '#ffffff' : 'rgba(255,255,255,0.2)'}
              />
              <Text style={[styles.scanBtnText, !canScan && styles.scanBtnTextDisabled]}>
                {url.trim() ? 'Scan this URL' : 'Enter a URL above'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        </ImageBackground>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0A0A0A' },
  topNav: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 16,
    backgroundColor: '#0E0E95',
  },
  backBtn: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: '#0E0E95', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  navTitle: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#fff' 
  },
  content: { 
    paddingHorizontal: 20, 
    paddingBottom: 120 
  },
  heroRow: { 
    alignItems: 'center', 
    paddingVertical: 28, 
    gap: 8 
  },
  iconCircle: {
    width: 64, 
    height: 64, 
    borderRadius: 32,
    backgroundColor: '#1E1E1E',
    borderWidth: 1, 
    borderColor: '#fff',
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 4,
  },
  headline: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#fff', 
    letterSpacing: -0.5 
  },
  subheadline: { 
    fontSize: 14, 
    color: '#fff', 
    textAlign: 'center', 
    lineHeight: 20, 
    paddingHorizontal: 16 
  },
  inputCard: {
    backgroundColor: '#141414', 
    borderRadius: 18,
    paddingHorizontal: 18, 
    paddingTop: 16, 
    paddingBottom: 4,
    borderWidth: 1.5, 
    borderColor: '#222',
    marginBottom: 10,
  },
  inputCardError: { 
    borderColor: '#ff6b6b' 
  },
  inputLabel: { 
    fontSize: 10, 
    color: '#555', 
    fontWeight: '700', 
    letterSpacing: 1.5,
    marginBottom: 8 
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center' ,
    borderColor: '#fff',
    borderWidth: 0.1,
    borderRadius: 8,
    paddingLeft: 5
  },
  input: {
    flex: 1, 
    fontSize: 15, 
    color: '#fff',
    paddingVertical: 4, 
    paddingRight: 8,
    minHeight: 40,
  },
  clearBtn: {
    padding: 4, 
    backgroundColor: '#2A2A2A',
    borderRadius: 50, 
    marginRight: 10,
  },
  divider: { height: 1, 
    backgroundColor: '#222', 
    marginVertical: 12 },
  pasteRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    paddingVertical: 10,
  },
  pasteText: { 
    color: '#888', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  errorRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    marginBottom: 12, 
    paddingHorizontal: 4,
  },
  errorText: { 
    color: '#ff6b6b', 
    fontSize: 13 
  },
  enginesCard: {
    backgroundColor: '#141414', 
    borderRadius: 18,
    padding: 18, 
    borderWidth: 1.5, 
    borderColor: '#222',
    gap: 12,
    marginTop: 10
  },
  enginesTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#fff' 
  },
  enginesList: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  engineChip: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    backgroundColor: '#1E1E1E', 
    borderRadius: 50,
    paddingVertical: 7, 
    paddingHorizontal: 12,
    borderWidth: 1, 
    borderColor: '#2A2A2A',
  },
  engineLabel: { 
    fontSize: 12, 
    color: '#888', 
    fontWeight: '500' 
  },
  bottomBar: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    backgroundColor: '#0E0E95', 
    paddingHorizontal: 20,
    paddingTop: 12, 
    paddingBottom: 36,
    borderTopWidth: 1, 
    borderTopColor: '#1E1E1E',
  },
  scanBtn: {
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#222',
    justifyContent: 'center', 
    gap: 8,
    backgroundColor: '#141414', 
    borderRadius: 50, 
    paddingVertical: 17,
  },
  scanBtnDisabled: { 
    backgroundColor: '#1E1E1E' 
  },
  scanBtnText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  scanBtnTextDisabled: { 
    color: 'rgba(255,255,255,0.2)' 
  },
  loadingBarContainer: {
    width: '100%', 
    alignItems: 'center', 
    gap: 10, 
    paddingVertical: 15,
  },
  loadingBarLabel: { 
    color: 'rgba(255,255,255,0.6)', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  loadingBarTrack: {
    width: '100%', 
    height: 4, 
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', 
    overflow: 'hidden',
  },
  loadingBarFill: {
    width: '100%', 
    height: '100%', 
    borderRadius: 50, 
    backgroundColor: '#ffffff',
  },
});