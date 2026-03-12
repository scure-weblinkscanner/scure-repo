import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useScan } from '../context/ScanContext';

const verdictConfig = {
  clean:      { color: '#4AFF91', bg: 'rgba(74,255,145,0.12)',  icon: 'check-circle', label: 'Safe'       },
  suspicious: { color: '#FFD60A', bg: 'rgba(255,214,10,0.12)',  icon: 'warning',      label: 'Suspicious' },
  malicious:  { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', icon: 'dangerous',    label: 'Dangerous'  },
  unknown:    { color: '#aaa',    bg: 'rgba(255,255,255,0.07)', icon: 'help',         label: 'Unknown'    },
};

const getVC = (verdict) => verdictConfig[verdict?.toLowerCase()] ?? verdictConfig.unknown;

// ── Regular card (always expanded) ──
const Card = ({ children }) => <View style={styles.card}>{children}</View>;

// ── Collapsible card — starts collapsed, tap title to expand/collapse ──
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
      <Text
        style={[styles.rowValue, mono && styles.mono, valueColor ? { color: valueColor } : null]}
        numberOfLines={0}
      >
        {displayValue}
      </Text>
    </View>
  );
};

// ── Row with expandable "..." for long lists ──
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

const ScannerRow = ({ name, verdict, detail }) => (
  <View style={styles.scannerRow}>
    <View style={styles.scannerTop}>
      <Text style={styles.scannerName}>{name}</Text>
      <Badge verdict={verdict} />
    </View>
    {detail ? <Text style={styles.scannerDetail}>{detail}</Text> : null}
  </View>
);

// ── Main Screen ──

export default function ScanResultScreen() {
  const router = useRouter();
  const { scanResult: result } = useScan();

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
    <View style={styles.wrapper}>
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

        {/* ── Security Risk Assessment ── */}
        <Card>
          <CardTitle icon="security" label="Security Risk Assessment" />
          <ScannerRow name="URLScan.io" verdict={u?.verdict}
            detail={u?.score != null ? `Score: ${u.score}` : null} />
          <ScannerRow name="VirusTotal" verdict={result.virustotal?.verdict}
            detail={result.virustotal
              ? `${result.virustotal.malicious} malicious · ${result.virustotal.suspicious} suspicious · ${result.virustotal.clean}/${result.virustotal.total} clean`
              : null} />
          <ScannerRow name="Safe Browsing" verdict={result.safebrowsing?.verdict} />
          {u?.brands?.length > 0 && (
            <Row label="Brand Impersonation" value={u.brands.map((b) => b.name).join(', ')} valueColor="#FF6B6B" />
          )}
        </Card>

        {/* ── AI Script Analysis ── */}
        {result.scriptAnalysis && (
          <Card>
            <CardTitle icon="smart-toy" label="AI Script Analysis" />
            <Row label="Verdict"    value={result.scriptAnalysis.verdict} valueColor={getVC(result.scriptAnalysis.verdict).color} />
            <Row label="Risk Score" value={result.scriptAnalysis.riskScore} />
            <Row label="Reason"     value={result.scriptAnalysis.reason} />
          </Card>
        )}

        {/* ── Website Content ── */}
        {u?.page && (
          <Card>
            <CardTitle icon="web" label="Website Content" />
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

        {/* ── Network Information — All IPs expandable ── */}
        {u?.network && (
          <Card>
            <CardTitle icon="hub" label="Network Information" />
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
            <CardTitle icon="dns" label="Domain / DNS Details" />
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
            <CardTitle icon="lock" label="SSL / TLS Certificate" />
            <Row label="Issuer"      value={u.ssl.issuer} />
            <Row label="Valid From"  value={u.ssl.validFrom} />
            <Row label="Valid Days"  value={u.ssl.validDays} />
            <Row label="Age (days)"  value={u.ssl.ageDays} />
          </Card>
        )}

        {/* ── Technologies — collapsible ── */}
        {u?.technologies?.length > 0 && (
          <CollapsibleCard
            icon="memory"
            label="Technologies Detected"
            badge={`${u.technologies.length}`}
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

        {/* ── HTTP Headers — collapsible ── */}
        {u?.httpHeaders?.length > 0 && (
          <CollapsibleCard
            icon="code"
            label="HTTP Headers"
            badge={`${u.httpHeaders.length}`}
          >
            {u.httpHeaders.map((h, i) => (
              <Row key={i} label={h.key} value={h.value} mono />
            ))}
          </CollapsibleCard>
        )}

        {/* ── DOM / Content Analysis — collapsible ── */}
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

        {/* ── Actions ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
            <MaterialIcons name="replay" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Scan Another</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => Linking.openURL(result.url)}
          >
            <MaterialIcons name="open-in-browser" size={20} color="#000" />
            <Text style={[styles.actionBtnText, { color: '#000' }]}>Open URL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 56, gap: 12 },

  // Hero
  hero: { borderRadius: 20, borderWidth: 1.5, padding: 24, alignItems: 'center', gap: 8 },
  heroVerdict: { fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  heroMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  heroUrl: { color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'center', marginTop: 4, fontFamily: 'monospace' },
  heroSuggestion: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, justifyContent: 'center' },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 10,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  cardTitleText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // Collapsible
  collapsibleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collapsibleBadge: {
    color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 7,
    paddingVertical: 2, borderRadius: 50, marginLeft: 6,
  },
  collapsibleContent: { gap: 10, marginTop: 4 },

  // Row
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  rowLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, flex: 1 },
  rowValue: { color: '#fff', fontSize: 12, fontWeight: '500', flex: 2, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 11 },

  // Expandable row
  expandBtn: { marginTop: 4 },
  expandBtnText: { color: '#FFD60A', fontSize: 12, fontWeight: '600' },

  // Badge
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 50, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  // Tag
  tag: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 50, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },

  // Scanner
  scannerRow: { gap: 3 },
  scannerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scannerName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  scannerDetail: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  // Screenshot
  screenshot: { width: '100%', height: 190, borderRadius: 10, marginTop: 4 },
  screenshotHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  screenshotHintText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  // Technologies
  techRow: { gap: 2, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  techName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  techCategory: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  techConfidence: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },

  // DOM
  subLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  cookieRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cookieName: { color: '#fff', fontSize: 12, fontFamily: 'monospace', flex: 1 },
  cookieBadges: { flexDirection: 'row', gap: 4 },
  linkText: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace' },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  actionBtnPrimary: { backgroundColor: '#fff', borderColor: '#fff' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Error
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a', gap: 16 },
  errorText: { color: '#FF6B6B', fontSize: 16 },
  backButton: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  backButtonText: { color: '#fff', fontWeight: '600' },
});