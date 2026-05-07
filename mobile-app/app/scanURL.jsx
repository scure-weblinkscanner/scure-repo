import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../context/AuthContext';
import { analyzeUrl } from '../services/scanApi.service';
import { useScan } from '../context/ScanContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAdDetection } from '../hooks/useAdDetection';
import { useElapsedTime } from '../hooks/useElapsedTime';
import BlocklistModal from '../components/BlocklistModal';

const { height: screenHeight } = Dimensions.get('window');

const OCR_MAX_WIDTH = 1500;

// common url patterns to be found in any image
const urlPatterns = [
  /https?:\/\/[^\s]+/gi,
  /www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi,
  /\b[a-zA-Z0-9-]+\.(com|org|net|io|co|gov|edu|uk|my|sg|app|dev)[^\s]*/gi,
];

const fixOcrArtifacts = (text) =>
  text
    .replace(/https?\s*:\s*\/\s*\/\s*/gi, 'https://')
    .replace(/ht+p/gi, 'http')
    .replace(/5(?=[a-zA-Z])/g, 's')
    .replace(/0(?=[a-zA-Z])/g, 'o');

const isUrlText = (text) => {
  const fixed = fixOcrArtifacts(text);
  return urlPatterns.some((p) => { p.lastIndex = 0; return p.test(fixed); });
};

const extractFirstUrl = (text) => {
  const fixed = fixOcrArtifacts(text);
  for (const pattern of urlPatterns) {
    pattern.lastIndex = 0;
    const match = fixed.match(pattern);
    if (match) return match[0];
  }
  return text.trim();
};

const normalizeUrl = (url) => {
  const u = url.trim().toLowerCase();
  if (u.startsWith('http://') || u.startsWith('https://')) return url.trim();
  return 'https://' + url.trim();
};

const preprocessForOcr = async (filePath) => {
  const processed = await ImageManipulator.manipulateAsync(
    filePath,
    [{ resize: { width: OCR_MAX_WIDTH } }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: false }
  );
  return processed.uri;
};

export default function ScanURLScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef(null);
  const scanAnim = useRef(new Animated.Value(0.2)).current;

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [detectedUrls, setDetectedUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [showBlocklistModal, setShowBlocklistModal] = useState(false);
  const [isBannedBlocklist, setIsBannedBlocklist] = useState(false);
  const pendingUrl = useRef(null);
  const { setScanResult, setScanDuration } = useScan();
  const { notificationsEnabled, sendScanCompleteNotification } = useNotifications();
  const { adDetectionEnabled } = useAdDetection();
  const elapsedTime = useElapsedTime(scanning);
  const isFocused = useRef(true);

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(-1);
    }
  }, [scanning]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      setCapturedImageUri(null);
      setDetectedUrls([]);
      setSelectedUrl(null);
      setError('');
      setScanning(false);
      return () => { isFocused.current = false; };
    }, [])
  );

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="camera-alt" size={48} color="#fff" style={{ marginBottom: 16 }} />
        <Text style={styles.permissionText}>Camera access is required to scan URLs.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No camera device found.</Text>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || loading) return;
    setLoading(true);
    setError('');
    setDetectedUrls([]);
    setSelectedUrl(null);

    try {
      setLoadingStep('Capturing…');
      const photo = await cameraRef.current.takePhoto({ qualityPrioritization: 'quality' });
      const rawFilePath = `file://${photo.path}`;
      setCapturedImageUri(rawFilePath);

      setLoadingStep('Enhancing image…');
      const processedUri = await preprocessForOcr(rawFilePath);

      setLoadingStep('Scanning for URLs…');
      const result = await TextRecognition.recognize(processedUri);

      const found = [];
      for (const block of result.blocks) {
        for (const line of block.lines) {
          if (isUrlText(line.text)) {
            found.push(extractFirstUrl(line.text));
          }
        }
      }

      const deduped = [...new Set(found)];
      setDetectedUrls(deduped);
      if (deduped.length === 0) setError('No URLs detected.');
    } catch (err) {
      setError('Failed to capture: ' + err.message);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const retake = () => {
    setCapturedImageUri(null);
    setDetectedUrls([]);
    setSelectedUrl(null);
    setError('');
  };

  const runScan = async (url, skipBlocklist = false) => {
    setScanning(true);
    const _start = Date.now();
    try {
      const result = await analyzeUrl(url, token, 'cameraUrl', skipBlocklist, adDetectionEnabled);
      setScanDuration(Math.floor((Date.now() - _start) / 1000));
      setScanResult(result);
      if (result.blocklist?.threatType === 'banned') {
        setIsBannedBlocklist(true);
        setShowBlocklistModal(true);
      } else if (result.blocklist && !skipBlocklist) {
        setIsBannedBlocklist(false);
        pendingUrl.current = url;
        setShowBlocklistModal(true);
      } else if (isFocused.current) {
        router.push({ pathname: '/scanURLResult' });
      } else if (notificationsEnabled) {
        sendScanCompleteNotification(result);
      } else {
        router.push({ pathname: '/scanURLResult' });
      }
    } catch (err) {
      if (isFocused.current) {
        setError('Scan failed: ' + err.message);
      }
    } finally {
      setScanning(false);
    }
  };

  const confirmScan = async () => {
    if (!selectedUrl || scanning) return;
    await runScan(normalizeUrl(selectedUrl));
  };

  // ── CAMERA VIEW ──
  if (!capturedImageUri) {
    return (
      <View style={styles.wrapper}>
        <BlocklistModal
          visible={showBlocklistModal}
          banned={isBannedBlocklist}
          onExit={() => { setShowBlocklistModal(false); setIsBannedBlocklist(false); retake(); }}
          onContinue={() => { setShowBlocklistModal(false); setIsBannedBlocklist(false); runScan(pendingUrl.current, true); }}
        />
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Scan URL</Text>
          <View style={{ width: 28 }} />
        </View>

        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />

        <View style={styles.captureRow}>
          {loading ? (
            <View style={styles.loadingPill}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.loadingPillText}>{loadingStep}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto} activeOpacity={0.8}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.hint}>Point camera at any URL and capture</Text>
      </View>
    );
  }

  // ── RESULT VIEW ──
  return (
    <View style={styles.wrapper}>
      <BlocklistModal
        visible={showBlocklistModal}
        banned={isBannedBlocklist}
        onExit={() => { setShowBlocklistModal(false); setIsBannedBlocklist(false); retake(); }}
        onContinue={() => { setShowBlocklistModal(false); setIsBannedBlocklist(false); runScan(pendingUrl.current, true); }}
      />
      <Image
        source={{ uri: capturedImageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.scrim} />

      <View style={styles.topNav}>
        <TouchableOpacity onPress={retake} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Scan URL</Text>
        <TouchableOpacity onPress={retake} hitSlop={12}>
          <MaterialIcons name="replay" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        {loading ? (
          <View style={styles.sheetCenter}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.sheetTitle}>{loadingStep}</Text>
            <Text style={styles.sheetSubtitle}>This only takes a moment</Text>
          </View>
        ) : error && detectedUrls.length === 0 ? (
          <View style={styles.sheetCenter}>
            <MaterialIcons name="search-off" size={36} color="rgba(255,255,255,0.5)" />
            <Text style={styles.sheetTitle}>No URLs found</Text>
            <Text style={styles.sheetSubtitle}>Try again with the URL clearly visible</Text>
            <TouchableOpacity style={styles.retakeButton} onPress={retake}>
              <MaterialIcons name="replay" size={20} color="#fff" />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sheetTitle}>
              {detectedUrls.length === 1 ? 'Found 1 URL' : `Found ${detectedUrls.length} URLs`}
            </Text>
            <Text style={styles.sheetSubtitle}>Tap the one you want to scan</Text>

            <ScrollView
              style={styles.urlList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {detectedUrls.map((url, index) => {
                const isSelected = selectedUrl === url;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.urlChip, isSelected && styles.urlChipSelected]}
                    onPress={() => setSelectedUrl(isSelected ? null : url)}
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name={isSelected ? 'check-circle' : 'link'}
                      size={18}
                      color={isSelected ? '#000' : 'rgba(255,255,255,0.6)'}
                      style={{ marginRight: 10, flexShrink: 0 }}
                    />
                    <Text
                      style={[styles.urlChipText, isSelected && styles.urlChipTextSelected]}
                      numberOfLines={1}
                    >
                      {url}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {scanning ? (
              <View style={styles.loadingBarContainer}>
                <Text style={styles.loadingBarLabel}>Analyzing · {elapsedTime}</Text>
                <View style={styles.loadingBarTrack}>
                  <Animated.View style={[styles.loadingBarFill, { opacity: scanAnim }]} />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.confirmButton, !selectedUrl && styles.confirmButtonDisabled]}
                onPress={confirmScan}
                activeOpacity={selectedUrl ? 0.85 : 1}
              >
                <Text style={[styles.confirmButtonText, !selectedUrl && styles.confirmButtonTextDisabled]}>
                  {selectedUrl ? 'Scan this URL' : 'Select a URL above'}
                </Text>
                {selectedUrl && (
                  <MaterialIcons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },

  topNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 12,
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
  },
  navTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },

  permissionContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#111', padding: 32,
  },
  permissionText: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  permissionButton: { backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 50 },
  permissionButtonText: { color: '#000', fontWeight: '700', fontSize: 15 },

  captureRow: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
  captureButton: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  loadingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  loadingPillText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  hint: {
    position: 'absolute', bottom: 148, left: 0, right: 0,
    textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13,
  },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(18,18,18,0.96)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 20, paddingHorizontal: 20, paddingBottom: 40,
    maxHeight: screenHeight * 0.55,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  sheetCenter: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sheetSubtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 16 },

  urlList: { marginBottom: 16 },
  urlChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  urlChipSelected: { backgroundColor: '#FFD60A', borderColor: '#FFD60A' },
  urlChipText: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 },
  urlChipTextSelected: { color: '#000', fontWeight: '700' },

  errorText: { color: '#ff6b6b', fontSize: 13, textAlign: 'center', marginBottom: 12 },

  confirmButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 50, paddingVertical: 15, paddingHorizontal: 28,
  },
  confirmButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  confirmButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  confirmButtonTextDisabled: { color: 'rgba(255,255,255,0.3)' },

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

  retakeButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', marginTop: 8,
  },
  retakeButtonText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});