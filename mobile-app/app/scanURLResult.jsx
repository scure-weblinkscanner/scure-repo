import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ImageBackground,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useScan } from '../context/ScanContext';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../constants/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const verdictConfig = {
  clean:      { color: '#4AFF91', bg: 'rgba(74,255,145,0.12)',  icon: 'check-circle', label: 'Safe'       },
  suspicious: { color: '#FFD60A', bg: 'rgba(255,214,10,0.12)',  icon: 'warning',      label: 'Suspicious' },
  malicious:  { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', icon: 'dangerous',    label: 'Dangerous'  },
  unknown:    { color: '#aaa',    bg: 'rgba(255,255,255,0.07)', icon: 'help',         label: 'Unknown'    },
};

const getVC = (verdict) => verdictConfig[verdict?.toLowerCase()] ?? verdictConfig.unknown;

const Card = ({ children }) => <View style={styles.card}>{children}</View>;

const ENGINE_BADGE = {
  urlscan:      { label: 'URL',        color: '#FF8C00', bg: 'rgba(255,140,0,0.15)' },
  virustotal:   { label: 'VT',         color: '#4FC3F7', bg: 'rgba(79,195,247,0.15)' },
  safebrowsing: { label: 'GSB',        color: '#81C784', bg: 'rgba(129,199,132,0.15)' },
  gemini:       { label: 'AI (Gemini)',color: '#CE93D8', bg: 'rgba(206,147,216,0.15)' },
  groq:         { label: 'AI (Groq)',  color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
};
const EngineBadge = ({ engine }) => {
  const cfg = ENGINE_BADGE[engine];
  if (!cfg) return null;
  return (
    <View style={[styles.engineBadge, { backgroundColor: cfg.bg, borderColor: `${cfg.color}60` }]}>
      <Text style={[styles.engineBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const formatDuration = (secs) => {
  if (!secs && secs !== 0) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const CollapsibleCard = ({ icon, label, children, badge, description, engine }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTitleRow}>
          <MaterialIcons name={icon} size={15} color="rgba(255,255,255,0.4)" />
          <Text style={styles.cardTitleText}>{label}</Text>
          {badge ? <Text style={styles.collapsibleBadge}>{badge}</Text> : null}
          {engine ? <EngineBadge engine={engine} /> : null}
        </View>
        <MaterialIcons
          name={open ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>
      {description ? <Text style={styles.cardDesc}>{description}</Text> : null}
      {open && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
};

const CardTitle = ({ icon, label, engine }) => {
  const inner = (
    <View style={styles.cardTitleRow}>
      <MaterialIcons name={icon} size={15} color="rgba(255,255,255,0.4)" />
      <Text style={styles.cardTitleText}>{label}</Text>
    </View>
  );
  if (engine) {
    return (
      <View style={styles.cardTitleRowWithBadge}>
        {inner}
        <EngineBadge engine={engine} />
      </View>
    );
  }
  return inner;
};

const Row = ({ label, value, valueColor, mono }) => {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[styles.rowValue, mono && styles.mono, valueColor ? { color: valueColor } : null]}
        numberOfLines={0}
      >
        {displayValue}
      </Text>
    </View>
  );
};

const ExpandableRow = ({ label, values, mono }) => {
  const [expanded, setExpanded] = useState(false);
  if (!values?.length) return null;
  const preview = values.slice(0, 2);
  const rest = values.slice(2);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flex: 2, alignItems: 'flex-end' }}>
        {preview.map((v, i) => (
          <Text key={i} style={[styles.rowValue, mono && styles.mono]} numberOfLines={0}>{v}</Text>
        ))}
        {rest.length > 0 && !expanded && (
          <TouchableOpacity onPress={() => setExpanded(true)} style={styles.expandBtn}>
            <Text style={styles.expandBtnText}>· · · {rest.length} more</Text>
          </TouchableOpacity>
        )}
        {expanded && rest.map((v, i) => (
          <Text key={i + 2} style={[styles.rowValue, mono && styles.mono]} numberOfLines={0}>{v}</Text>
        ))}
        {expanded && (
          <TouchableOpacity onPress={() => setExpanded(false)} style={styles.expandBtn}>
            <Text style={styles.expandBtnText}>Show less</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const Badge = ({ verdict }) => {
  const vc = getVC(verdict);
  return (
    <View style={[styles.badge, { backgroundColor: vc.bg, borderColor: vc.color }]}>
      <MaterialIcons name={vc.icon} size={13} color={vc.color} />
      <Text style={[styles.badgeText, { color: vc.color }]}>{vc.label}</Text>
    </View>
  );
};

const Tag = ({ label, color }) => (
  <View style={[styles.tag, { borderColor: color ?? 'rgba(255,255,255,0.2)' }]}>
    <Text style={[styles.tagText, { color: color ?? 'rgba(255,255,255,0.5)' }]}>{label}</Text>
  </View>
);

const ScannerRow = ({ name, verdict, detail, engine }) => (
  <View style={styles.scannerRow}>
    <View style={styles.scannerTop}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={styles.scannerName}>{name}</Text>
        {engine ? <EngineBadge engine={engine} /> : null}
      </View>
      <Badge verdict={verdict} />
    </View>
    {detail ? <Text style={styles.scannerDetail}>{detail}</Text> : null}
  </View>
);

const PREMIUM_PROFILE_ID = 3;

const getSlideLabels = (adAnalysis) => [
  'Initial Load',
  'After Scroll',
  adAnalysis?.popupCount >= 1 ? 'Popup Opened' : 'After Interaction',
];

const AdAnalysisCard = ({ adAnalysis }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const intervalRef = useRef(null);
  const slideLabels = getSlideLabels(adAnalysis);

  useEffect(() => {
    if (adAnalysis?.isAdIntensive && adAnalysis.screenshots?.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx((i) => (i + 1) % adAnalysis.screenshots.length);
      }, 1200);
    }
    return () => clearInterval(intervalRef.current);
  }, [adAnalysis]);

  if (!adAnalysis) return null;

  if (adAnalysis.failed) {
    return (
      <View style={[styles.card, { borderColor: 'rgba(255,255,255,0.1)' }]}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="ad-units" size={15} color="rgba(255,255,255,0.35)" />
          <Text style={styles.cardTitleText}>Ad Detection</Text>
        </View>
        <Text style={styles.adCleanText}>
          Ad detection ran but couldn't complete for this page. This can happen on sites that block automated browsers.
        </Text>
      </View>
    );
  }

  if (!adAnalysis.isAdIntensive) {
    return (
      <View style={[styles.card, styles.adCleanCard]}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="check-circle" size={15} color="#4AFF91" />
          <Text style={[styles.cardTitleText, { color: '#4AFF91' }]}>Ad Check Complete</Text>
        </View>
        <Text style={styles.adCleanText}>
          No excessive ads were found on this page. It looks clean and distraction-free to browse.
        </Text>
      </View>
    );
  }

  const { screenshots, adNetworks } = adAnalysis;

  return (
    <View style={[styles.card, styles.adWarningCard]}>
      <View style={styles.cardTitleRow}>
        <MaterialIcons name="ad-units" size={15} color="#FFA500" />
        <Text style={[styles.cardTitleText, { color: '#FFA500' }]}>Ad Intensive Page</Text>
      </View>

      {screenshots?.length > 0 && (
        <View style={styles.adSlideshow}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${screenshots[currentIdx]}` }}
            style={styles.adScreenshot}
            resizeMode="cover"
          />
          <View style={styles.adSlideCaption}>
            <Text style={styles.adSlideLabelText}>{slideLabels[currentIdx]}</Text>
          </View>
          <View style={styles.adSlideDots}>
            {screenshots.map((_, i) => (
              <View
                key={i}
                style={[styles.adDot, i === currentIdx && styles.adDotActive]}
              />
            ))}
          </View>
        </View>
      )}

      {adNetworks?.length > 0 && (
        <View>
          <Text style={styles.adNetworksLabel}>Ad Networks Detected</Text>
          <View style={styles.adNetworksRow}>
            {adNetworks.map((n, i) => (
              <View key={i} style={styles.adNetworkChip}>
                <Text style={styles.adNetworkChipText}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.adWarningText}>
        This page loads ads from multiple sources and injects new content as you scroll and interact. It may slow down your device, use extra mobile data, and disrupt your experience.
      </Text>
    </View>
  );
};

const EmbeddedLinksExpander = ({ links }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      {expanded && links.map((link, i) => {
        const vc = getVC(link.verdict);
        return (
          <View key={i} style={styles.embeddedLinkRow}>
            <MaterialIcons name={vc.icon} size={14} color={vc.color} style={{ flexShrink: 0 }} />
            <Text style={styles.embeddedLinkUrl} numberOfLines={1}>{link.url}</Text>
            <Badge verdict={link.verdict} />
          </View>
        );
      })}
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} style={styles.expandBtn}>
        <Text style={styles.expandBtnText}>
          {expanded ? 'Show less' : `· · · ${links.length} more`}
        </Text>
      </TouchableOpacity>
    </>
  );
};

// Placeholder links shown in the blurred preview for free users
const PLACEHOLDER_LINKS = [
  { url: 'https://cdn.example.com/assets/script.js', verdict: 'clean' },
  { url: 'https://tracker.thirdparty.net/pixel?uid=xxx', verdict: 'suspicious' },
  { url: 'https://fonts.googleapis.com/css2?family=Inter', verdict: 'clean' },
  { url: 'https://analytics.service.io/collect', verdict: 'unknown' },
];

const EmbeddedLinksCard = ({ links }) => {
  const { account } = useAuth();
  const isPremium = account?.uaUserProfileId === PREMIUM_PROFILE_ID;
  const [showModal, setShowModal] = useState(false);

  // ── FREE USER: blurred placeholder card with upgrade overlay ──
  if (!isPremium) {
    return (
      <>
        <View style={styles.lockedCardWrapper}>
          <View pointerEvents="none" style={styles.lockedCardBlurred}>
            <View style={styles.card}>
              <CardTitle icon="link" label="Embedded Links (4)" />
              {PLACEHOLDER_LINKS.map((link, i) => {
                const vc = getVC(link.verdict);
                return (
                  <View key={i} style={styles.embeddedLinkRow}>
                    <MaterialIcons name={vc.icon} size={14} color={vc.color} style={{ flexShrink: 0 }} />
                    <Text style={styles.embeddedLinkUrl} numberOfLines={1}>{link.url}</Text>
                    <Badge verdict={link.verdict} />
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.lockedCardOverlay}>
            <TouchableOpacity
              style={styles.premiumScanBtn}
              onPress={() => setShowModal(true)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="link" size={18} color="#FFD60A" />
              <Text style={styles.premiumScanBtnText}>Second-Level Scan</Text>
              <View style={styles.premiumBadge}>
                <MaterialIcons name="lock" size={11} color="#fff" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          transparent
          animationType="fade"
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <MaterialIcons name="workspace-premium" size={36} color="#f0a500" style={{ marginBottom: 12 }} />
              <Text style={styles.modalTitle}>Premium Feature</Text>
              <Text style={styles.modalMessage}>
                Second-level scan checks all embedded links inside the page for threats. Upgrade to unlock this feature.
              </Text>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={() => {
                  setShowModal(false);
                  Linking.openURL('https://scure.up.railway.app/upgrade');
                }}
              >
                <Text style={styles.modalBtnPrimaryText}>Yes, upgrade now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // ── PREMIUM USER: real data ──
  if (!links?.length) return null;

  const anyMalicious = links.some((r) => r.verdict === 'malicious');
  const anySuspicious = links.some((r) => r.verdict === 'suspicious');
  const maliciousCount = links.filter((r) => r.verdict === 'malicious').length;
  const suspiciousCount = links.filter((r) => r.verdict === 'suspicious').length;

  const VISIBLE_COUNT = 5;
  const visibleLinks = links.slice(0, VISIBLE_COUNT);
  const hiddenLinks = links.slice(VISIBLE_COUNT);

  return (
    <Card>
      <CardTitle icon="link" label={`Embedded Links (${links.length})`} engine="safebrowsing" />
      <Text style={styles.cardDesc}>
        Links found inside this page were scanned for threats. Dangerous links hiding on a page are a common sign the whole site may be unsafe.
      </Text>

      {anyMalicious && (
        <View style={styles.linkWarningBanner}>
          <MaterialIcons name="dangerous" size={15} color="#FF6B6B" />
          <Text style={styles.linkWarningText}>
            {maliciousCount} malicious link{maliciousCount > 1 ? 's' : ''} found — site flagged as dangerous!
          </Text>
        </View>
      )}

      {!anyMalicious && anySuspicious && (
        <View style={styles.linkSuspiciousBanner}>
          <MaterialIcons name="warning" size={15} color="#FFD60A" />
          <Text style={styles.linkSuspiciousText}>
            {suspiciousCount} suspicious link{suspiciousCount > 1 ? 's' : ''} found.
          </Text>
        </View>
      )}

      {visibleLinks.map((link, i) => {
        const vc = getVC(link.verdict);
        return (
          <View key={i} style={styles.embeddedLinkRow}>
            <MaterialIcons name={vc.icon} size={14} color={vc.color} style={{ flexShrink: 0 }} />
            <Text style={styles.embeddedLinkUrl} numberOfLines={1}>{link.url}</Text>
            <Badge verdict={link.verdict} />
          </View>
        );
      })}

      {hiddenLinks.length > 0 && (
        <EmbeddedLinksExpander links={hiddenLinks} />
      )}
    </Card>
  );
};

// Fact-Check Card (Premium only)
const FactCheckCard = ({ url }) => {
  const { account, token } = useAuth();
  const { setFactCheckResult, setFactCheckDuration } = useScan();
  const router = useRouter();
  const isPremium = account?.uaUserProfileId === PREMIUM_PROFILE_ID;

  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const startRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (loading) {
      startRef.current = Date.now();
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      if (startRef.current) {
        setFactCheckDuration(Math.floor((Date.now() - startRef.current) / 1000));
        startRef.current = null;
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [loading]);

  const handleFactCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/scanURL/fact-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      // Always read as text first — server may return HTML on unexpected errors
      const raw = await response.text();

      if (!response.ok) {
        if (response.status >= 500) throw new Error('unavailable');
        try {
          const data = JSON.parse(raw);
          throw new Error(data.error || `Server error (${response.status})`);
        } catch {
          throw new Error(`Server error (${response.status})`);
        }
      }

      let result;
      try {
        result = JSON.parse(raw);
      } catch {
        throw new Error('Received an unexpected response from the server. Please try again.');
      }

      setFactCheckResult(result);
      router.push('/factCheckResult');
    } catch (err) {
      const isServerError = err.message?.includes('Server error') || err.message?.includes('unavailable') || err.message?.toLowerCase().includes('application not found');
      setError(isServerError
        ? 'Fact check is currently unavailable. Please try again.'
        : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ── FREE USER: locked card ──
  if (!isPremium) {
    return (
      <>
        <View style={styles.lockedCardWrapper}>
          {/* Blurred placeholder */}
          <View pointerEvents="none" style={styles.lockedCardBlurred}>
            <View style={styles.card}>
              <CardTitle icon="fact-check" label="Fact-Check Content" />
              <View style={{ gap: 8, marginTop: 4 }}>
                {['Claim accuracy analysis', 'Misinformation detection', 'Source credibility check'].map((t, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons name="check-circle" size={14} color="#4AFF91" />
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Upgrade overlay */}
          <View style={styles.lockedCardOverlay}>
            <TouchableOpacity
              style={styles.premiumScanBtn}
              onPress={() => setShowModal(true)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="fact-check" size={18} color="#FFD60A" />
              <Text style={styles.premiumScanBtnText}>Fact-check this website</Text>
              <View style={styles.premiumBadge}>
                <MaterialIcons name="lock" size={11} color="#fff" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Modal transparent animationType="fade" visible={showModal} onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <MaterialIcons name="workspace-premium" size={36} color="#f0a500" style={{ marginBottom: 12 }} />
              <Text style={styles.modalTitle}>Premium Feature</Text>
              <Text style={styles.modalMessage}>
                Fact-check uses AI to analyse the page content for misinformation, false claims, and credibility signals. Upgrade to unlock.
              </Text>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={() => { setShowModal(false); Linking.openURL('https://scure.up.railway.app/upgrade'); }}
              >
                <Text style={styles.modalBtnPrimaryText}>Yes, upgrade now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnSecondaryText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // ── PREMIUM USER: active button ──
  return (
    <View style={styles.card}>
      <CardTitle icon="fact-check" label="Content Fact-Check" />
      <Text style={styles.factCheckDescription}>
        Use AI to analyse this page's content for misinformation, false claims, and credibility signals.
      </Text>
      {error ? (
        <Text style={styles.factCheckError}>{error}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.factCheckBtn, loading && { opacity: 0.6 }]}
        onPress={handleFactCheck}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color="#000" />
            <Text style={styles.factCheckBtnText}>Fact-checking · {elapsed}s</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="fact-check" size={18} color="#000" />
            <Text style={styles.factCheckBtnText}>Fact-check this website</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function ScanResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { scanResult: result, scanDuration } = useScan();
  const [openUrlModal, setOpenUrlModal] = useState(false);

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>No scan result found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vc = getVC(result.overallVerdict);
  const u = result.urlscan;

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
          <Text style={styles.heroMeta}>
            Risk Score: <Text style={{ color: vc.color, fontWeight: '700' }}>{result.riskScore}</Text>
            {'  ·  '}
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>{result.scoreLabel}</Text>
          </Text>
          <Text style={styles.heroUrl} numberOfLines={3}>{result.url}</Text>
          <Text style={styles.heroSuggestion}>{result.suggestion}</Text>
          {result.suggestionSource && (
            result.suggestionSource === 'static'
              ? <View style={[styles.sourceBadge, styles.sourceBadgeUnavailable]}>
                  <Text style={styles.sourceBadgeText}>Static fallback</Text>
                </View>
              : <EngineBadge engine={result.suggestionSource} />
          )}
          {u?.categories?.length > 0 && (
            <View style={styles.tagsRow}>
              {u.categories.map((c, i) => <Tag key={i} label={c} color="#FFD60A" />)}
            </View>
          )}
          {u?.task?.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {u.task.tags.map((t, i) => <Tag key={i} label={t} />)}
            </View>
          )}
        </View>

        {/* ── Screenshot ── */}
        {u?.screenshot ? (
          <Card>
            <View style={styles.cardTitleRowWithBadge}>
              <CardTitle icon="image" label="Page Screenshot" />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <EngineBadge engine={u._source === 'virustotal' ? 'virustotal' : 'urlscan'} />
                {u._source === 'virustotal' && (
                  <View style={styles.sourceBadge}><Text style={styles.sourceBadgeText}>via Playwright</Text></View>
                )}
              </View>
            </View>
            <Text style={styles.cardDesc}>A snapshot of what this webpage looks like. If it looks unexpected or suspicious, that's a red flag.</Text>
            {u._source === 'virustotal' ? (
              <Image source={{ uri: u.screenshot }} style={styles.screenshot} resizeMode="cover" />
            ) : (
              <TouchableOpacity onPress={() => Linking.openURL(u.screenshot)} activeOpacity={0.85}>
                <Image source={{ uri: u.screenshot }} style={styles.screenshot} resizeMode="contain" />
                <View style={styles.screenshotHint}>
                  <MaterialIcons name="open-in-new" size={13} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.screenshotHintText}>Tap to open full screenshot</Text>
                </View>
              </TouchableOpacity>
            )}
          </Card>
        ) : null}

        {/* ── Security Risk Assessment ── */}
        <Card>
          <CardTitle icon="security" label="Security Risk Assessment" />
          <Text style={styles.cardDesc}>This link was checked against three independent security engines. Even one flag is worth taking seriously.</Text>
          <ScannerRow
            name={u?._source === 'virustotal' ? 'URLScan.io (via VirusTotal)' : 'URLScan.io'}
            verdict={u?.verdict}
            detail={u?.score != null ? `Score: ${u.score}` : null}
            engine="urlscan" />
          <ScannerRow name="VirusTotal" verdict={result.virustotal?.verdict}
            detail={result.virustotal
              ? `${result.virustotal.malicious} malicious · ${result.virustotal.suspicious} suspicious · ${result.virustotal.clean}/${result.virustotal.total} clean`
              : null}
            engine="virustotal" />
          <ScannerRow name="Safe Browsing" verdict={result.safebrowsing?.verdict} engine="safebrowsing" />
          {u?.brands?.length > 0 && (
            <Row label="Brand Impersonation" value={u.brands.map((b) => b.name).join(', ')} valueColor="#FF6B6B" />
          )}
          {(u?._source === 'virustotal' || result.scriptAnalysis?._source === 'groq' || result.scriptAnalysis?._source === 'none') && (
            <View style={styles.partialWarning}>
              <MaterialIcons name="info-outline" size={13} color="#FFD60A" />
              <Text style={styles.partialWarningText}>
                Some checks used fallback sources or were unavailable. Results may be less detailed than usual.
              </Text>
            </View>
          )}
        </Card>

        {/* ── AI Script Analysis ── */}
        {result.scriptAnalysis && (
          <Card>
            <View style={styles.cardTitleRowWithBadge}>
              <CardTitle icon="smart-toy" label="AI Script Analysis" />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <EngineBadge engine={result.scriptAnalysis._source} />
                {result.scriptAnalysis._source === 'none' && (
                  <View style={[styles.sourceBadge, styles.sourceBadgeUnavailable]}><Text style={styles.sourceBadgeText}>Unavailable</Text></View>
                )}
              </View>
            </View>
            <Text style={styles.cardDesc}>Our AI reviewed the code running on this page to check if anything is happening in the background without your knowledge.</Text>
            <Row label="Verdict"    value={result.scriptAnalysis.verdict} valueColor={getVC(result.scriptAnalysis.verdict).color} />
            <Row label="Risk Score" value={result.scriptAnalysis.riskScore} />
            <Row label="Reason"     value={result.scriptAnalysis.reason} />
          </Card>
        )}

        {/* ── Website Content ── */}
        {u?.page && (
          <Card>
            <CardTitle icon="web" label="Website Content" engine="urlscan" />
            <Text style={styles.cardDesc}>Basic details about what this page actually loaded, including where it ended up if it redirected you along the way.</Text>
            <Row label="Title"       value={u.page.title} />
            <Row label="Final URL"   value={u.page.url} mono />
            <Row label="Domain"      value={u.page.domain} mono />
            <Row label="Apex Domain" value={u.page.apexDomain} />
            <Row label="Status"      value={u.page.status} />
            <Row label="MIME Type"   value={u.page.mimeType} />
            <Row label="Protocol"    value={u.httpProtocol} />
            <Row label="Server"      value={u.page.server} />
            <Row label="Redirected"  value={u.page.redirected} />
          </Card>
        )}

        {/* ── Embedded Links ── */}
        <EmbeddedLinksCard links={result.embeddedLinks} />

        {/* ── Fact-Check (Premium) ── */}
        <FactCheckCard url={result.url} />

        {/* ── Ad Intensive Detection ── */}
        <AdAnalysisCard adAnalysis={result.adAnalysis} />

        {/* ── Network Information ── */}
        {u?.network && (
          <Card>
            <CardTitle icon="hub" label="Network Information" engine="urlscan" />
            <Text style={styles.cardDesc}>Shows where this website's server is physically located. Servers in high-risk countries or behind anonymous networks can be a warning sign.</Text>
            <Row label="IP"       value={u.network.ip}      mono />
            <Row label="ASN"      value={u.network.asn} />
            <Row label="ASN Name" value={u.network.asnName} />
            <Row label="City"     value={u.network.city} />
            <Row label="Country"  value={u.network.country} />
            <Row label="PTR"      value={u.network.ptr}     mono />
            <ExpandableRow label="All IPs"           values={u.lists?.ips}                  mono />
            <ExpandableRow label="Countries"         values={u.lists?.countries} />
            <ExpandableRow label="Domains contacted" values={u.lists?.domains?.slice(0, 20)} mono />
          </Card>
        )}

        {/* ── Domain / DNS ── */}
        {u?.task && (
          <Card>
            <CardTitle icon="dns" label="Domain / DNS Details" engine="urlscan" />
            <Text style={styles.cardDesc}>Technical details about the website's address. Newly registered or recently changed domains are sometimes used for scams.</Text>
            <Row label="Apex Domain" value={u.page?.apexDomain} mono />
            <Row label="Scan Time"   value={u.task.time} />
            <Row label="Method"      value={u.task.method} />
            <Row label="Visibility"  value={u.task.visibility} />
            <Row label="Scan UUID"   value={u.uuid} mono />
          </Card>
        )}

        {/* ── SSL / TLS ── */}
        {u?.ssl && (
          <Card>
            <CardTitle icon="lock" label="SSL / TLS Certificate" engine="urlscan" />
            <Text style={styles.cardDesc}>A valid certificate means your connection to the site is encrypted. An expired, missing, or untrusted certificate is a warning sign.</Text>
            <Row label="Issuer"      value={u.ssl.issuer} />
            <Row label="Valid From"  value={u.ssl.validFrom} />
            <Row label="Valid Days"  value={u.ssl.validDays} />
            <Row label="Age (days)"  value={u.ssl.ageDays} />
          </Card>
        )}

        {/* ── Technologies ── */}
        {u?.technologies?.length > 0 && (
          <CollapsibleCard
            icon="memory"
            label="Technologies Detected"
            badge={`${u.technologies.length}`}
            description="The tools and software this website uses to run. Some technologies can track your activity or affect your privacy."
            engine="urlscan"
          >
            {u.technologies.map((tech, i) => (
              <View key={i} style={styles.techRow}>
                <Text style={styles.techName}>{tech.name}</Text>
                {tech.categories?.length > 0 && (
                  <Text style={styles.techCategory}>
                    {tech.categories
                      .map((c) => (typeof c === 'string' ? c : c?.name ?? ''))
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                )}
                {tech.confidence != null && (
                  <Text style={styles.techConfidence}>{tech.confidence}% confidence</Text>
                )}
              </View>
            ))}
          </CollapsibleCard>
        )}

        {/* ── HTTP Headers ── */}
        {u?.httpHeaders?.length > 0 && (
          <CollapsibleCard
            icon="code"
            label="HTTP Headers"
            badge={`${u.httpHeaders.length}`}
            description="Behind-the-scenes instructions sent by the website's server. Missing security headers can leave users more exposed to attacks."
            engine="urlscan"
          >
            {u.httpHeaders.map((h, i) => (
              <Row key={i} label={h.key} value={h.value} mono />
            ))}
          </CollapsibleCard>
        )}

        {/* ── DOM / Content Analysis ── */}
        {(u?.content?.cookies?.length > 0 || u?.content?.globals?.length > 0) && (
          <CollapsibleCard icon="article" label="DOM / Content Analysis" description="A look at what this website stored on your device, including cookies (small tracking files) and scripts running in the background." engine="urlscan">
            {u.content.cookies?.length > 0 && (
              <>
                <Text style={styles.subLabel}>Cookies ({u.content.cookies.length})</Text>
                {u.content.cookies.map((c, i) => (
                  <View key={i} style={styles.cookieRow}>
                    <Text style={styles.cookieName} numberOfLines={1}>{c.name}</Text>
                    <View style={styles.cookieBadges}>
                      {c.secure   && <Tag label="Secure"   color="#4AFF91" />}
                      {c.httpOnly && <Tag label="HttpOnly" color="#4AFF91" />}
                      {c.sameSite && <Tag label={c.sameSite} />}
                    </View>
                  </View>
                ))}
              </>
            )}
            {u.content.globals?.length > 0 && (
              <>
                <Text style={[styles.subLabel, { marginTop: 10 }]}>JS Globals ({u.content.globals.length})</Text>
                {u.content.globals.map((g, i) => (
                  <Row key={i} label={g.name} value={g.type} mono />
                ))}
              </>
            )}
          </CollapsibleCard>
        )}

      </ScrollView>

      {/* ── Floating bottom bar ── */}
      <View style={[styles.floatingBar, {paddingBottom: insets.bottom + 15}]}>
        {scanDuration != null && (
          <Text style={styles.floatingBarDuration}>Analyzed in {formatDuration(scanDuration)}</Text>
        )}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
            <MaterialIcons name="replay" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Scan Another</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => setOpenUrlModal(true)}
          >
            <MaterialIcons name="open-in-browser" size={20} color="#000" />
            <Text style={[styles.actionBtnText, { color: '#000' }]}>Open URL</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Open URL confirmation modal ── */}
      <Modal transparent animationType="fade" visible={openUrlModal} onRequestClose={() => setOpenUrlModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <MaterialIcons
              name={result.overallVerdict === 'malicious' ? 'dangerous' : result.overallVerdict === 'suspicious' ? 'warning' : 'open-in-browser'}
              size={36}
              color={result.overallVerdict === 'malicious' ? '#FF6B6B' : result.overallVerdict === 'suspicious' ? '#FFD60A' : '#4AFF91'}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.modalTitle}>Open this URL?</Text>
            <Text style={styles.modalMessage}>
              {result.overallVerdict === 'malicious'
                ? 'This URL was flagged as dangerous. Visiting it may put your device or personal information at risk.'
                : result.overallVerdict === 'suspicious'
                ? 'This URL looks suspicious. Proceed with caution.'
                : 'This URL appears safe to visit.'}
            </Text>
            <Text style={styles.modalUrl} numberOfLines={3}>{result.url}</Text>
            <TouchableOpacity
              style={[styles.modalBtnPrimary, result.overallVerdict === 'malicious' && styles.modalBtnDanger]}
              onPress={() => { setOpenUrlModal(false); Linking.openURL(result.url); }}
            >
              <Text style={styles.modalBtnPrimaryText}>Yes, open URL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setOpenUrlModal(false)}>
              <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 130, gap: 12 },

  hero: { borderRadius: 20, borderWidth: 1.5, padding: 24, alignItems: 'center', gap: 8 },
  heroVerdict: { fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  heroMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  heroUrl: { color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'center', marginTop: 4, fontFamily: 'monospace' },
  heroSuggestion: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, justifyContent: 'center' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 10,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  cardTitleRowWithBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sourceBadge: {
    backgroundColor: 'rgba(255,214,10,0.15)', borderRadius: 50, borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.4)', paddingHorizontal: 8, paddingVertical: 2,
  },
  sourceBadgeUnavailable: {
    backgroundColor: 'rgba(255,107,107,0.12)', borderColor: 'rgba(255,107,107,0.35)',
  },
  sourceBadgeText: { color: '#FFD60A', fontSize: 10, fontWeight: '700' },
  partialWarning: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8,
    backgroundColor: 'rgba(255,214,10,0.08)', borderRadius: 8,
    padding: 10, borderWidth: 1, borderColor: 'rgba(255,214,10,0.2)',
  },
  partialWarningText: { color: 'rgba(255,214,10,0.8)', fontSize: 11, lineHeight: 16, flex: 1 },
  cardTitleText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },

  collapsibleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collapsibleBadge: {
    color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 7,
    paddingVertical: 2, borderRadius: 50, marginLeft: 6,
  },
  collapsibleContent: { gap: 10, marginTop: 4 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  rowLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, flex: 1 },
  rowValue: { color: '#fff', fontSize: 12, fontWeight: '500', flex: 2, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 11 },

  expandBtn: { marginTop: 4 },
  expandBtnText: { color: '#FFD60A', fontSize: 12, fontWeight: '600' },

  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 50, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  tag: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 50, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },

  scannerRow: { gap: 3 },
  scannerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scannerName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  scannerDetail: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  screenshot: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, marginTop: 4 },
  screenshotHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  screenshotHintText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  techRow: { gap: 2, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  techName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  techCategory: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  techConfidence: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },

  subLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  cookieRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cookieName: { color: '#fff', fontSize: 12, fontFamily: 'monospace', flex: 1 },
  cookieBadges: { flexDirection: 'row', gap: 4 },
  linkText: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace' },

  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  actionBtnPrimary: { backgroundColor: '#fff', borderColor: '#fff' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a', gap: 16 },
  errorText: { color: '#FF6B6B', fontSize: 16 },
  backButton: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  backButtonText: { color: '#fff', fontWeight: '600' },

  linkWarningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,107,107,0.12)', borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)',
  },
  linkWarningText: { color: '#FF6B6B', fontSize: 12, fontWeight: '600', flex: 1 },
  linkSuspiciousBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,214,10,0.12)', borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: 'rgba(255,214,10,0.3)',
  },
  linkSuspiciousText: { color: '#FFD60A', fontSize: 12, fontWeight: '600', flex: 1 },
  embeddedLinkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  embeddedLinkUrl: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'monospace', flex: 1 },

  // ── Locked card (free user blurred preview) ──
  lockedCardWrapper: { position: 'relative', borderRadius: 16, overflow: 'hidden' },
  lockedCardBlurred: { opacity: 0.05 },
  lockedCardOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.55)', borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,214,10,0.25)', padding: 20,
  },

  premiumScanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,214,10,0.1)', borderRadius: 14,
    padding: 16, borderWidth: 1.5, borderColor: 'rgba(255,214,10,0.4)', width: '100%',
  },
  premiumScanBtnText: { color: '#FFD60A', fontSize: 15, fontWeight: '700', flex: 1 },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f0a500', borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3,
  },
  premiumBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // ── Fact-Check card (premium active) ──
  factCheckDescription: {
    color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 19,
  },
  factCheckBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFD60A', borderRadius: 50,
    paddingVertical: 13, marginTop: 4,
  },
  factCheckBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  factCheckError: {
    color: '#FF6B6B', fontSize: 12, textAlign: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)', padding: 8, borderRadius: 8,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    backgroundColor: '#1A1A1A', borderRadius: 20,
    padding: 28, width: '80%', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalMessage: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 10 },
  modalBtnPrimary: {
    backgroundColor: '#FFD60A', borderRadius: 50,
    paddingVertical: 13, paddingHorizontal: 24,
    width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalBtnPrimaryText: { color: '#000', fontWeight: '700', fontSize: 15 },
  modalBtnSecondary: { paddingVertical: 10 },
  modalBtnSecondaryText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

  // ── Ad Analysis Card ──
  adWarningCard: {
    borderColor: 'rgba(255,165,0,0.4)',
    backgroundColor: 'rgba(255,165,0,0.05)',
  },
  adCleanCard: {
    borderColor: 'rgba(74,255,145,0.3)',
    backgroundColor: 'rgba(74,255,145,0.04)',
  },
  adCleanText: {
    color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 20,
  },
  adSlideshow: {
    borderRadius: 10, overflow: 'hidden', backgroundColor: '#111',
  },
  adScreenshot: {
    width: '100%', aspectRatio: 12 / 7, backgroundColor: '#111',
  },
  adSlideCaption: {
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 5, paddingHorizontal: 12,
    alignItems: 'center',
  },
  adSlideLabelText: {
    color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600',
  },
  adSlideDots: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    paddingVertical: 8,
  },
  adDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  adDotActive: {
    backgroundColor: '#FFA500',
  },
  adNetworksLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6,
  },
  adNetworksRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
  },
  adNetworkChip: {
    backgroundColor: 'rgba(255,165,0,0.1)', borderRadius: 50,
    paddingVertical: 4, paddingHorizontal: 10,
    borderWidth: 1, borderColor: 'rgba(255,165,0,0.3)',
  },
  adNetworkChipText: {
    color: '#FFA500', fontSize: 11, fontWeight: '600',
  },
  adWarningText: {
    color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 20,
  },

  // ── Engine badges ──
  engineBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, borderWidth: 1,
  },
  engineBadgeText: {
    fontSize: 9, fontWeight: '800', letterSpacing: 0.5,
  },

  // ── Floating bottom bar ──
  floatingBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,10,0.97)',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  floatingBarDuration: {
    color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', fontWeight: '500',
  },

  // ── Open URL modal extras ──
  modalUrl: {
    color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'monospace',
    textAlign: 'center', marginBottom: 20, lineHeight: 17,
  },
  modalBtnDanger: {
    backgroundColor: '#FF6B6B',
  },
});