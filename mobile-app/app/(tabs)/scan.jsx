import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const PREMIUM_PROFILE_ID = 3;

const scanOptions = [
  {
    icon: 'crop-free',
    title: 'Scan URL',
    description: 'Use your camera to scan and detect website links for security threats.',
    route: '/scanURL',
    premiumOnly: false,
  },
  {
    icon: 'content-paste',
    title: 'Paste URL',
    description: 'Manually enter or paste a weblink.',
    route: '/pasteURL',
    premiumOnly: false,
  },
  {
    icon: 'qr-code-scanner',
    title: 'Scan QR Code',
    description: 'Scan QR codes instantly using your camera and analyze malicious hidden links.',
    route: '/scanQR',
    premiumOnly: false,
  },
  {
    icon: 'photo-library',
    title: 'Upload QR Code',
    description: 'Manually select a QR code from your gallery.',
    route: '/uploadQR',
    premiumOnly: false,
  },
  {
    icon: 'public',
    title: 'Public Scans',
    description: 'View scans shared by others.',
    route: '/publicScans',
    premiumOnly: true,
  },
];

export default function ScanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { account } = useAuth();
  const isPremium = account?.uaUserProfileId === PREMIUM_PROFILE_ID;
  

  const handleOptionPress = (option) => {
    if (option.premiumOnly && !isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    if (option.route) router.push(option.route);
  };

  const handleUpgradeRedirect = () => {
    setShowUpgradeModal(false);
    Linking.openURL('https://yourwebsite.com/upgrade'); // replace with your actual URL
  };

  return (
    <View style={styles.wrapper}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <View />
        <TouchableOpacity onPress={() => {}}>
          <MaterialIcons name="account-circle" size={32} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo Area */}
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>Scure</Text>
          <Text style={styles.logoSub}>Scan Your Link Securely</Text>
        </View>

        {/* Scan Buttons */}
        {scanOptions.map((option, index) => {
          const isLocked = option.premiumOnly && !isPremium;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.button, isLocked && styles.buttonLocked]}
              onPress={() => handleOptionPress(option)}
            >
              <MaterialIcons
                name={option.icon}
                size={28}
                color={isLocked ? '#bbb' : '#000'}
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, isLocked && styles.textLocked]}>{option.title}</Text>
                  {isLocked && (
                    <View style={styles.premiumBadge}>
                      <MaterialIcons name="lock" size={11} color="#fff" />
                      <Text style={styles.premiumBadgeText}>Premium</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.description, isLocked && styles.textLocked]}>
                  {option.description}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isLocked ? '#ddd' : '#ccc'} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Upgrade Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showUpgradeModal}
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={[styles.modalOverlay, { zIndex: 999 }]}>
          <View style={styles.modalBox}>
            <MaterialIcons name="workspace-premium" size={36} color="#f0a500" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Upgrade to Premium?</Text>
            <Text style={styles.modalMessage}>
              You will be redirected to our website.
            </Text>
            <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleUpgradeRedirect}>
              <Text style={styles.modalButtonPrimaryText}>Yes, redirect me.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowUpgradeModal(false)}>
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },
  container: {
    padding: 24,
    paddingTop: 0,
  },
  logoArea: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  buttonLocked: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ececec',
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  textLocked: {
    color: '#bbb',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0a500',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 3,
  },
  premiumBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '80%',
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonPrimary: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonSecondary: {
    paddingVertical: 10,
  },
  modalButtonSecondaryText: {
    color: '#888',
    fontSize: 14,
  },
});