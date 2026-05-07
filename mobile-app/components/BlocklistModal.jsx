import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function BlocklistModal({ visible, onContinue, onExit, banned = false }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <MaterialIcons name={banned ? 'block' : 'shield'} size={32} color="#FF6B6B" />
          </View>
          <Text style={styles.title}>
            {banned ? 'Banned Link' : 'Malicious Link Detected'}
          </Text>
          <Text style={styles.body}>
            {banned
              ? 'This is a banned link by the Cyber Security Agency of Singapore. URL scanning analysis reports are not allowed for this type of link.'
              : 'This is a malicious link automatically flagged by our blocklist for faster loading. You may continue scanning to get a full detailed report which takes a few moments, or exit to scan another link.'}
          </Text>
          {!banned && (
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <MaterialIcons name="search" size={18} color="#fff" />
              <Text style={styles.continueBtnText}>Continue Scanning</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
            <Text style={styles.exitBtnText}>{banned ? 'Okay, scan another.' : 'Exit'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    alignItems: 'center',
    gap: 12,
  },
  iconRow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,107,107,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 8,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#222',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    paddingVertical: 14,
    width: '100%',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  exitBtn: {
    backgroundColor: '#FFD60A',
    borderRadius: 50,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  exitBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
