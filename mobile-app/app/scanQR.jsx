import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Animated, Easing
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useScan } from '../context/ScanContext';
import { analyzeUrl } from '../services/scanApi.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotifications';
import BlocklistModal from '../components/BlocklistModal';

const OCR_MAX_WIDTH = 1500;

export default function ScanQRScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useAuth();
  const { setScanResult } = useScan();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef(null);

  const [detectedUrl, setDetectedUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');
  const scanAnim = useRef(new Animated.Value(0.2)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const { notificationsEnabled, sendScanCompleteNotification } = useNotifications();
  const isFocused = useRef(true);
  const [showBlocklistModal, setShowBlocklistModal] = useState(false);
  const pendingUrl = useRef(null);

    useFocusEffect(
    useCallback(() => {
        isFocused.current = true;
        setDetectedUrl(null);
        setScanning(false);
        setCapturing(false);
        setError('');
        scanAnim.setValue(0.2);
        return () => { isFocused.current = false; };
    }, [])
    );

    const startLoadingBar = () => {
    scanAnim.setValue(0.2);
    Animated.loop(
        Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0.2, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
    ).start();
    };

    const stopLoadingBar = () => {
    scanAnim.stopAnimation();
    scanAnim.setValue(0.2);
    };

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    setError('');
    setDetectedUrl(null);

    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      const fileUri = `file://${photo.path}`;

      const manipulated = await ImageManipulator.ImageManipulator
        .manipulate(fileUri)
        .resize({ width: OCR_MAX_WIDTH })
        .renderAsync();

      const result = await manipulated.saveAsync({
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const barcodes = await BarcodeScanning.scan(result.uri);

      if (!barcodes || barcodes.length === 0) {
        setError('No QR code detected. Try again.');
        return;
      }

      const qrValue = barcodes[0].value;
      if (!qrValue) {
        setError('QR code found but could not read its content.');
        return;
      }

      setDetectedUrl(qrValue);
    } catch (err) {
      setError('Failed to capture: ' + err.message);
    } finally {
      setCapturing(false);
    }
  };

  const handleScan = async () => {
    if (!detectedUrl || scanning) return;
    setError('');
    await runScan(detectedUrl);
  };

  const runScan = async (url, skipBlocklist = false) => {
    setScanning(true);
    startLoadingBar();
    try {
      const result = await analyzeUrl(url, token, 'cameraQr', skipBlocklist);
      setScanResult(result);
      if (result.blocklist && !skipBlocklist) {
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
      stopLoadingBar();
    }
  };

  const handleReset = () => {
    setDetectedUrl(null);
    setError('');
  };

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="qr-code-scanner" size={48} color="rgba(255,255,255,0.3)" />
        <Text style={styles.permissionText}>Camera permission is required.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <BlocklistModal
        visible={showBlocklistModal}
        onExit={() => { setShowBlocklistModal(false); setDetectedUrl(null); }}
        onContinue={() => { setShowBlocklistModal(false); runScan(pendingUrl.current, true); }}
      />
      {/* Camera */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Scan QR</Text>
        <View style={{ width: 28 }} />
      </View>

      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!detectedUrl}
        photo
      />

      {/* QR frame overlay */}
      {!detectedUrl && (
        <View style={styles.overlayFrame}>
          <View style={styles.qrFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.overlayHint}>Align QR code within the frame</Text>
        </View>
      )}

      {/* Detected URL card */}
      {detectedUrl && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <MaterialIcons name="qr-code" size={20} color="#4AFF91" />
              <Text style={styles.resultCardTitle}>QR Code Detected</Text>
            </View>
            <Text style={styles.resultLabel}>URL FOUND IN QR CODE</Text>
            <Text style={styles.resultUrl} numberOfLines={3}>{detectedUrl}</Text>
          </View>
        </View>
      )}

      {/* Loading bar */}
    {scanning && (
    <View style={styles.loadingBarTrack}>
        <Animated.View style={[styles.loadingBarFill, { opacity: scanAnim }]} />
    </View>
    )}

      {/* Error */}
      {error ? (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={16} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Bottom controls */}
      <View style={[styles.bottomBar, {paddingBottom: insets.bottom + 15}]}>
        {!detectedUrl ? (
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={handleCapture}
            disabled={capturing}
            activeOpacity={0.8}
          >
            {capturing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <MaterialIcons name="qr-code-scanner" size={28} color="#000" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.retakeBtn} onPress={handleReset} activeOpacity={0.8}>
              <MaterialIcons name="replay" size={20} color="#fff" />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={handleScan}
              disabled={scanning}
              activeOpacity={0.8}
            >
              {scanning ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <MaterialIcons name="security" size={20} color="#000" />
                  <Text style={styles.scanBtnText}>Scan this QR</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1, backgroundColor: '#0a0a0a',
    justifyContent: 'center', alignItems: 'center', gap: 16, padding: 32,
  },
  permissionText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, textAlign: 'center' },
  permissionBtn: {
    backgroundColor: '#fff', borderRadius: 50,
    paddingVertical: 12, paddingHorizontal: 28,
  },
  permissionBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },

  topNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 12,
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
  },
  navTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  overlayFrame: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  qrFrame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: '#fff',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  overlayHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
  },

    resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    paddingBottom: 120, // clears the bottom bar
    },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74,255,145,0.3)',
    padding: 20,
    width: '100%',
    gap: 10,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultCardTitle: {
    color: '#4AFF91',
    fontWeight: '700',
    fontSize: 14,
  },
  resultLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  resultUrl: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },

    loadingBarTrack: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    },
    loadingBarFill: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#4AFF91',
    },

  errorBanner: {
    position: 'absolute',
    top: 150,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    padding: 12,
  },
  errorText: { color: '#FF6B6B', fontSize: 13, flex: 1 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  retakeBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  scanBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  scanBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});