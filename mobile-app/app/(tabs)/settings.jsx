import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROFILE_LABELS = {
  1: { label: 'Admin', color: '#FF6B6B' },
  2: { label: 'Free Member', color: '#0E0E95' },
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0E0E95' }}>
      <ImageBackground
        source={require('../../assets/logo.png')}
        style={styles.wrapper}
        resizeMode="cover"
      >
        {/* Top Bar */}
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backbtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.barText}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* White bottom */}
        <View style={styles.whiteBottom} />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.card}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.avatar}
            />

            <Text style={styles.username}>
              {account?.uaUsername || 'User'}
            </Text>
            <Text style={styles.email}>{account?.uaEmail}</Text>

            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: profileBadge.color }]}>
                {profileBadge.label}
              </Text>
            </View>

            {/* Options */}
            {settingsOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => {
                  if (option.route) router.push(option.route);
                }}
              >
                <View style={styles.optionLeft}>
                  <MaterialIcons
                    name={option.icon}
                    size={22}
                    color="#0E0E95"
                  />
                  <Text style={styles.optionText}>{option.label}</Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color="rgba(0,0,0,0.3)"
                />
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

  container: {
    alignItems: 'center',
    paddingTop: 180,
    paddingBottom: 40,
  },

  // Top bar
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  barText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  backbtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  card: {
    width: '85%',
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    borderWidth: 2,
    borderColor: '#0E0E95',
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'absolute',
    top: -50,
  },

  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E0E95',
  },
  email: {
    fontSize: 14,
    color: '#0E0E95',
    marginBottom: 8,
  },

  badge: {
    backgroundColor: '#0E0E95',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Options
  option: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0E0E95',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionText: {
    fontSize: 15,
    color: '#0E0E95',
    fontWeight: '500',
  },

  // Logout
  logoutBtn: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },

  // Background split
  whiteBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '70%',
    backgroundColor: '#fff',
  },
});