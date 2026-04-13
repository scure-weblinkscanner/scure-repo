import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator, ImageBackground, ScrollView
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useScan } from '../context/ScanContext';
import { fetchPublicScans } from '../services/scanApi.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const verdictConfig = {
  clean:      { color: '#4AFF91', icon: 'check-circle' },
  suspicious: { color: '#FFD60A', icon: 'warning'      },
  malicious:  { color: '#FF6B6B', icon: 'dangerous'    },
  unknown:    { color: '#aaa',    icon: 'help'          },
};

const scanMethodConfig = {
  cameraUrl:  { icon: 'crop-free',       label: 'Scan URL'  },
  pasteUrl:   { icon: 'content-paste',   label: 'Paste URL' },
  cameraQr:   { icon: 'qr-code-scanner', label: 'Scan QR'   },
  uploadQr:   { icon: 'photo-library',   label: 'Upload QR' },
};

const getVc = (verdict) => verdictConfig[verdict?.toLowerCase()] ?? verdictConfig.unknown;
const getMethodConfig = (method) => scanMethodConfig[method] ?? { icon: 'link', label: method };

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const PublicScanItem = ({ item, onPress }) => {
  const vc = getVc(item.shVerdict);
  const mc = getMethodConfig(item.shScanMethod);
  const username = item.userAccount?.uaUsername ?? 'Unknown';

  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(item)} activeOpacity={0.7}>
      {/* Left — verdict icon */}
      <MaterialIcons name={vc.icon} size={28} color={vc.color} style={styles.itemVerdictIcon} />

      {/* Middle — url + details */}
      <View style={styles.itemMiddle}>
        <Text style={styles.itemUrl} numberOfLines={1}>{item.shUrl}</Text>
        <Text style={styles.itemDetail}>
          Verdict: <Text style={{ color: vc.color, fontWeight: '600' }}>{item.shVerdict}</Text>
        </Text>
        <Text style={styles.itemDetail}>
          Safety Score: <Text style={styles.itemDetailValue}>{item.shRiskScore}</Text>
        </Text>
      </View>

      {/* Right — scan method icon + date */}
        <View style={styles.itemRight}>
        <MaterialIcons name={mc.icon} size={30} color="#fff" />
        <Text style={styles.itemDate}>{formatDate(item.shCreatedAt)}</Text>
        <View style={styles.usernameRow}>
            <MaterialIcons name="person" size={11} color="#fff" />
            <Text style={styles.itemUsername}>{username}</Text>
        </View>
        </View>
    </TouchableOpacity>
  );
};

export default function PublicScansScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useAuth();
  const { setSelectedHistoryItem } = useScan();
  const [scans, setScans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPublicScans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPublicScans(token);
      setScans(data.scans);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPublicScans();
    }, [token])
  );

  const filteredScans = scans.filter((item) =>
    item.shUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemPress = (item) => {
    setSelectedHistoryItem(item);
    router.push('/publicScanResult');
  };

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={[styles.header, {flexDirection: 'row', backgroundColor:'#0E0E95', alignItems: 'center', justifyContent: 'space-between'}]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Public Scans</Text>
        <View style={{width: 42}}></View>
      </View>

      <ImageBackground
        source={require('../assets/background.png')}
        style={{flex: 1}}
        resizeMode="cover"
      >
      <View style={[styles.header, {paddingTop: 16}]}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={18} color="rgba(255,255,255,0.50)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by URL..."
            placeholderTextColor="rgba(255,255,255,0.50)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={16} color="rgba(255,255,255,0.50)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={36} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadPublicScans}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredScans}
          keyExtractor={(item) => String(item.shId)}
          renderItem={({ item }) => <PublicScanItem item={item} onPress={handleItemPress} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialIcons name="public" size={36} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No results for that URL.' : 'No public scans yet.'}
              </Text>
            </View>
          }
        />
      )}
      </ImageBackground>
      {/* Stats footer */}
      {!loading && !error && (
        <View style={[styles.statsBar, {paddingBottom: insets.bottom + 15}]}>
          <Text style={styles.statsText}>
            <Text style={styles.statsHighlight}>{filteredScans.length}</Text>
            {searchQuery ? ' results found.' : ' public scans available.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: '#0a0a0a' 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 56, 
    paddingBottom: 12, 
    gap: 12
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#0E0E95', 
    borderRadius: 50,
    padding: 10,
    paddingTop: 12 
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '800'
  },
  searchBar: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.10)', 
    borderRadius: 12,
    paddingHorizontal: 14, 
    paddingVertical: 10,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { 
    flex: 1, 
    color: '#fff', 
    fontSize: 14 
  },
  listContent: { 
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 16, 
    gap: 10 
  },
  item: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.10)', 
    borderRadius: 14,
    padding: 14, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)',
  },
  itemVerdictIcon: { 
    flexShrink: 0 
  },
  itemMiddle: { 
    flex: 1, 
    gap: 2 
  },
  itemUrl: { 
    color: '#fff', 
    fontSize: 13, 
    fontWeight: '600', 
    fontFamily: 'monospace' 
  },
  itemDetail: { 
    color: '#fff', 
    fontSize: 12 
  },
  itemDetailValue: { 
    color: 'rgba(255,255,255,0.7)', 
    fontWeight: '600' 
  },
  usernameRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginTop: 2 
  },
  itemUsername: { 
    color: '#fff', 
    fontSize: 11 
  },
  itemRight: { 
    alignItems: 'flex-end', 
    gap: 6, 
    flexShrink: 0 
  },
  itemDate: { 
    color: '#fff', 
    fontSize: 11 
  },

  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 60 
  },
  errorText: { 
    color: '#FF6B6B', 
    fontSize: 14 
  },
  retryBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 24, 
    borderRadius: 50, 
    backgroundColor: 'rgba(255,255,255,0.1)' 
  },
  retryBtnText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  emptyText: { 
    color: 'rgba(255,255,255,0.3)', 
    fontSize: 14 
  },

  statsBar: {
    paddingHorizontal: 20, 
    paddingVertical: 14,
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0a0a0a',
  },
  statsText: { 
    color: 'rgba(255,255,255,0.4)', 
    fontSize: 13, 
    textAlign: 'center' 
  },
  statsHighlight: { 
    color: '#fff', 
    fontWeight: '700' 
  },
});