import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const PROFILE_LABELS = {
  1: { label: 'Admin', color: '#FF6B6B' },
  2: { label: 'Free Member', color: '#fff' },
  3: { label: 'Premium', color: '#f0a500' },
};

const settingsOptions = [
  { icon: 'manage-accounts', label: 'Account Details', route: '/accountDetails' },
  { icon: 'card-membership', label: 'My Subscription' },
  { icon: 'notifications', label: 'Notifications' },
  { icon: 'security', label: 'Security Settings' },
  { icon: 'flag', label: 'Report an Issue' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { account, logout } = useAuth();

  const profileId = account?.uaUserProfileId;
  const profileBadge = PROFILE_LABELS[profileId] ?? PROFILE_LABELS[2];

  const handleLogout = async () => {
    await logout();
  };

return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0E0E95'}}>
    <ImageBackground
      source={require('../../assets/logo.png')}
      style={styles.wrapper}
      resizeMode="cover">
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backbtn}>
          <MaterialIcons name="arrow-back" size={24} color='#fff'></MaterialIcons>
        </TouchableOpacity>
        <Text style={styles.barText}> Settings </Text>
        <View></View>
      </View>

      {/* White bottom section */}
      <View style={styles.whiteBottom} />

      <ScrollView
        style={{ width: '100%'}}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 40, paddingTop: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rectangle}>
          <Text style={styles.username}>{account?.uaUsername || 'User'}</Text>
          <Text style={styles.email}>{account?.uaEmail}</Text>

          {/* Dynamic badge */}
          <View style={styles.freememlogo}>
            <Text style={[styles.freeText, { color: profileBadge.color }]}>
              {profileBadge.label}
            </Text>
          </View>

          <Image source={require('../../assets/logo.png')} style={styles.circle} />

          {/* Settings options */}
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, index === 0 && { marginTop: 20 }]}
              onPress={() => {
                if (option.route) router.push(option.route);
              }}
            >
              <View style={styles.containerButton}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name={option.icon} size={24} color="#0E0E95" />
                </View>
                <Text style={styles.buttonText}>{option.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="rgba(0,0,0,0.3)" />
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#FF6B6B" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  containerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    alignItems: 'center',
  },
  rectangle: {
    position: 'relative',
    width: '80%',
    borderColor: '#0E0E95',
    borderWidth: 2,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    top: -70,
    borderRadius: 20,
    paddingBottom: 20,
  },
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
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 45,
    color: '#0E0E95',
  },
  email: {
    fontSize: 16,
    color: '#0E0E95',
    textAlign: 'center',
    marginTop: -5,
  },
  button: {
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0E0E95',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 15,
    width: 280,
    height: 50,
  },
  freememlogo: {
    backgroundColor: '#0E0E95',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonText: {
    color: '#0E0E95',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 15,
  },
  whiteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#fff',
  },
});