import { View, Text, TouchableOpacity, StyleSheet, Switch, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notificationsEnabled, toggleNotifications } = useNotifications();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0E0E95' }}>
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.wrapper}
        resizeMode="cover"
      >
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backbtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.barText}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.whiteBottom} />

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <MaterialIcons name="notifications-active" size={22} color="#0E0E95" style={{ marginRight: 12 }} />
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>App Security Notifications</Text>
                  <Text style={styles.rowDesc}>
                    Get notified when your scan finishes, even if you leave the app.
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#ccc', true: '#0E0E95' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  topbar: {
    backgroundColor: '#0E0E95',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 70,
    justifyContent: 'space-between',
  },
  barText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: -60,
  },
  backbtn: {
    justifyContent: 'center',
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  whiteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    zIndex: 1,
  },
  card: {
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0E0E95',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E0E95',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: '#555',
    lineHeight: 17,
  },
});
