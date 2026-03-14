import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const PREMIUM_PROFILE_ID = 3;
import { useFonts, BodoniModa_400Regular } from '@expo-google-fonts/bodoni-moda';

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
  };  const [fontsLoaded] = useFonts({ BodoniModa_400Regular });
  
  if (!fontsLoaded) return <View style={styles.wrapper} />;

  return (
    <SafeAreaView style={styles.wrapper}>
      <ImageBackground
          source={require('../../assets/background.png')}
          style={{flex: 1}}
          resizeMode="cover"
      >
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <Image source={require('../../assets/logo.png')} style={{width: 50, height: 50, marginLeft: -10}}/>
        <Text style={styles.topNavText}> Scure </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingBottom: -25
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#0E0E95',
    height: 70
  },
  topNavText: {
    color: '#fff',
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 30,
    marginRight: -10
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
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#fff'
  },
  logoSub: {
    fontSize: 24,
    color: '#888',
    marginTop: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E0E95',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    height: 100,
    borderColor: '#fff',
    borderWidth: 1
  },
  buttonLocked: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ececec',
  },
  icon: {
    marginRight: 16,
    color: '#fff'
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
    color: '#fff'
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