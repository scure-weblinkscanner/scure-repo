import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { account, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.username}>{account?.uaUsername || 'User'}</Text>
      <Text style={styles.email}>{account?.uaEmail}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, backgroundColor: '#fff' },
  username: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  email: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 40 },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});