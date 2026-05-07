import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image, Modal, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useFonts, BodoniModa_400Regular } from '@expo-google-fonts/bodoni-moda';
import { ABeeZee_400Regular } from '@expo-google-fonts/abeezee';

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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { account } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [fontsLoaded] = useFonts({ BodoniModa_400Regular, ABeeZee_400Regular });

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
    Linking.openURL('https://scure.up.railway.app/upgrade');
  };

  if (!fontsLoaded) return <View style={styles.wrapper} />;

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={{ backgroundColor: '#0E0E95' }} edges={['top']}>
        <View style={styles.topNav}>
          <Image source={require('../../assets/logo.png')} style={{ width: 50, height: 50, marginLeft: -10 }} />
          <Text style={styles.topNavText}>Scure</Text>
        </View>
      </SafeAreaView>

      <ImageBackground
        source={require('../../assets/background.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={[styles.container, {paddingBottom: insets.bottom + 60}]}
          style={{ backgroundColor: 'transparent' }}
        >
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
                activeOpacity={isLocked ? 0.5 : 0.75}
              >
                <View style={[styles.iconWrapper, isLocked && styles.iconWrapperLocked]}>
                  <MaterialIcons
                    name={option.icon}
                    size={24}
                    color={isLocked ? 'rgba(255,255,255,0.35)' : '#fff'}
                  />
                </View>
                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, isLocked && styles.titleLocked]}>
                      {option.title}
                    </Text>
                    {isLocked && (
                      <View style={styles.premiumBadge}>
                        <MaterialIcons name="lock" size={11} color="#fff" />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.description, isLocked && styles.descriptionLocked]}>
                    {option.description}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={isLocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)'}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ImageBackground>

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
    backgroundColor: '#0E0E95',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#0E0E95',
    height: 70,
  },
  topNavText: {
    color: '#fff',
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 30,
    marginRight: -10,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 0,
  },
  logoArea: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  logoText: {
    fontSize: 42,
    fontFamily: 'BodoniModa_400Regular',
    letterSpacing: 2,
    color: '#fff',
  },
  logoSub: {
    fontSize: 24,
    fontFamily: 'ABeeZee_400Regular',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },

  // Translucent glass button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    height: 90,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonLocked: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },

  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconWrapperLocked: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  titleLocked: {
    color: 'rgba(255,255,255,0.35)',
  },
  description: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 17,
  },
  descriptionLocked: {
    color: 'rgba(255,255,255,0.2)',
  },

  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240,165,0,0.85)',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 3,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
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