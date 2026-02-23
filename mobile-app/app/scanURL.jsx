import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIEWFINDER_WIDTH = SCREEN_WIDTH * 0.85;
const VIEWFINDER_HEIGHT = 140;
const VIEWFINDER_TOP = SCREEN_HEIGHT * 0.4;
const VIEWFINDER_LEFT = (SCREEN_WIDTH - VIEWFINDER_WIDTH) / 2;

const extractURLsFromText = (text) => {
  let fixed = text
    .replace(/https?\s*:\s*\/\s*\/\s*/gi, 'https://')
    .replace(/ht+p/gi, 'http')
    .replace(/5(?=[a-zA-Z])/g, 's')
    .replace(/0(?=[a-zA-Z])/g, 'o');

  const patterns = [
    /https?:\/\/[^\s]+/gi,
    /www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi,
    /\b[a-zA-Z0-9-]+\.(com|org|net|io|co|gov|edu|uk|my|sg|app|dev)[^\s]*/gi,
  ];

  const found = new Set();
  for (const pattern of patterns) {
    const matches = fixed.match(pattern);
    if (matches) matches.forEach(url => found.add(url));
  }
  return [...found];
};

export default function ScanURLScreen() {
  const router = useRouter();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [detectedText, setDetectedText] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [error, setError] = useState('');

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No camera device found.</Text>
      </View>
    );
  }

  const captureAndScan = async () => {
    if (!camera.current || loading) return;
    setLoading(true);
    setError('');
    setUrls([]);

    try {
      const photo = await camera.current.takePhoto({ qualityPrioritization: 'quality' });
      const filePath = `file://${photo.path}`;

      const result = await TextRecognition.recognize(filePath);
      const text = result.text;
      setDetectedText(text);

      const foundURLs = extractURLsFromText(text);
      setUrls(foundURLs);
      setPhotoTaken(true);

      if (foundURLs.length === 0) {
        setError('No URLs found. Try again with the URL clearly inside the box.');
      }
    } catch (err) {
      setError('Failed to scan: ' + err.message);
      setPhotoTaken(true);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setUrls([]);
    setError('');
    setDetectedText('');
    setPhotoTaken(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Scan URL</Text>
        <View style={{ width: 28 }} />
      </View>

      {!photoTaken ? (
        <View style={{ flex: 1 }}>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
          />

          {/* Overlays */}
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.hint}>Align the URL within the box</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 24 }} />
            ) : (
              <TouchableOpacity style={styles.captureButton} onPress={captureAndScan}>
                <MaterialIcons name="camera" size={32} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : error && urls.length === 0 ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <>
              <Text style={styles.resultsTitle}>URLs Found:</Text>
              {urls.map((url, index) => (
                <View key={index} style={styles.urlCard}>
                  <Text style={styles.urlText}>{url}</Text>
                </View>
              ))}
            </>
          )}
          <TouchableOpacity style={styles.button} onPress={reset}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  navTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  overlayTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: VIEWFINDER_TOP,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    position: 'absolute',
    top: VIEWFINDER_TOP,
    left: 0, right: 0,
    height: VIEWFINDER_HEIGHT,
    flexDirection: 'row',
  },
  overlaySide: {
    width: VIEWFINDER_LEFT,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  viewfinder: {
    width: VIEWFINDER_WIDTH,
    height: VIEWFINDER_HEIGHT,
    borderRadius: 4,
  },
  overlayBottom: {
    position: 'absolute',
    top: VIEWFINDER_TOP + VIEWFINDER_HEIGHT,
    left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 24,
  },
  hint: { color: '#fff', fontSize: 14, opacity: 0.8 },
  corner: {
    position: 'absolute',
    width: 20, height: 20,
    borderColor: '#fff',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  captureButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 50,
    marginTop: 32,
  },
  resultsContainer: { padding: 24, paddingTop: 80, backgroundColor: '#fff', flexGrow: 1 },
  resultsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  urlCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 12 },
  urlText: { fontSize: 14, color: '#333' },
  message: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 24 },
  error: { color: 'red', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: '#fff' },
});