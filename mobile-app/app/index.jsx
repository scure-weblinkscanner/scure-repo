import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, BodoniModa_400Regular } from '@expo-google-fonts/bodoni-moda';
import { Image } from 'react-native';

export default function LandingScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ BodoniModa_400Regular });

  if (!fontsLoaded) return <View style={styles.wrapper} />;

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.wrapper}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
      <Image source={require('../assets/logo.png')} style={{ width: 210, height: 210 }} />
      <Text style={styles.title}>Scure</Text>
      <Text style={styles.subtitle}>Welcome to Scure. We detect threats before you do.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.signupText}>
          Don't have an account?{' '}
          <Text
            style={styles.signupLink}
            onPress={() => Linking.openURL('http://192.168.0.119:5173/register')}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 52,
    color: '#fff',
    marginTop: -50,      
    marginBottom: 140,    
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 15,
  },
  button: {
    backgroundColor: '#0E0E95',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#fff',
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  signupText: {
    color: '#fff',
    fontSize: 14,
  },
  signupLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: '#fff',
  },
});