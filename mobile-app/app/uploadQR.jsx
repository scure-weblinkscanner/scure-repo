import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { useAuth } from '../context/AuthContext';
import { analyzeUrl } from '../services/scanApi.service';
import { useScan } from '../context/ScanContext';

const normalizeUrl = (url) => {
  const u = url.trim().toLowerCase();
  if (u.startsWith('http://') || u.startsWith('https://')) return url.trim();
  return 'https://' + url.trim();
};

export default function UploadQRScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { setScanResult } = useScan();

  const [selectedImage, setSelectedImage] = useState(null);
  const [detectedUrl, setDetectedUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
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

  const handlePickImage = async () => {
    setError('');
    setDetectedUrl('');
    setSelectedImage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Gallery permission is required to upload a QR code.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    setSelectedImage(imageUri);
    setProcessing(true);

    try {
      const barcodes = await BarcodeScanning.scan(imageUri);
      if (!barcodes || barcodes.length === 0) {
        setError('No QR code detected in this image. Try a clearer photo.');
        setProcessing(false);
        return;
      }

      const qrValue = barcodes[0].value;
      if (!qrValue) {
        setError('QR code found but could not read its content.');
        setProcessing(false);
        return;
      }

      setDetectedUrl(qrValue);
    } catch (err) {
      setError('Failed to read QR code: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleScan = async () => {
    if (!detectedUrl || scanning) return;
    setError('');
    setScanning(true);
    try {
      const normalized = normalizeUrl(detectedUrl);
      const result = await analyzeUrl(normalized, token);
      setScanResult(result);
      router.push({ pathname: '/scanURLResult' });
    } catch (err) {
      setError('Scan failed: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setDetectedUrl('');
    setError('');
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
          <Text style={styles.navTitle}>Upload QR Code</Text>
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
                <MaterialIcons name="qr-code" size={28} color="#fff" />
              </View>
              <Text style={styles.headline}>Upload a QR Code</Text>
              <Text style={styles.subheadline}>
                Select a QR code image from your gallery to extract and scan the URL inside.
              </Text>
            </View>

            {!selectedImage ? (
              <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage} activeOpacity={0.75}>
                <MaterialIcons name="photo-library" size={40} color="#FFD60A" />
                <Text style={styles.uploadTitle}>Choose from Gallery</Text>
                <Text style={styles.uploadSub}>Supports JPG, PNG</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imageCard}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
                <TouchableOpacity style={styles.changeBtn} onPress={handlePickImage}>
                  <MaterialIcons name="photo-library" size={16} color="#FFD60A" />
                  <Text style={styles.changeBtnText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            )}

            {processing && (
              <View style={styles.processingRow}>
                <MaterialIcons name="qr-code-scanner" size={18} color="#FFD60A" />
                <Text style={styles.processingText}>Reading QR code…</Text>
              </View>
            )}

            {detectedUrl ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>URL FOUND IN QR CODE</Text>
                <View style={styles.resultRow}>
                  <MaterialIcons name="link" size={18} color="#FFD60A" style={{ flexShrink: 0 }} />
                  <Text style={styles.resultUrl} numberOfLines={3}>{detectedUrl}</Text>
                  <TouchableOpacity onPress={handleReset} hitSlop={8}>
                    <MaterialIcons name="close" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

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
              style={[styles.scanBtn, !detectedUrl && styles.scanBtnDisabled]}
              onPress={handleScan}
              disabled={!detectedUrl}
              activeOpacity={detectedUrl ? 0.85 : 1}
            >
              <MaterialIcons
                name="shield"
                size={20}
                color={detectedUrl ? '#000' : 'rgba(255,255,255,0.2)'}
              />
              <Text style={[styles.scanBtnText, !detectedUrl && styles.scanBtnTextDisabled]}>
                {detectedUrl ? 'Scan this URL' : 'Upload a QR code above'}
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
  heroRow: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  headline: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subheadline: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },

  uploadArea: {
    backgroundColor: '#141414', borderRadius: 18,
    borderWidth: 1.5, borderColor: '#2A2A2A', borderStyle: 'dashed',
    paddingVertical: 48, alignItems: 'center', gap: 10, marginBottom: 16,
  },
  uploadTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  uploadSub: { color: '#555', fontSize: 13 },

  imageCard: {
    backgroundColor: '#141414', borderRadius: 18,
    borderWidth: 1.5, borderColor: '#222',
    overflow: 'hidden', marginBottom: 16,
  },
  previewImage: { width: '100%', height: 220 },
  changeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#222',
  },
  changeBtnText: { color: '#FFD60A', fontSize: 14, fontWeight: '600' },

  processingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 16,
  },
  processingText: { color: '#888', fontSize: 14 },

  resultCard: {
    backgroundColor: '#141414', borderRadius: 18,
    padding: 16, borderWidth: 1.5, borderColor: '#FFD60A33',
    marginBottom: 10, gap: 10,
  },
  resultLabel: { fontSize: 10, color: '#FFD60A', fontWeight: '700', letterSpacing: 1.5 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultUrl: { flex: 1, color: '#fff', fontSize: 14, lineHeight: 20 },

  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 12, paddingHorizontal: 4,
  },
  errorText: { color: '#ff6b6b', fontSize: 13, flex: 1 },

  enginesCard: {
    backgroundColor: '#141414', borderRadius: 18,
    padding: 18, borderWidth: 1.5, borderColor: '#222', gap: 12,
  },
  enginesTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  enginesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  engineChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1E1E1E', borderRadius: 50,
    paddingVertical: 7, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  engineLabel: { fontSize: 12, color: '#888', fontWeight: '500' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0A0A0A', paddingHorizontal: 20,
    paddingTop: 12, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: '#1E1E1E',
  },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFD60A', borderRadius: 50, paddingVertical: 17,
  },
  scanBtnDisabled: { backgroundColor: '#1E1E1E' },
  scanBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  scanBtnTextDisabled: { color: 'rgba(255,255,255,0.2)' },
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