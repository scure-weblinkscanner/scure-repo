import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useScan } from '../context/ScanContext';

// ── Verdict config for fact-check verdicts ──
const verdictConfig = {
  trustworthy: { color: '#4AFF91', bg: 'rgba(74,255,145,0.12)',  icon: 'verified',      label: 'Trustworthy' },
  questionable: { color: '#FFD60A', bg: 'rgba(255,214,10,0.12)', icon: 'help',          label: 'Questionable' },
  misleading:   { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)',icon: 'dangerous',     label: 'Misleading'  },
};

// ── Claim-level verdict config ──
const claimVerdictConfig = {
  true:        { color: '#4AFF91', icon: 'check-circle',   label: 'True'       },
  false:       { color: '#FF6B6B', icon: 'cancel',         label: 'False'      },
  misleading:  { color: '#FF6B6B', icon: 'dangerous',      label: 'Misleading' },
  unverified:  { color: '#aaa',    icon: 'help-outline',   label: 'Unverified' },
};

const getVC  = (v) => verdictConfig[v?.toLowerCase()]   ?? verdictConfig.questionable;
const getCVC = (v) => claimVerdictConfig[v?.toLowerCase()] ?? claimVerdictConfig.unverified;

const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;

const CardTitle = ({ icon, label }) => (
  <View style={styles.cardTitleRow}>
    <MaterialIcons name={icon} size={15} color="rgba(255,255,255,0.4)" />
    <Text style={styles.cardTitleText}>{label}</Text>
  </View>
);

// ── Confidence meter bar ──
const ConfidenceMeter = ({ score }) => {
  const color = score >= 70 ? '#4AFF91' : score >= 40 ? '#FFD60A' : '#FF6B6B';
  return (
    <View style={styles.meterWrapper}>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.meterLabel, { color }]}>{score}% confidence</Text>
    </View>
  );
};

export default function FactCheckResultScreen() {
  const router = useRouter();
  const { factCheckResult: result } = useScan();

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>No fact-check result found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vc = getVC(result.verdict);

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.wrapper}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={[styles.hero, { borderColor: vc.color, backgroundColor: vc.bg }]}>
          <MaterialIcons name={vc.icon} size={52} color={vc.color} />
          <Text style={[styles.heroVerdict, { color: vc.color }]}>{vc.label}</Text>
          <Text style={styles.heroUrl} numberOfLines={2}>{result.url}</Text>
          <ConfidenceMeter score={result.confidenceScore ?? 50} />
          {result.summary ? (
            <Text style={styles.heroSummary}>{result.summary}</Text>
          ) : null}
        </View>

        {/* ── Claims Analysis ── */}
        {result.claims?.length > 0 && (
          <Card>
            <CardTitle icon="fact-check" label={`Claims Analysed (${result.claims.length})`} />
            {result.claims.map((item, i) => {
              const cvc = getCVC(item.verdict);
              return (
                <View key={i} style={styles.claimRow}>
                  <View style={styles.claimHeader}>
                    <MaterialIcons name={cvc.icon} size={16} color={cvc.color} style={{ flexShrink: 0, marginTop: 1 }} />
                    <Text style={styles.claimText}>{item.claim}</Text>
                    <View style={[styles.claimBadge, { borderColor: cvc.color, backgroundColor: `${cvc.color}18` }]}>
                      <Text style={[styles.claimBadgeText, { color: cvc.color }]}>{cvc.label}</Text>
                    </View>
                  </View>
                  {item.explanation ? (
                    <Text style={styles.claimExplanation}>{item.explanation}</Text>
                  ) : null}
                </View>
              );
            })}
          </Card>
        )}

        {/* ── Red Flags ── */}
        {result.redFlags?.length > 0 && (
          <Card>
            <CardTitle icon="flag" label="Red Flags" />
            {result.redFlags.map((flag, i) => (
              <View key={i} style={styles.flagRow}>
                <MaterialIcons name="cancel" size={14} color="#FF6B6B" style={{ flexShrink: 0, marginTop: 1 }} />
                <Text style={styles.flagText}>{flag}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* ── Positive Indicators ── */}
        {result.positiveIndicators?.length > 0 && (
          <Card>
            <CardTitle icon="thumb-up" label="Positive Indicators" />
            {result.positiveIndicators.map((indicator, i) => (
              <View key={i} style={styles.flagRow}>
                <MaterialIcons name="check-circle" size={14} color="#4AFF91" style={{ flexShrink: 0, marginTop: 1 }} />
                <Text style={[styles.flagText, { color: 'rgba(255,255,255,0.7)' }]}>{indicator}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimerCard}>
          <MaterialIcons name="info-outline" size={14} color="rgba(255,255,255,0.3)" />
          <Text style={styles.disclaimerText}>
            This analysis is AI-generated and may not be fully accurate. Always verify claims with trusted sources before drawing conclusions.
          </Text>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Back to Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => router.push('/scan')}
          >
            <MaterialIcons name="replay" size={20} color="#000" />
            <Text style={[styles.actionBtnText, { color: '#000' }]}>New Scan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 56, gap: 12 },

  // ── Hero ──
  hero: {
    borderRadius: 20, borderWidth: 1.5, padding: 24,
    alignItems: 'center', gap: 10,
  },
  heroVerdict: { fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  heroUrl: {
    color: 'rgba(255,255,255,0.45)', fontSize: 12,
    textAlign: 'center', fontFamily: 'monospace',
  },
  heroSummary: {
    color: 'rgba(255,255,255,0.7)', fontSize: 13,
    textAlign: 'center', lineHeight: 20, marginTop: 4,
  },

  // ── Confidence meter ──
  meterWrapper: { width: '100%', gap: 6, alignItems: 'center' },
  meterTrack: {
    width: '100%', height: 6, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 50 },
  meterLabel: { fontSize: 12, fontWeight: '700' },

  // ── Card ──
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 10,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitleText: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11,
    fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
  },

  // ── Claims ──
  claimRow: {
    gap: 6, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  claimHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  claimText: { color: '#fff', fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 19 },
  claimBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, borderWidth: 1, flexShrink: 0,
  },
  claimBadgeText: { fontSize: 11, fontWeight: '700' },
  claimExplanation: {
    color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 17,
    paddingLeft: 24,
  },

  // ── Flags & indicators ──
  flagRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  flagText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 19, flex: 1 },

  // ── Disclaimer ──
  disclaimerCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  disclaimerText: {
    color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 16, flex: 1,
  },

  // ── Actions ──
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  actionBtnPrimary: { backgroundColor: '#fff', borderColor: '#fff' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // ── Error state ──
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a', gap: 16 },
  errorText: { color: '#FF6B6B', fontSize: 16 },
  backButton: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  backButtonText: { color: '#fff', fontWeight: '600' },
});