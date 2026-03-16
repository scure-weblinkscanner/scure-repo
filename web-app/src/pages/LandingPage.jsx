import { useState } from 'react'
import PublicNavbar from '../components/PublicNavbar'
import backgroundWebsite from '../assets/background-website.jpg'

const features = [
  {
    icon: '🔍',
    title: 'Multi-Engine Scanning',
    description: 'Every URL is analyzed by VirusTotal, URLScan.io, Google Safe Browsing, and our AI engine simultaneously.',
  },
  {
    icon: '🤖',
    title: 'AI Script Analysis',
    description: 'Gemini AI inspects embedded scripts and JavaScript for hidden malicious behavior invisible to traditional scanners.',
  },
  {
    icon: '📷',
    title: 'Camera URL Detection',
    description: 'Point your camera at any screen or surface — Scure extracts and scans URLs in real time using on-device OCR.',
  },
  {
    icon: '🔲',
    title: 'QR Code Scanner',
    description: 'Scan or upload QR codes to reveal and analyze the hidden URLs before you visit them.',
  },
  {
    icon: '📋',
    title: 'Paste & Scan',
    description: 'Quickly paste any link and get a full security report in seconds.',
  },
  {
    icon: '📜',
    title: 'Scan History',
    description: 'Every scan is saved to your personal history with full details, verdicts, and risk scores.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      { label: 'Scan URL via Camera', included: true },
      { label: 'Paste URL Scan', included: true },
      { label: 'QR Code Scanning', included: true },
      { label: 'Upload QR from Gallery', included: true },
      { label: 'Scan History', included: true },
      { label: 'View Public Scans', included: false },
      { label: 'Unlimited Scans', included: false },
      { label: 'Ad Intensive Mode Feature', included: false },
    ],
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: 'per month',
    highlight: true,
    features: [
      { label: 'Scan URL via Camera', included: true },
      { label: 'Paste URL Scan', included: true },
      { label: 'QR Code Scanning', included: true },
      { label: 'Upload QR from Gallery', included: true },
      { label: 'Scan History', included: true },
      { label: 'View Public Scans', included: true },
      { label: 'Unlimited Scans', included: true },
      { label: 'Ad Intensive Mode Feature', included: true },
    ],
  },
]

const reviews = [
  {
    name: 'Ahmad R.',
    role: 'Cybersecurity Student',
    rating: 5,
    text: 'Scure caught a phishing link my antivirus completely missed. The AI analysis breakdown is genuinely impressive.',
  },
  {
    name: 'Priya M.',
    role: 'Small Business Owner',
    rating: 5,
    text: 'I scan every link before clicking now. The QR scanner saved me from a fake payment portal at a café.',
  },
  {
    name: 'Daniel K.',
    role: 'IT Administrator',
    rating: 4,
    text: "Running 4 engines in parallel is smart. The URLScan.io integration gives more context than most tools I've used.",
  },
  {
    name: 'Sarah L.',
    role: 'Freelance Designer',
    rating: 5,
    text: 'Super clean interface. I love that it saves my scan history — I can always go back and check old links.',
  },
  {
    name: 'Marcus T.',
    role: 'Software Developer',
    rating: 4,
    text: 'The camera OCR feature is surprisingly accurate. Solid tool for anyone who handles unknown links regularly.',
  },
  {
    name: 'Nurul H.',
    role: 'University Lecturer',
    rating: 5,
    text: 'I recommend Scure to all my students. Being able to verify links before sharing them in class is invaluable.',
  },
]

const tabs = ['App Features', 'Feature Comparison', 'Reviews']

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('App Features')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(5,5,15,0.78), rgba(5,5,15,0.78)), url(${backgroundWebsite})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <PublicNavbar />

      {/* Hero */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 24px 80px',
        textAlign: 'center',
      }}>
        {/* blue radial glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14,14,149,0.5) 0%, transparent 70%)',
        }} />

        {/* grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(14,14,149,0.3)',
            border: '1px solid rgba(14,14,149,0.6)',
            borderRadius: 999,
            padding: '6px 18px',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 24,
          }}>
            URL Security Scanner
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(42px, 7vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: '0 0 20px',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            We detect threats<br />before you do.
          </h1>

          <p style={{
            fontSize: 17,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7,
            maxWidth: 480,
            margin: '0 auto 40px',
          }}>
            Scure analyzes any URL across 4 security engines and AI in seconds — before it can harm you.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{
              background: '#0E0E95',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.target.style.background = '#1a1ab0'}
              onMouseLeave={e => e.target.style.background = '#0E0E95'}
            >
              Get Started Free
            </a>
            <a href="/login" style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Sign In
            </a>
          </div>
        </div>
      </div>

      {/* Pill Tab Navbar */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 48px' }}>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 999,
          padding: 5,
          gap: 4,
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? '#0E0E95' : 'transparent',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.45)',
                border: activeTab === tab ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                borderRadius: 999,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* App Features */}
        {activeTab === 'App Features' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, margin: '0 0 12px' }}>
                Everything You Need to Stay Safe
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
                Built for everyday users who encounter unknown links.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
            }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '28px 24px',
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(14,14,149,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                >
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Comparison */}
        {activeTab === 'Feature Comparison' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, margin: '0 0 12px' }}>
                Choose Your Plan
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
                Start free. Upgrade when you're ready.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              maxWidth: 700,
              margin: '0 auto',
            }}>
              {plans.map((plan, i) => (
                <div key={i} style={{
                  background: plan.highlight ? 'rgba(14,14,149,0.25)' : 'rgba(255,255,255,0.03)',
                  border: plan.highlight ? '1px solid rgba(14,14,149,0.7)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 24,
                  padding: '32px 28px',
                  position: 'relative',
                }}>
                  {plan.highlight && (
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#0E0E95',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 999,
                      padding: '4px 16px',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>{plan.name}</h3>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>{plan.period}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, flexShrink: 0,
                          background: f.included ? 'rgba(74,255,145,0.15)' : 'rgba(255,255,255,0.05)',
                          color: f.included ? '#4AFF91' : 'rgba(255,255,255,0.2)',
                          border: f.included ? '1px solid rgba(74,255,145,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        }}>
                          {f.included ? '✓' : '✕'}
                        </span>
                        <span style={{
                          fontSize: 14,
                          color: f.included ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                        }}>
                          {f.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <a href="/register" style={{
                    display: 'block',
                    textAlign: 'center',
                    background: plan.highlight ? '#0E0E95' : 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: plan.highlight ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '13px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                    onMouseEnter={e => e.target.style.opacity = '0.8'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                  >
                    {plan.highlight ? 'Get Premium' : 'Start Free'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'Reviews' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, margin: '0 0 12px' }}>
                What Users Are Saying
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
                Real feedback from real users.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
            }}>
              {reviews.map((r, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <span key={j} style={{ color: '#f0a500', fontSize: 14 }}>★</span>
                    ))}
                    {Array.from({ length: 5 - r.rating }).map((_, j) => (
                      <span key={j} style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14 }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
                    "{r.text}"
                  </p>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{r.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}