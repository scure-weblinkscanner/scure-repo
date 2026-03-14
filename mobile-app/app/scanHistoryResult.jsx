import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Linking, Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { publishScanHistory } from '../services/scanApi.service';

const verdictConfig = {
  clean:      { color: '#4AFF91', bg: 'rgba(74,255,145,0.12)',  icon: 'check-circle', label: 'Safe'       },
  suspicious: { color: '#FFD60A', bg: 'rgba(255,214,10,0.12)',  icon: 'warning',      label: 'Suspicious' },
  malicious:  { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', icon: 'dangerous',    label: 'Dangerous'  },
  unknown:    { color: '#aaa',    bg: 'rgba(255,255,255,0.07)', icon: 'help',         label: 'Unknown'    },
};

const getVc = (verdict) => verdictConfig[verdict?.toLowerCase()] ?? verdictConfig.unknown;

const Card = ({ children }) => <View style={styles.card}>{children}</View>;

const CollapsibleCard = ({ icon, label, children, badge }) => {
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
        </View>
        <MaterialIcons
          name={open ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>
      {open && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
};

const CardTitle = ({ icon, label }) => (
  <View style={styles.cardTitleRow}>
    <MaterialIcons name={icon} size={15} color="rgba(255,255,255,0.4)" />
    <Text style={styles.cardTitleText}>{label}</Text>
  </View>
);

const Row = ({ label, value, valueColor, mono }) => {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono, valueColor ? { color: valueColor } : null]} numberOfLines={0}>
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
  const vc = getVc(verdict);
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

const ScannerRow = ({ name, verdict, detail }) => (
  <View style={styles.scannerRow}>
    <View style={styles.scannerTop}>
      <Text style={styles.scannerName}>{name}</Text>
      <Badge verdict={verdict} />
    </View>
    {detail ? <Text style={styles.scannerDetail}>{detail}</Text> : null}
  </View>
);

export default function ScanHistoryResultScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { item: itemParam } = useLocalSearchParams();
  const item = JSON.parse(itemParam);

  const [isPublished, setIsPublished] = useState(item.shScanVisibility === 'public');
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishError, setPublishError] = useState('');

  const vc = getVc(item.shVerdict);
  const u = item.shUrlscan;

    const handlePublish = () => {
    if (isPublished) return;
    setPublishError('');
    setShowPublishModal(true);
    };

    const confirmPublish = async () => {
    try {
        setPublishing(true);
        await publishScanHistory(item.shId, token);
        setIsPublished(true);
        setShowPublishModal(false);
    } catch (err) {
        setPublishError(err.message);
    } finally {
        setPublishing(false);
    }
    };

  return (
    <View style={styles.wrapper}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { borderColor: vc.color, backgroundColor: vc.bg }]}>
          <MaterialIcons name={vc.icon} size={52} color={vc.color} />
          <Text style={[styles.heroVerdict, { color: vc.color }]}>{vc.label}</Text>
          <Text style={styles.heroMeta}>
            Risk Score: <Text style={{ color: vc.color, fontWeight: '700' }}>{item.shRiskScore}</Text>
            {'  ·  '}
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>{item.shScoreLabel}</Text>
          </Text>
          <Text style={styles.heroUrl} numberOfLines={3}>{item.shUrl}</Text>
          <Text style={styles.heroSuggestion}>{item.shSuggestion}</Text>
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

        {/* Screenshot */}
        {u?.screenshot ? (
          <Card>
            <CardTitle icon="image" label="Page Screenshot" />
            <TouchableOpacity onPress={() => Linking.openURL(u.screenshot)} activeOpacity={0.85}>
              <Image source={{ uri: u.screenshot }} style={styles.screenshot} resizeMode="cover" />
              <View style={styles.screenshotHint}>
                <MaterialIcons name="open-in-new" size={13} color="rgba(255,255,255,0.4)" />
                <Text style={styles.screenshotHintText}>Tap to open full screenshot</Text>
              </View>
            </TouchableOpacity>
          </Card>
        ) : null}

        {/* Security Risk Assessment */}
        <Card>
          <CardTitle icon="security" label="Security Risk Assessment" />
          <ScannerRow name="URLScan.io" verdict={u?.verdict}
            detail={u?.score != null ? `Score: ${u.score}` : null} />
          <ScannerRow name="VirusTotal" verdict={item.shVirustotal?.verdict}
            detail={item.shVirustotal
              ? `${item.shVirustotal.malicious} malicious · ${item.shVirustotal.suspicious} suspicious · ${item.shVirustotal.clean}/${item.shVirustotal.total} clean`
              : null} />
          <ScannerRow name="Safe Browsing" verdict={item.shSafebrowsing?.verdict} />
          {u?.brands?.length > 0 && (
            <Row label="Brand Impersonation" value={u.brands.map((b) => b.name).join(', ')} valueColor="#FF6B6B" />
          )}
        </Card>

        {/* AI Script Analysis */}
        {item.shScriptAnalysis && (
          <Card>
            <CardTitle icon="smart-toy" label="AI Script Analysis" />
            <Row label="Verdict"    value={item.shScriptAnalysis.verdict} valueColor={getVc(item.shScriptAnalysis.verdict).color} />
            <Row label="Risk Score" value={item.shScriptAnalysis.riskScore} />
            <Row label="Reason"     value={item.shScriptAnalysis.reason} />
          </Card>
        )}

        {/* Website Content */}
        {u?.page && (
          <Card>
            <CardTitle icon="web" label="Website Content" />
            <Row label="Title"       value={u.page.title} />
            <Row label="Final URL"   value={u.page.url}         mono />
            <Row label="Domain"      value={u.page.domain}      mono />
            <Row label="Apex Domain" value={u.page.apexDomain} />
            <Row label="Status"      value={u.page.status} />
            <Row label="MIME Type"   value={u.page.mimeType} />
            <Row label="Protocol"    value={u.httpProtocol} />
            <Row label="Server"      value={u.page.server} />
            <Row label="Redirected"  value={u.page.redirected} />
          </Card>
        )}

        {/* Network Information */}
        {u?.network && (
          <Card>
            <CardTitle icon="hub" label="Network Information" />
            <Row label="IP"       value={u.network.ip}      mono />
            <Row label="ASN"      value={u.network.asn} />
            <Row label="ASN Name" value={u.network.asnName} />
            <Row label="City"     value={u.network.city} />
            <Row label="Country"  value={u.network.country} />
            <Row label="PTR"      value={u.network.ptr}     mono />
            <ExpandableRow label="All IPs"           values={u.lists?.ips}                   mono />
            <ExpandableRow label="Countries"         values={u.lists?.countries} />
            <ExpandableRow label="Domains contacted" values={u.lists?.domains?.slice(0, 20)} mono />
          </Card>
        )}

        {/* Domain / DNS */}
        {u?.task && (
          <Card>
            <CardTitle icon="dns" label="Domain / DNS Details" />
            <Row label="Apex Domain" value={u.page?.apexDomain} mono />
            <Row label="Scan Time"   value={u.task.time} />
            <Row label="Method"      value={u.task.method} />
            <Row label="Visibility"  value={u.task.visibility} />
            <Row label="Scan UUID"   value={u.uuid}            mono />
          </Card>
        )}

        {/* SSL / TLS */}
        {u?.ssl && (
          <Card>
            <CardTitle icon="lock" label="SSL / TLS Certificate" />
            <Row label="Issuer"      value={u.ssl.issuer} />
            <Row label="Valid From"  value={u.ssl.validFrom} />
            <Row label="Valid Days"  value={u.ssl.validDays} />
            <Row label="Age (days)"  value={u.ssl.ageDays} />
          </Card>
        )}

        {/* Technologies */}
        {u?.technologies?.length > 0 && (
          <CollapsibleCard icon="memory" label="Technologies Detected" badge={`${u.technologies.length}`}>
            {u.technologies.map((tech, i) => (
              <View key={i} style={styles.techRow}>
                <Text style={styles.techName}>{tech.name}</Text>
                {tech.categories?.length > 0 && (
                  <Text style={styles.techCategory}>
                    {tech.categories.map((c) => (typeof c === 'string' ? c : c?.name ?? '')).filter(Boolean).join(', ')}
                  </Text>
                )}
                {tech.confidence != null && (
                  <Text style={styles.techConfidence}>{tech.confidence}% confidence</Text>
                )}
              </View>
            ))}
          </CollapsibleCard>
        )}

        {/* HTTP Headers */}
        {u?.httpHeaders?.length > 0 && (
          <CollapsibleCard icon="code" label="HTTP Headers" badge={`${u.httpHeaders.length}`}>
            {u.httpHeaders.map((h, i) => (
              <Row key={i} label={h.key} value={h.value} mono />
            ))}
          </CollapsibleCard>
        )}

        {/* DOM / Content Analysis */}
        {(u?.content?.cookies?.length > 0 || u?.content?.links?.length > 0 || u?.content?.globals?.length > 0) && (
          <CollapsibleCard icon="article" label="DOM / Content Analysis">
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
            {u.content.links?.length > 0 && (
              <>
                <Text style={[styles.subLabel, { marginTop: 10 }]}>Outbound Links ({u.content.links.length})</Text>
                {u.content.links.map((l, i) => (
                  <Text key={i} style={styles.linkText} numberOfLines={1}>{l.href}</Text>
                ))}
              </>
            )}
          </CollapsibleCard>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Publish button — fixed at bottom, excluded from scroll */}
      <View style={styles.publishBar}>
        <TouchableOpacity
          style={[styles.publishBtn, isPublished && styles.publishBtnDone]}
          onPress={handlePublish}
          disabled={isPublished || publishing}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={isPublished ? 'public' : 'upload'}
            size={18}
            color={isPublished ? '#4AFF91' : '#000'}
          />
          <Text style={[styles.publishBtnText, isPublished && { color: '#4AFF91' }]}>
            {publishing ? 'Publishing...' : isPublished ? 'Published' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>

    {/* Publish Confirm Modal */}
    <Modal
    transparent
    animationType="fade"
    visible={showPublishModal}
    onRequestClose={() => setShowPublishModal(false)}
    >
    <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
        <View style={styles.modalIconCircle}>
            <MaterialIcons name="public" size={28} color="#fff" />
        </View>
        <Text style={styles.modalTitle}>Publish this scan?</Text>
        <Text style={styles.modalMessage}>
            This scan result will be visible to all premium users in the Public Scans feed.
        </Text>
        <View style={styles.modalUrlBox}>
            <MaterialIcons name="link" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.modalUrl} numberOfLines={2}>{item.shUrl}</Text>
        </View>
        {publishError ? (
            <View style={styles.modalError}>
            <MaterialIcons name="error-outline" size={14} color="#FF6B6B" />
            <Text style={styles.modalErrorText}>{publishError}</Text>
            </View>
        ) : null}
        <TouchableOpacity
            style={styles.modalBtnPrimary}
            onPress={confirmPublish}
            disabled={publishing}
            activeOpacity={0.85}
        >
            <MaterialIcons name="public" size={18} color="#000" />
            <Text style={styles.modalBtnPrimaryText}>
            {publishing ? 'Publishing...' : 'Yes, publish it'}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.modalBtnSecondary}
            onPress={() => setShowPublishModal(false)}
            disabled={publishing}
        >
            <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
        </TouchableOpacity>
        </View>
    </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 72, paddingBottom: 24, gap: 12 },

  backBtn: {
    position: 'absolute', top: 52, left: 16, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 50,
    padding: 8,
  },

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
  cardTitleText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

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

  screenshot: { width: '100%', height: 190, borderRadius: 10, marginTop: 4 },
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

  publishBar: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0a0a0a',
  },
  publishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 50,
    paddingVertical: 14,
  },
  publishBtnDone: {
    backgroundColor: 'rgba(74,255,145,0.1)',
    borderWidth: 1, borderColor: 'rgba(74,255,145,0.3)',
  },
  publishBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },

    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    },
    modalBox: {
    backgroundColor: '#141414',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
    },
    modalIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    },
    modalTitle: {
    color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center',
    },
    modalMessage: {
    color: 'rgba(255,255,255,0.5)', fontSize: 13,
    textAlign: 'center', lineHeight: 20,
    },
    modalUrlBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10, padding: 12, width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    modalUrl: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11,
    fontFamily: 'monospace', flex: 1,
    },
    modalError: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: 8, padding: 10, width: '100%',
    },
    modalErrorText: { color: '#FF6B6B', fontSize: 12, flex: 1 },
    modalBtnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 50,
    paddingVertical: 14, width: '100%', marginTop: 4,
    },
    modalBtnPrimaryText: { color: '#000', fontWeight: '700', fontSize: 15 },
    modalBtnSecondary: {
    paddingVertical: 10,
    },
    modalBtnSecondaryText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
});