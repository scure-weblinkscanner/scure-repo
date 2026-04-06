import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { getTicketsByUser } from '../services/tickets.service';

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#FFD60A', icon: 'radio-button-unchecked' },
  in_progress: { label: 'In Progress', color: '#4A9EFF', icon: 'autorenew'              },
  resolved:    { label: 'Resolved',    color: '#4AFF91', icon: 'check-circle'            },
};

function TicketCard({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const status = STATUS_CONFIG[ticket.tkStatus] ?? STATUS_CONFIG.open;
  const date = new Date(ticket.tkCreatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Card header — always visible, tap to expand */}
      <TouchableOpacity onPress={toggle} activeOpacity={0.8} style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardSubject} numberOfLines={expanded ? undefined : 1}>
            {ticket.tkSubject}
          </Text>
          <Text style={styles.cardDate}>{date}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.statusBadge, { borderColor: status.color }]}>
            <MaterialIcons name={status.icon} size={11} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <MaterialIcons
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            color="#555"
            style={{ marginTop: 6 }}
          />
        </View>
      </TouchableOpacity>

      {/* Expandable detail */}
      <Animated.View style={{
        overflow: 'hidden',
        maxHeight: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 600] }),
        opacity: expandAnim,
      }}>
        <View style={styles.divider} />

        <Text style={styles.detailLabel}>DESCRIPTION</Text>
        <Text style={styles.detailText}>{ticket.tkDescription}</Text>

        {ticket.tkAdminResponse ? (
          <>
            <View style={styles.divider} />
            <View style={styles.responseRow}>
              <MaterialIcons name="support-agent" size={14} color="#4AFF91" />
              <Text style={styles.responseLabel}>ADMIN RESPONSE</Text>
            </View>
            <Text style={styles.responseText}>{ticket.tkAdminResponse}</Text>
          </>
        ) : (
          <>
            <View style={styles.divider} />
            <View style={styles.pendingRow}>
              <MaterialIcons name="hourglass-empty" size={14} color="#555" />
              <Text style={styles.pendingText}>Awaiting admin response</Text>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

export default function SubmittedTicketsScreen() {
  const router = useRouter();
  const { token, account } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    if (loading) loop.start();
    return () => loop.stop();
  }, [loading]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTicketsByUser(account.uaId, token);
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (account?.uaId) load();
    else setLoading(false);
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <Animated.View style={{ opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonLineLg} />
                <View style={styles.skeletonBadge} />
              </View>
              <View style={[styles.skeletonLineSm, { marginTop: 8 }]} />
            </View>
          ))}
        </Animated.View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerBox}>
          <MaterialIcons name="error-outline" size={40} color="#ff6b6b" />
          <Text style={styles.centerText}>{error}</Text>
        </View>
      );
    }

    if (tickets.length === 0) {
      return (
        <View style={styles.centerBox}>
          <MaterialIcons name="inbox" size={48} color="#333" />
          <Text style={styles.centerTitle}>No tickets yet</Text>
          <Text style={styles.centerText}>Your submitted tickets will appear here.</Text>
        </View>
      );
    }

    return tickets.map((ticket) => (
      <TicketCard key={ticket.tkId} ticket={ticket} />
    ));
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.wrapper}
      resizeMode="cover"
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Tickets</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="confirmation-number" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Submitted Tickets</Text>
          <Text style={styles.headerSubtitle}>
            Tap a ticket to view its details and admin response.
          </Text>
        </View>

        {renderContent()}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },

  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#0E0E95',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  content: { paddingHorizontal: 20, paddingBottom: 40 },

  headerRow: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  headerIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#0E0E95',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 19 },

  card: {
    backgroundColor: '#141414', borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#222', marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderLeft: { flex: 1, marginRight: 12 },
  cardHeaderRight: { alignItems: 'flex-end' },
  cardSubject: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#555' },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#222', marginVertical: 12 },

  detailLabel: { fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  detailText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },

  responseRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  responseLabel: { fontSize: 10, color: '#4AFF91', fontWeight: '700', letterSpacing: 1.5 },
  responseText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },

  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pendingText: { fontSize: 13, color: '#555', fontStyle: 'italic' },

  centerBox: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  centerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  centerText: { fontSize: 13, color: '#555', textAlign: 'center' },

  skeletonCard: {
    backgroundColor: '#141414', borderRadius: 18,
    padding: 18, borderWidth: 1.5, borderColor: '#222', marginBottom: 10,
  },
  skeletonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skeletonLineLg: { width: '55%', height: 14, borderRadius: 6, backgroundColor: '#222' },
  skeletonLineSm: { width: '30%', height: 10, borderRadius: 6, backgroundColor: '#222' },
  skeletonBadge: { width: 70, height: 22, borderRadius: 999, backgroundColor: '#222' },
});
