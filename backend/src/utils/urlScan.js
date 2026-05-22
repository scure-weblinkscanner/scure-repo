import axios from 'axios';
import { takeScreenshot } from './playwright.js';

const fallbackURLScan = async (url) => {
  const id = Buffer.from(url).toString('base64url');
  const res = await fetch(`https://www.virustotal.com/api/v3/urls/${id}`, {
    headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
  });
  if (!res.ok) return { verdict: 'unknown', score: 0, categories: [], screenshot: null, uuid: null };
  const data = await res.json();
  const stats = data.data?.attributes?.last_analysis_stats ?? {};
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const malicious = stats.malicious ?? 0;
  const suspicious = stats.suspicious ?? 0;
  const verdict = malicious > 0 ? 'malicious' : suspicious > 0 ? 'suspicious' : total > 0 ? 'clean' : 'unknown';
  const score = total > 0 ? Math.round((malicious / total) * 100) : 0;
  const categories = Object.values(data.data?.attributes?.categories ?? {});
  const screenshot = await takeScreenshot(url).catch(() => null);
  return { verdict, score, categories, screenshot, uuid: data.data?.id ?? null, _source: 'virustotal' };
};

export const scanWithURLScan = async (url) => {
  try {
    const submitRes = await axios.post(
      'https://urlscan.io/api/v1/scan/',
      { url, visibility: 'public', country: 'us' },
      {
        headers: {
          'Content-Type': 'application/json',
          'API-Key': process.env.URLSCAN_API_KEY,
        },
      }
    );

    const uuid = submitRes.data.uuid;

    // Retry up to 5 times with 5 second intervals
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      try {
        const resultRes = await axios.get(`https://urlscan.io/api/v1/result/${uuid}/`);
        const d = resultRes.data;

        // ── Verdict ──
        // urlscan score: -100 (legit) to 100 (malicious)
        const urlscanScore = d.verdicts?.urlscan?.score ?? 0;
        const isMalicious = d.verdicts?.overall?.malicious ?? false;
        const verdict = isMalicious ? 'malicious'
          : urlscanScore >= 50 ? 'suspicious'
          : 'clean';

        // ── Page Info ──
        const page = {
          url:        d.page?.url        ?? null,
          title:      d.page?.title      ?? null,
          domain:     d.page?.domain     ?? null,
          apexDomain: d.page?.apexDomain ?? null,
          status:     d.page?.status     ?? null,
          mimeType:   d.page?.mimeType   ?? null,
          server:     d.page?.server     ?? null,
          redirected: d.page?.redirected ?? null,
        };

        // ── Network / IP Info ──
        const network = {
          ip:      d.page?.ip      ?? null,
          asn:     d.page?.asn     ?? null,
          asnName: d.page?.asnname ?? null,
          city:    d.page?.city    ?? null,
          country: d.page?.country ?? null,
          ptr:     d.page?.ptr     ?? null,
        };

        // ── TLS / SSL (from page fields — most reliable) ──
        const ssl = (d.page?.tlsIssuer || d.page?.tlsValidFrom) ? {
          issuer:     d.page?.tlsIssuer    ?? null,
          validFrom:  d.page?.tlsValidFrom ?? null,
          validDays:  d.page?.tlsValidDays ?? null,
          ageDays:    d.page?.tlsAgeDays   ?? null,
        } : null;

        // ── Technologies (Wappalyzer) ──
        // wappa.data entries: { app, categories: [{name}], confidence, website }
        const technologies = (d.meta?.processors?.wappa?.data ?? [])
          .map((t) => ({
            name: t.app ?? null,
            categories: (t.categories ?? [])
              .map((c) => {
                if (typeof c === 'string') return c;
                if (c && typeof c === 'object') return c.name ?? c.app ?? null;
                return null;
              })
              .filter((c) => c !== null),
            confidence: typeof t.confidence === 'number' ? t.confidence : null,
          }))
          .filter((t) => t.name);

        // ── Lists ──
        const lists = {
          ips:         d.lists?.ips         ?? [],
          countries:   d.lists?.countries   ?? [],
          asns:        d.lists?.asns         ?? [],
          domains:     d.lists?.domains      ?? [],
          servers:     d.lists?.servers      ?? [],
          urls:        (d.lists?.urls        ?? []).slice(0, 10),
          linkDomains: (d.lists?.linkDomains ?? []).slice(0, 10),
          hashes:      (d.lists?.hashes      ?? []).slice(0, 5),
        };

        // ── HTTP Headers (from first request) ──
        const firstResponse = d.data?.requests?.[0]?.response?.response ?? null;
        const httpHeaders = firstResponse?.headers
          ? Object.entries(firstResponse.headers).map(([key, value]) => ({ key, value }))
          : [];
        const httpProtocol = firstResponse?.protocol ?? null;

        // ── DOM / Content ──
        const cookies = (d.data?.cookies ?? []).slice(0, 10).map((c) => ({
          name:     c.name     ?? null,
          domain:   c.domain   ?? null,
          secure:   c.secure   ?? false,
          httpOnly: c.httpOnly ?? false,
          sameSite: c.sameSite ?? null,
        }));

        const links = (d.data?.links ?? []).slice(0, 10).map((l) => ({
          href: l.href ?? null,
          text: l.text ?? null,
        }));

        const consoleLogs = (d.data?.console ?? []).slice(0, 5).map((c) => ({
          level: c.message?.level ?? null,
          text:  c.message?.text  ?? null,
        }));

        const globals = (d.data?.globals ?? []).slice(0, 10).map((g) => ({
          name: g.prop ?? null,
          type: g.type ?? null,
        }));

        // ── Verdicts / Security ──
        const urlscanVerdict = d.verdicts?.urlscan ?? {};
        const categories  = urlscanVerdict.categories  ?? [];
        const brands      = (urlscanVerdict.brands ?? []).map((b) => ({
          name:     b.name     ?? null,
          country:  b.country  ?? [],
          vertical: b.vertical ?? [],
        }));

        // ── Task Info ──
        const task = {
          time:       d.task?.time       ?? null,
          method:     d.task?.method     ?? null,
          visibility: d.task?.visibility ?? null,
          tags:       d.task?.tags       ?? [],
        };

        return {
          verdict,
          score:      urlscanScore,
          screenshot: d.task?.screenshotURL ?? null,
          uuid,
          categories,
          brands,
          task,
          page,
          network,
          ssl,
          technologies,
          lists,
          httpHeaders,
          httpProtocol,
          content: { cookies, links, consoleLogs, globals },
          _source: 'urlscan',
        };
      } catch (pollErr) {
        const status = pollErr.response?.status;
        const msg = pollErr.response?.data?.message || pollErr.message;
        console.warn(`URLScan poll ${i + 1}/5 [${status ?? 'no-status'}]: ${msg}`);
        continue;
      }
    }
    return { verdict: 'unknown', reason: 'URLScan timed out' };
  } catch (error) {
    console.warn('URLScan failed, trying VirusTotal fallback:', error.response?.data?.message || error.message);
    return fallbackURLScan(url).catch(() => ({
      verdict: 'unknown', score: 0, categories: [], screenshot: null, uuid: null,
    }));
  }
};