import PublicNavbar from '../components/PublicNavbar'
import backgroundWebsite from '../assets/background-website.jpg'
import { useState } from 'react'

const premiumFeatures = [
  { icon: '♾️', label: 'Unlimited Scans', description: 'No daily limits across all scan methods.' },
  { icon: '🌐', label: 'View Public Scans', description: 'Browse and explore scans shared by the community.' },
  { icon: '🔬', label: 'Ad Intensive Mode', description: 'Dynamic ad and tracker detection using headless browser simulation.' },
  { icon: '🔍', label: 'Multi-Engine Scanning', description: 'VirusTotal, URLScan.io, Google Safe Browsing, and Gemini AI simultaneously.' },
  { icon: '🤖', label: 'AI Script Analysis', description: 'Gemini AI inspects embedded scripts for hidden malicious behavior.' },
  { icon: '📷', label: 'Camera URL Detection', description: 'Scan URLs in real time using on-device OCR.' },
  { icon: '🔲', label: 'QR Code Scanner', description: 'Scan or upload QR codes to reveal hidden URLs.' },
  { icon: '📜', label: 'Full Scan History', description: 'Every scan saved with full details, verdicts, and risk scores.' },
]

const paymentMethods = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, Amex',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 11C7 11 6 17 9 19C12 21 16 19 17 16C18 13 16 11 13 11H7Z"/>
        <path d="M10 7C10 7 9 13 12 15C15 17 19 15 20 12C21 9 19 7 16 7H10Z"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Apple Pay',
    description: 'Touch ID or Face ID checkout',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  {
    id: 'google',
    label: 'Google Pay',
    description: 'Fast checkout with Google',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="rgba(255,255,255,0.7)"/>
      </svg>
    ),
  },
]

export default function UpgradePage() {
  const [showModal, setShowModal] = useState(false)
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
        padding: '72px 24px 56px',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14,14,149,0.5) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(240,165,0,0.15)',
            border: '1px solid rgba(240,165,0,0.4)',
            borderRadius: 999,
            padding: '6px 18px',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#f0a500',
            marginBottom: 24,
          }}>
            Premium Plan
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 60px)',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Upgrade to Premium
          </h1>
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7,
            maxWidth: 440,
            margin: '0 auto',
          }}>
            Unlock unlimited scans, advanced ad detection, and full community access for just $9.99/month.
          </p>
        </div>
      </div>

      {/* Main Content — features left, payment right */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px 100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        alignItems: 'start',
      }}>

        {/* Left — Premium Features */}
        <div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700,
            margin: '0 0 20px', color: '#fff',
          }}>
            What's Included
          </h2>

          {/* Price badge */}
          <div style={{
            background: 'rgba(14,14,149,0.25)',
            border: '1px solid rgba(14,14,149,0.7)',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                Premium Plan
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 800, color: '#fff' }}>$9.99</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/ month</span>
              </div>
            </div>
            <div style={{
              background: 'rgba(240,165,0,0.15)',
              border: '1px solid rgba(240,165,0,0.3)',
              borderRadius: 999,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 700,
              color: '#f0a500',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Most Popular
            </div>
          </div>

          {/* Feature list — no hover */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {premiumFeatures.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(74,255,145,0.08)',
                  border: '1px solid rgba(74,255,145,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.description}</div>
                </div>
                <span style={{
                  marginLeft: 'auto',
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(74,255,145,0.15)',
                  border: '1px solid rgba(74,255,145,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#4AFF91',
                  flexShrink: 0,
                }}>
                  ✓
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Payment */}
        <div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700,
            margin: '0 0 20px', color: '#fff',
          }}>
            Choose Payment Method
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(14,14,149,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(14,14,149,0.5)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {method.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                    {method.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {method.description}
                  </div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }} />
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{
            background: 'rgba(14,14,149,0.15)',
            border: '1px solid rgba(14,14,149,0.4)',
            borderRadius: 20,
            padding: '24px',
            marginBottom: 20,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
              Order Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Scure Premium</span>
              <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>$9.99/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Billed monthly</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Cancel anytime</span>
            </div>
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 16,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>$9.99 / month</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              width: '100%',
              background: '#0E0E95',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 14,
              padding: '16px 0',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s',
              marginBottom: 12,
            }}
            onMouseEnter={e => e.target.style.background = '#1a1ab0'}
            onMouseLeave={e => e.target.style.background = '#0E0E95'}
          >
            Subscribe Now
          </button>

          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.25)',
            textAlign: 'center', margin: 0, lineHeight: 1.6,
          }}>
            By subscribing you agree to our Terms of Service. Cancel anytime from your account settings.
          </p>
        </div>
      </div>

        {showModal && (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
        }}>
            <div style={{
            background: '#0a0a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: '36px 32px',
            maxWidth: 420, width: '100%',
            textAlign: 'center',
            }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
            <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 24, fontWeight: 700,
                margin: '0 0 10px', color: '#fff',
            }}>
                Payment Coming Soon
            </h2>
            <p style={{
                fontSize: 14, color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.7, margin: '0 0 28px',
            }}>
                Online payments are not yet available. Please contact us directly to upgrade your account to Premium.
            </p>
            <button
                onClick={() => setShowModal(false)}
                style={{
                width: '100%',
                background: '#0E0E95',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: '14px 0',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = '#1a1ab0'}
                onMouseLeave={e => e.target.style.background = '#0E0E95'}
            >
                Got it
            </button>
            </div>
        </div>
        )}

    </div>
  )
}