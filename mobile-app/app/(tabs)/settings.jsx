import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const PROFILE_LABELS = {
  1: { label: 'Admin',   color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  2: { label: 'Free',    color: '#aaa',    bg: 'rgba(255,255,255,0.08)' },
  3: { label: 'Premium', color: '#f0a500', bg: 'rgba(240,165,0,0.12)'   },
};

const settingsOptions = [
  { icon: 'manage-accounts', label: 'Account Details',  route: '/accountDetails'      },
  { icon: 'card-membership',  label: 'My Subscription'      },
  { icon: 'notifications',    label: 'Notifications'         },
  { icon: 'security',         label: 'Security Settings'     },
  { icon: 'flag',             label: 'Report an Issue'       },
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
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={56} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.username}>{account?.uaUsername || 'User'}</Text>
          <Text style={styles.email}>{account?.uaEmail}</Text>
          <View style={[styles.badge, { backgroundColor: profileBadge.bg, borderColor: profileBadge.color }]}>
            <Text style={[styles.badgeText, { color: profileBadge.color }]}>{profileBadge.label}</Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.optionsSection}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionRow} activeOpacity={0.7} 
              onPress={() => { if (option.route) router.push(option.route); }}>
              <View style={styles.optionLeft}>
                <MaterialIcons name={option.icon} size={22} color="rgba(255,255,255,0.7)" />
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.25)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },

  // Profile
  profileSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  username: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 50,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Options
  optionsSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
});