import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SettingsScreen() {
  const router = useRouter();
  const { account, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0E0E95'}}>
    <ImageBackground
      source={require('../../assets/background.png')}
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
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 5, paddingTop: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rectangle}>
          <Text style={styles.username}>{account?.uaUsername || 'User'}</Text>
          <Text style={styles.email}>{account?.uaEmail}</Text>
          <View style={styles.freememlogo}>
            <Text style={styles.freeText}> Free Member </Text>
          </View>
          <Image source={require('../../assets/profile.png')} style={styles.circle} />
          <TouchableOpacity style={[styles.button, { marginTop: 20}]} onPress={handleLogout}>
            <View style={styles.containerButton}>
              <Image source={require('../../assets/2.png')} style={styles.icon}/>
              <Text style={styles.buttonText}>Account Details</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <View style={styles.containerButton}>
              <Image source={require('../../assets/3.png')} style={{ width: 50, height: 50 }} />
              <Text style={styles.buttonText}>My Subscription</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <View style={styles.containerButton}>
              <Image source={require('../../assets/noti.png')} style={{ width: 50, height: 50 }} />
              <Text style={styles.buttonText}>Notifications</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <View style={styles.containerButton}>
              <Image source={require('../../assets/1.png')} style={{ width: 50, height: 50 }} />
              <Text style={styles.buttonText}>Security Settings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <View style={styles.containerButton}>
              <Image source={require('../../assets/5.png')} style={{ width: 50, height: 50 }} />
              <Text style={styles.buttonText}>Report an Issue</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <View style={styles.containerButton}>
              <Image source={require('../../assets/6.png')} style={{ width: 50, height: 50 }} />
              <Text style={styles.buttonText}>Logout</Text>
            </View>
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
    width: 200,
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
    alignItems: 'center',
    marginBottom: 30,
    width: 280,
    height: 50,
  },
  icon: {
    width: 50,
    height: 50,
  },
  freememlogo: {
    backgroundColor: '#0E0E95',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  freeText: {
    fontSize: 12,
    color: '#fff',
  },
  buttonText: {
    color: '#0E0E95',
    fontSize: 16,
    fontWeight: '600',
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