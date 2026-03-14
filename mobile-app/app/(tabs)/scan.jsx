import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFonts, BodoniModa_400Regular } from '@expo-google-fonts/bodoni-moda';

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
  const [fontsLoaded] = useFonts({ BodoniModa_400Regular });
  
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
        {scanOptions.map((option, index) => (
        <TouchableOpacity 
            key={index} 
            style={styles.button}
            onPress={() => {
            if (option.title === 'Scan URL') router.push('/scanURL');
            if (option.title === 'Paste URL') router.push('/pasteURL');
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
      </ImageBackground>
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
  icon: {
    marginRight: 16,
    color: '#fff'
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#fff'
  },
  description: {
    fontSize: 13,
    color: '#888',
  },
});