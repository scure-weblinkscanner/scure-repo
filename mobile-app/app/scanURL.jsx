import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VIEWFINDER_WIDTH = SCREEN_WIDTH * 0.85;
const VIEWFINDER_HEIGHT = 100;
const VIEWFINDER_TOP = SCREEN_HEIGHT * 0.4;
const VIEWFINDER_LEFT = (SCREEN_WIDTH - VIEWFINDER_WIDTH) / 2;

const extractURLsFromText = (text) => {
  // fix OCR spacing in https://
  const cleaned = text.replace(/https?\s*:\s*\/\s*\/\s*/gi, 'https://');

  const patterns = [
    // full URLs with protocol
    /https?:\/\/[^\s]+/gi,
    // URLs starting with www.
    /www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi,
    // bare domains like youtube.com, github.io, google.co.uk
    /\b[a-zA-Z0-9-]+\.(com|org|net|io|co|gov|edu|uk|my|sg|app|dev)[^\s]*/gi,
  ];

  const found = new Set();
  for (const pattern of patterns) {
    const matches = cleaned.match(pattern);
    if (matches) matches.forEach(url => found.add(url));
  }

  return [...found];
};

export default function ScanURLScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);

  if (!permission) return <View style={styles.wrapper} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required to scan URLs.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    setError('');
    setUrls([]);

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });

      // crop to viewfinder area
      const cropOriginX = (VIEWFINDER_LEFT / SCREEN_WIDTH) * photo.width;
      const cropOriginY = (VIEWFINDER_TOP / SCREEN_HEIGHT) * photo.height;
      const cropWidth = (VIEWFINDER_WIDTH / SCREEN_WIDTH) * photo.width;
      const cropHeight = (VIEWFINDER_HEIGHT / SCREEN_HEIGHT) * photo.height;

      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: { originX: cropOriginX, originY: cropOriginY, width: cropWidth, height: cropHeight } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      // run ML Kit on cropped image
      const result = await TextRecognition.recognize(cropped.uri);
      const extractedText = result.text;
      const foundURLs = extractURLsFromText(extractedText);

      setPhotoTaken(true);
      setUrls(foundURLs);

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
          <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" />

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
              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <MaterialIcons name="camera" size={32} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : error ? (
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: VIEWFINDER_TOP,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    position: 'absolute',
    top: VIEWFINDER_TOP,
    left: 0,
    right: 0,
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
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 24,
  },
  hint: { color: '#fff', fontSize: 14, opacity: 0.8 },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
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
  resultsContainer: { padding: 24, paddingTop: 370, backgroundColor: '#fff', flexGrow: 1 },
  resultsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  urlCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 12 },
  urlText: { fontSize: 14, color: '#333' },
  message: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 24 },
  error: { color: 'red', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: '#fff' },
});