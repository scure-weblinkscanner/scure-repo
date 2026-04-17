import { useState, useEffect, useRef } from 'react';
import { Animated, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground, Image, KeyboardAvoidingView, Linking, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUserAccount } from '../services/userAccount.service';
import { useFonts, BodoniModa_400Regular } from '@expo-google-fonts/bodoni-moda';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [fontsLoaded] = useFonts({ BodoniModa_400Regular });

  const [uaEmail, setUaEmail] = useState('');
  const [uaPassword, setUaPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!fontsLoaded) return <View style={styles.wrapper} />;

  const handleLogin = async () => {
    if (!uaEmail.trim() || !uaEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!uaPassword) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { token, account } = await loginUserAccount(uaEmail.trim(), uaPassword);
      await login(token, account);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.wrapper}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Image source={require('../assets/logo.png')} style={{ width: 210, height: 210, alignSelf: 'center' }} />
            <Text style={styles.title}>Scure</Text>
          </Animated.View>

          <Text style={[styles.subtitle, { marginBottom: 15 }]}>Log In</Text>
          <Text style={[styles.subtitle, { fontSize: 20, marginBottom: 20 }]}>Welcome back to Scure</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../assets/email.png')} style={{ width: 50, height: 50 }} />
            <Text style={styles.inputText}> Email </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={uaEmail}
            onChangeText={setUaEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('../assets/psw.png')} style={{ width: 50, height: 50 }} />
              <Text style={styles.inputText}> Password </Text>
            </View>
            <Text
              style={[styles.inputText, { fontSize: 12, marginRight: 10, textDecorationLine: 'underline' }]}
              //onPress={() => Linking.openURL('https://scure.up.railway.app/login')}
            >
              Forget Password?
            </Text>
          </View>

          <TextInput
            style={[styles.input, { marginBottom: 24 }]}
            placeholder="Enter your password"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={uaPassword}
            onChangeText={setUaPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 52,
    color: '#fff',
    marginTop: -50,
    marginBottom: 30,
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 30,
    color: '#fff',
    marginBottom: 60,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginTop: -10,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#0E0E95',
  },
  inputText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: -10,
  },
  button: {
    backgroundColor: '#0E0E95',
    padding: 16,
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
    width: 200,
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});