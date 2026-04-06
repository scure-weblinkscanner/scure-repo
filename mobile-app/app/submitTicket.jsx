import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { submitTicket } from '../services/tickets.service';

export default function SubmitTicketScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const submitAnim = useRef(new Animated.Value(0.2)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (submitting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(submitAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(submitAnim, { toValue: 0.2, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      submitAnim.stopAnimation();
      submitAnim.setValue(0.2);
    }
  }, [submitting]);

  const hasContent = subject.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!hasContent || submitting) return;

    setError('');
    setSubmitting(true);

    try {
      await submitTicket(token, subject.trim(), description.trim());
      setShowSuccessModal(true);
      setSubject('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.wrapper}
      resizeMode="cover"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Nav */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Report an Issue</Text>
          <TouchableOpacity onPress={() => router.push('/submittedTickets')} hitSlop={12} style={styles.backBtn}>
            <MaterialIcons name="history" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerIcon}>
                <MaterialIcons name="flag" size={32} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Submit a Ticket</Text>
              <Text style={styles.headerSubtitle}>
                Describe your issue and our team will get back to you as soon as possible.
              </Text>
            </View>

            {/* Subject */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>ISSUE DETAILS</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>SUBJECT</Text>
                <View style={styles.inputRow}>
                  <MaterialIcons name="title" size={18} color="#555" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={subject}
                    onChangeText={(t) => { setSubject(t); setError(''); }}
                    placeholder="e.g. App crashes on scan"
                    placeholderTextColor="#555"
                    autoCorrect={false}
                    editable={!submitting}
                    maxLength={100}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DESCRIPTION</Text>
                <View style={[styles.inputRow, { alignItems: 'flex-start' }]}>
                  <MaterialIcons name="description" size={18} color="#555" style={[styles.inputIcon, { marginTop: 4 }]} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={(t) => { setDescription(t); setError(''); }}
                    placeholder="Describe your issue in detail..."
                    placeholderTextColor="#555"
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
                    editable={!submitting}
                  />
                </View>
                <Text style={styles.charCount}>{description.length}/500</Text>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorRow}>
                <MaterialIcons name="error-outline" size={15} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Info */}
            <View style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={16} color="#555" />
              <Text style={styles.infoText}>
                Our admin team reviews all submitted tickets and will respond through the platform.
              </Text>
            </View>

          </Animated.View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          {submitting ? (
            <View style={styles.loadingBarContainer}>
              <Text style={styles.loadingBarLabel}>Submitting ticket…</Text>
              <View style={styles.loadingBarTrack}>
                <Animated.View style={[styles.loadingBarFill, { opacity: submitAnim }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, !hasContent && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!hasContent}
              activeOpacity={hasContent ? 0.85 : 1}
            >
              <MaterialIcons name="send" size={20} color={hasContent ? '#000' : 'rgba(255,255,255,0.2)'} />
              <Text style={[styles.submitBtnText, !hasContent && styles.submitBtnTextDisabled]}>
                {hasContent ? 'Submit Ticket' : 'Fill in all fields'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <MaterialIcons name="check-circle" size={48} color="#4AFF91" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Ticket Submitted!</Text>
            <Text style={styles.modalMessage}>
              Our team has received your report and will respond shortly.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => { setShowSuccessModal(false); router.back(); }}
            >
              <Text style={styles.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  content: { paddingHorizontal: 20, paddingBottom: 120 },

  headerRow: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  headerIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#0E0E95',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 19 },

  sectionCard: {
    backgroundColor: '#141414', borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1.5, borderColor: '#222', marginBottom: 10,
  },
  sectionTitle: { fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 1.2 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, fontSize: 15, color: '#fff', paddingVertical: 6,
  },
  textArea: {
    height: 120,
    paddingTop: 4,
  },
  charCount: { fontSize: 11, color: '#555', textAlign: 'right', marginTop: 4 },

  divider: { height: 1, backgroundColor: '#222', marginVertical: 14 },

  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 12, paddingHorizontal: 4,
  },
  errorText: { color: '#ff6b6b', fontSize: 13 },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#141414', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#222',
  },
  infoText: { color: '#fff', fontSize: 12, lineHeight: 18, flex: 1 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0A0A0A', paddingHorizontal: 20,
    paddingTop: 12, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: '#1E1E1E',
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFD60A', borderRadius: 50, paddingVertical: 17,
  },
  submitBtnDisabled: { backgroundColor: '#1E1E1E' },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  submitBtnTextDisabled: { color: 'rgba(255,255,255,0.2)' },

  loadingBarContainer: {
    width: '100%', alignItems: 'center', gap: 10, paddingVertical: 15,
  },
  loadingBarLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' },
  loadingBarTrack: {
    width: '100%', height: 4, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  loadingBarFill: {
    width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#FFD60A',
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#141414', borderRadius: 20,
    padding: 28, width: '80%', alignItems: 'center',
    borderWidth: 1, borderColor: '#222',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalBtn: {
    backgroundColor: '#FFD60A', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
    width: '100%', alignItems: 'center',
  },
  modalBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});