import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const scanOptions = [
  {
    icon: 'crop-free',
    title: 'Scan URL',
    description: 'Use your camera to scan and detect website links for security threats.',
  },
  {
    icon: 'content-paste',
    title: 'Paste URL',
    description: 'Manually enter or paste a weblink.',
  },
  {
    icon: 'qr-code-scanner',
    title: 'Scan QR Code',
    description: 'Scan QR codes instantly using your camera and analyze malicious hidden links.',
  },
  {
    icon: 'photo-library',
    title: 'Upload QR Code',
    description: 'Manually select a QR code from your gallery.',
  },
  {
    icon: 'public',
    title: 'Public Scans',
    description: 'View scans shared by others.',
  },
];

export default function ScanScreen() {
  const router = useRouter();


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
        {scanOptions.map((option, index) => (
        <TouchableOpacity 
            key={index} 
            style={styles.button}
            onPress={() => {
            if (option.title === 'Scan URL') router.push('/scanURL');
            }}
        >
            <MaterialIcons name={option.icon} size={28} color="#000" style={styles.icon} />
            <View style={styles.textContainer}>
            <Text style={styles.title}>{option.title}</Text>
            <Text style={styles.description}>{option.description}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
        ))}
      </ScrollView>
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
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#888',
  },
});