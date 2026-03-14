import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUserAccount } from '../services/userAccount.service';
import { useFonts, BodoniModa_400Regular } from '@expo-google-fonts/bodoni-moda';
import { ABeeZee_400Regular } from '@expo-google-fonts/abeezee';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [fontsLoaded] = useFonts({ BodoniModa_400Regular, ABeeZee_400Regular });

  const [uaEmail, setUaEmail] = useState('');
  const [uaPassword, setUaPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!fontsLoaded) return <View style={styles.wrapper} />;

  const handleLogin = async () => {
  setError('');
  setLoading(true);
  try {
    const { token, account } = await loginUserAccount(uaEmail, uaPassword);   // calls service API (controller)
    await login(token, account);
    // removed router.replace, let _layout.tsx handle the redirect
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

    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={{ width: 210, height: 210, alignSelf: 'center' }} />
      <Text style={styles.title}>Scure</Text>
      <Text style={[styles.subtitle, {marginBottom: 15}]}>Log In</Text>
      <Text style={[styles.subtitle, {fontSize: 20}]}>Welcome back to Scure</Text>

      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image source={require('../assets/email.png')} style={{ width: 50, height: 50}} />
        <Text style={styles.inputText}> Email </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#888"
        value={uaEmail}
        onChangeText={setUaEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image source={require('../assets/psw.png')} style={{ width: 50, height: 50 }} />
      <Text style={styles.inputText}> Password </Text>
      <Text 
        style={[styles.inputText, {fontSize: 12, marginLeft: 110, textDecorationLine: 'underline'}]}
        onPress={() => Linking.openURL('http://192.168.0.119:5173/register')}
      > 
        Forget Password? 
      </Text>
      </View>
      <TextInput
        style={[styles.input, {marginBottom: 50}]}
        placeholder="Enter your password"
        placeholderTextColor="#888"
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
    </View>
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
    marginBottom: 50,    
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'ABeeZee_400Regular',
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
    marginBottom: 30,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#282687'
  },
  inputText: {
    fontFamily: 'ABeeZee_400Regular',
    fontSize: 16,
    color: '#fff',
    marginLeft: -10
  },
  button: {
    backgroundColor: '#282687',
    padding: 16,
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
    width: 200,
    alignSelf: 'center'
  },
  buttonText: {
    fontFamily: 'ABeeZee_400Regular',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});