import PublicNavbar from '../components/PublicNavbar'
import backgroundWebsite from '../assets/background-website.jpg'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL

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
    id: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, Amex',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'paypal', label: 'PayPal', description: 'Pay with your PayPal account',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 11C7 11 6 17 9 19C12 21 16 19 17 16C18 13 16 11 13 11H7Z"/>
        <path d="M10 7C10 7 9 13 12 15C15 17 19 15 20 12C21 9 19 7 16 7H10Z"/>
      </svg>
    ),
  },
  {
    id: 'apple', label: 'Apple Pay', description: 'Touch ID or Face ID checkout',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  {
    id: 'google', label: 'Google Pay', description: 'Fast checkout with Google',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="rgba(255,255,255,0.7)"/>
      </svg>
    ),
  },
]

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep, totalSteps, labels }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
    {Array.from({ length: totalSteps }, (_, i) => {
      const step = i + 1
      const isCompleted = step < currentStep
      const isActive = step === currentStep
      return (
        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: isCompleted ? '2px solid #4AFF91' : isActive ? '2px solid #0E0E95' : '2px solid rgba(255,255,255,0.15)',
              background: isCompleted ? 'rgba(74,255,145,0.15)' : isActive ? 'rgba(14,14,149,0.4)' : 'rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
              color: isCompleted ? '#4AFF91' : isActive ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s', fontFamily: "'DM Sans', sans-serif",
            }}>
              {isCompleted ? '✓' : step}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
              letterSpacing: 0.5, fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap', transition: 'color 0.3s',
            }}>{labels[i]}</span>
          </div>
          {step < totalSteps && (
            <div style={{
              width: 64, height: 2, margin: '0 8px', marginBottom: 20,
              background: isCompleted ? 'rgba(74,255,145,0.4)' : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s', borderRadius: 2,
            }} />
          )}
        </div>
      )
    })}
  </div>
)

const modalInputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
}

const modalLabelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1,
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
  marginBottom: 6, fontFamily: "'DM Sans', sans-serif",
}

const maskCard = (num) => {
  const clean = (num ?? '').replace(/\s/g, '')
  if (clean.length < 4) return '•••• •••• •••• ••••'
  return `•••• •••• •••• ${clean.slice(-4)}`
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UpgradePage() {
  const navigate = useNavigate()

  // Check if user is logged in
  const storedUser = JSON.parse(sessionStorage.getItem('user') ?? 'null')
  const token = sessionStorage.getItem('token')
  const isLoggedIn = !!token && !!storedUser

  const [selectedMethod, setSelectedMethod] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [form, setForm] = useState({
    email: isLoggedIn ? (storedUser?.uaEmail ?? '') : '',
  })
  const [emailError, setEmailError] = useState(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'email') setEmailError(null)
  }

  const handleOpenModal = () => {
    if (!selectedMethod) return
    setForm({ email: isLoggedIn ? (storedUser?.uaEmail ?? '') : '' })
    setEmailError(null)
    setModalStep(1)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setModalStep(1)
    setEmailError(null)
  }

  const handleFinalClose = () => {
    navigate(isLoggedIn ? '/profile' : '/')
  }

  // ── Step 1 Continue: check email then proceed ─────────────────────────────
  const handleStep1Continue = async () => {
    setCheckingEmail(true)
    setEmailError(null)
    try {
      const res = await fetch(
        `${BASE_URL}/api/userAccount/check-email?email=${encodeURIComponent(form.email)}`
      )
      const data = await res.json()
      if (!data.exists) {
        setEmailError('No account found with this email.')
        return
      }
      setModalStep(2)
    } catch (err) {
      setEmailError('Could not verify email. Please try again.')
    } finally {
      setCheckingEmail(false)
    }
  }

  // ── Step 2 Confirm: upgrade subscription ─────────────────────────────────
  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const uaId = isLoggedIn ? storedUser.uaId : null

      // If not logged in, we need to get uaId from email first
      let resolvedUaId = uaId
      if (!resolvedUaId) {
        const res = await fetch(
          `${BASE_URL}/api/userAccount/check-email?email=${encodeURIComponent(form.email)}`
        )
        const data = await res.json()
        resolvedUaId = data.uaId
      }

      const upgradeHeaders = { 'Content-Type': 'application/json' }
      if (token) upgradeHeaders['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${BASE_URL}/api/subscriptionPlan/upgrade`, {
        method: 'PUT',
        headers: upgradeHeaders,
        body: JSON.stringify({ uaId: resolvedUaId }),
      })

      if (!res.ok) throw new Error('Upgrade failed')
      const result = await res.json()

      // Sync sessionStorage live if logged in
      if (isLoggedIn && result.account) {
        const updatedUser = {
          ...storedUser,
          uaUserProfileId: 3,
        }
        sessionStorage.setItem('user', JSON.stringify(updatedUser))
      }

      setModalStep(3)
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setUpgrading(false)
    }
  }

  const isStep1Valid = () => {
    const emailOk = (form.email ?? '').trim().includes('@')
    if (selectedMethod === 'card') {
      return emailOk &&
        (form.cardName ?? '').trim() &&
        (form.cardNumber ?? '').replace(/\s/g, '').length === 16 &&
        (form.cardExpiry ?? '').length === 7 &&
        (form.cardCvv ?? '').length === 3
    }
    if (selectedMethod === 'paypal') return emailOk && (form.paypalPassword ?? '').trim()
    if (selectedMethod === 'apple') return emailOk
    if (selectedMethod === 'google') return emailOk
    return false
  }

  const stepLabels = ['Details', 'Confirm', 'Done']
  const selectedMethodLabel = paymentMethods.find(m => m.id === selectedMethod)?.label ?? ''

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(5,5,15,0.78), rgba(5,5,15,0.78)), url(${backgroundWebsite})`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
      color: '#fff', fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <PublicNavbar />

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 24px 56px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14,14,149,0.5) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.4)', borderRadius: 999, padding: '6px 18px', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#f0a500', marginBottom: 24 }}>
            Premium Plan
          </div>
          <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px', background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Upgrade to Premium
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
            Unlock unlimited scans, advanced ad detection, and full community access for just $9.99/month.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'start' }}>

        {/* Left — Features */}
        <div>
          <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 22, fontWeight: 700, margin: '0 0 20px', color: '#fff' }}>What's Included</h2>
          <div style={{ background: 'rgba(14,14,149,0.25)', border: '1px solid rgba(14,14,149,0.7)', borderRadius: 20, padding: '24px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Premium Plan</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 40, fontWeight: 800, color: '#fff' }}>$9.99</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/ month</span>
              </div>
            </div>
            <div style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#f0a500', letterSpacing: 1, textTransform: 'uppercase' }}>Most Popular</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {premiumFeatures.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(74,255,145,0.08)', border: '1px solid rgba(74,255,145,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.description}</div>
                </div>
                <span style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: 'rgba(74,255,145,0.15)', border: '1px solid rgba(74,255,145,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#4AFF91', flexShrink: 0 }}>✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Payment Method Selection */}
        <div>
          <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 22, fontWeight: 700, margin: '0 0 20px', color: '#fff' }}>Choose Payment Method</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id
              return (
                <div key={method.id} onClick={() => setSelectedMethod(method.id)} style={{ background: isSelected ? 'rgba(14,14,149,0.2)' : 'rgba(255,255,255,0.03)', border: isSelected ? '1px solid rgba(14,14,149,0.6)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(14,14,149,0.1)'; e.currentTarget.style.borderColor = 'rgba(14,14,149,0.3)' } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{method.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{method.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{method.description}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: isSelected ? '2px solid #0E0E95' : '2px solid rgba(255,255,255,0.2)', background: isSelected ? '#0E0E95' : 'transparent', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div style={{ background: 'rgba(14,14,149,0.15)', border: '1px solid rgba(14,14,149,0.4)', borderRadius: 20, padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Scure Premium</span>
              <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>$9.99/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Billed monthly</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Cancel anytime</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>$9.99 / month</span>
            </div>
          </div>

          <button onClick={handleOpenModal} disabled={!selectedMethod} style={{ width: '100%', background: selectedMethod ? '#0E0E95' : 'rgba(255,255,255,0.05)', color: selectedMethod ? '#fff' : 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '16px 0', fontSize: 16, fontWeight: 700, cursor: selectedMethod ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s', marginBottom: 12 }}
            onMouseEnter={e => { if (selectedMethod) e.currentTarget.style.background = '#1a1ab0' }}
            onMouseLeave={e => { if (selectedMethod) e.currentTarget.style.background = '#0E0E95' }}
          >
            {selectedMethod ? 'Continue to Payment' : 'Select a Payment Method'}
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            By subscribing you agree to our Terms of Service. Cancel anytime from your account settings.
          </p>
        </div>
      </div>

      {/* ── Multi-Step Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={modalStep < 3 ? handleModalClose : undefined}
        >
          <div style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 32px', maxWidth: 460, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <StepIndicator currentStep={modalStep} totalSteps={3} labels={stepLabels} />

            {/* ── Step 1: Payment Details ── */}
            {modalStep === 1 && (
              <>
                <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>Payment Details</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>{selectedMethodLabel}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Email field — always shown, pre-filled and readonly if logged in */}
                  <div>
                    <label style={modalLabelStyle}>
                      Account Email
                      {isLoggedIn && (
                        <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0, marginLeft: 6, fontWeight: 400 }}>
                          (your registered email)
                        </span>
                      )}
                    </label>
                    <input
                      style={{
                        ...modalInputStyle,
                        background: isLoggedIn ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                        color: isLoggedIn ? 'rgba(255,255,255,0.5)' : '#fff',
                        cursor: isLoggedIn ? 'not-allowed' : 'text',
                      }}
                      type="email"
                      placeholder="your@email.com"
                      value={form.email ?? ''}
                      readOnly={isLoggedIn}
                      onChange={e => handleFormChange('email', e.target.value)}
                    />
                    {/* Inline email error */}
                    {emailError && (
                      <div style={{ marginTop: 8, fontSize: 13, color: '#FF6B6B', lineHeight: 1.5 }}>
                        {emailError}{' '}
                        <Link
                          to="/register"
                          style={{ color: '#6bb3ff', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          Don't have an account? Register here.
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Card fields */}
                  {selectedMethod === 'card' && (
                    <>
                      <div>
                        <label style={modalLabelStyle}>Cardholder Name</label>
                        <input style={modalInputStyle} placeholder="John Smith" value={form.cardName ?? ''} onChange={e => handleFormChange('cardName', e.target.value)} />
                      </div>
                      <div>
                        <label style={modalLabelStyle}>Card Number</label>
                        <input style={modalInputStyle} placeholder="1234 5678 9012 3456" maxLength={19} value={form.cardNumber ?? ''}
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
                            handleFormChange('cardNumber', raw.replace(/(.{4})/g, '$1 ').trim())
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={modalLabelStyle}>Expiry</label>
                          <input style={modalInputStyle} placeholder="MM / YY" maxLength={7} value={form.cardExpiry ?? ''}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
                              handleFormChange('cardExpiry', raw.length > 2 ? `${raw.slice(0,2)} / ${raw.slice(2)}` : raw)
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={modalLabelStyle}>CVV</label>
                          <input style={modalInputStyle} placeholder="•••" maxLength={3} type="password" value={form.cardCvv ?? ''} onChange={e => handleFormChange('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 3))} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* PayPal fields */}
                  {selectedMethod === 'paypal' && (
                    <div>
                      <label style={modalLabelStyle}>PayPal Password</label>
                      <input style={modalInputStyle} type="password" placeholder="••••••••" value={form.paypalPassword ?? ''} onChange={e => handleFormChange('paypalPassword', e.target.value)} />
                    </div>
                  )}

                  {/* Apple Pay */}
                  {selectedMethod === 'apple' && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                        You'll be prompted to authenticate with Touch ID or Face ID when you confirm.
                      </div>
                    </div>
                  )}

                  {/* Google Pay */}
                  {selectedMethod === 'google' && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                      You'll be redirected to Google to complete authentication securely.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button
                    onClick={handleStep1Continue}
                    disabled={!isStep1Valid() || checkingEmail}
                    style={{ flex: 1, background: isStep1Valid() && !checkingEmail ? '#0E0E95' : 'rgba(255,255,255,0.05)', color: isStep1Valid() && !checkingEmail ? '#fff' : 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: isStep1Valid() && !checkingEmail ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}
                    onMouseEnter={e => { if (isStep1Valid() && !checkingEmail) e.currentTarget.style.background = '#1a1ab0' }}
                    onMouseLeave={e => { if (isStep1Valid() && !checkingEmail) e.currentTarget.style.background = '#0E0E95' }}
                  >
                    {checkingEmail ? 'Verifying...' : 'Continue'}
                  </button>
                  <button onClick={handleModalClose} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2: Confirmation ── */}
            {modalStep === 2 && (
              <>
                <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>Confirm Order</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>Review your details before subscribing.</p>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Payment Method</div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginBottom: 4 }}>{selectedMethodLabel}</div>
                  {selectedMethod === 'card' && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{maskCard(form.cardNumber)} · {form.cardName}</div>}
                  {selectedMethod === 'paypal' && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{form.email}</div>}
                  {selectedMethod === 'google' && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{form.email}</div>}
                  {selectedMethod === 'apple' && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Authenticated via Touch ID / Face ID</div>}
                </div>

                <div style={{ background: 'rgba(14,14,149,0.12)', border: '1px solid rgba(14,14,149,0.3)', borderRadius: 14, padding: '16px 18px', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Account</div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{form.email}</div>
                </div>

                <div style={{ background: 'rgba(14,14,149,0.12)', border: '1px solid rgba(14,14,149,0.3)', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Order</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Scure Premium</span>
                    <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>$9.99</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Billed monthly · cancel anytime</div>
                </div>

                {emailError && (
                  <div style={{ marginBottom: 16, fontSize: 13, color: '#FF6B6B' }}>{emailError}</div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleUpgrade} disabled={upgrading} style={{ flex: 1, background: upgrading ? 'rgba(255,255,255,0.05)' : '#0E0E95', color: upgrading ? 'rgba(255,255,255,0.25)' : '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: upgrading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}
                    onMouseEnter={e => { if (!upgrading) e.currentTarget.style.background = '#1a1ab0' }}
                    onMouseLeave={e => { if (!upgrading) e.currentTarget.style.background = '#0E0E95' }}
                  >
                    {upgrading ? 'Processing...' : 'Confirm & Subscribe'}
                  </button>
                  <button onClick={() => setModalStep(1)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    Back
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3: Done ── */}
            {modalStep === 3 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,255,145,0.1)', border: '1px solid rgba(74,255,145,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px' }}>
                  ✓
                </div>
                <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: '#4AFF91' }}>
                  You're now Premium!
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 28px' }}>
                  Your account has been upgraded. Enjoy unlimited scans and all Premium features.
                </p>
                <button onClick={handleFinalClose} style={{ width: '100%', background: '#0E0E95', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1ab0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0E0E95'}
                >
                  {isLoggedIn ? 'Go to My Profile' : 'Go to Home'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}