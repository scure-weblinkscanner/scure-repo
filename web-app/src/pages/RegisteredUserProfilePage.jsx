import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as userAccountService from '../services/userAccount.service'
import * as subscriptionPlanService from '../services/subscriptionPlan.service'
import PublicNavbar from '../components/UserNavbar'
import backgroundWebsite from '../assets/background-website.jpg'

const PLAN_LABELS = {
  1: { label: 'Admin',   color: '#6bb3ff', bg: 'rgba(107,179,255,0.12)', border: 'rgba(107,223,255,0.3)' },
  2: { label: 'Free',    color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)' },
  3: { label: 'Premium', color: '#f0a500', bg: 'rgba(240,165,0,0.12)',   border: 'rgba(240,165,0,0.3)'  },
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: '#fff',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: 6,
}

// ─── Shared Modal ────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}
    onClick={onClose}
  >
    <div
      style={{
        background: '#0d0d1a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: 28,
        width: '100%', maxWidth: 440,
        fontFamily: "'DM Sans', sans-serif",
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>
          {title}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '5px 12px', color: 'rgba(255,255,255,0.5)',
            fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >✕</button>
      </div>
      {children}
    </div>
  </div>
)

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 2000,
      background: type === 'success' ? 'rgba(74,255,145,0.15)' : 'rgba(255,107,107,0.15)',
      border: `1px solid ${type === 'success' ? 'rgba(74,255,145,0.3)' : 'rgba(255,107,107,0.3)'}`,
      color: type === 'success' ? '#4AFF91' : '#FF6B6B',
      borderRadius: 12, padding: '12px 20px',
      fontSize: 14, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      {type === 'success' ? '✓ ' : '⚠ '}{message}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const RegisteredUserProfilePage = () => {
  const navigate = useNavigate()

  // Auth
  const storedUser = JSON.parse(sessionStorage.getItem('user') ?? 'null')

  // Tab
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const [account, setAccount] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [errorProfile, setErrorProfile] = useState(null)

  // Edit fields
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Subscription state
  const [subscription, setSubscription] = useState(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [errorSubscription, setErrorSubscription] = useState(null)

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Toast
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  // ── Guards ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token || !storedUser) { navigate('/login'); return }
    loadProfile()
    loadSubscription()
  }, [])

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const loadProfile = async () => {
    setLoadingProfile(true)
    setErrorProfile(null)
    try {
      const data = await userAccountService.getUserAccountById(storedUser.uaId)
      setAccount(data)
      setEditUsername(data.uaUsername)
      setEditEmail(data.uaEmail)
    } catch (err) {
      setErrorProfile(err.message)
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadSubscription = async () => {
    setLoadingSubscription(true)
    setErrorSubscription(null)
    try {
      const data = await subscriptionPlanService.getSubscriptionByUser(storedUser.uaId)
      setSubscription(data)
    } catch (err) {
      setErrorSubscription(err.message)
    } finally {
      setLoadingSubscription(false)
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    try {
      const updates = { uaUsername: editUsername, uaEmail: editEmail }
      if (editPassword.trim()) updates.uaPasswordHash = editPassword
      await userAccountService.updateUserAccount(storedUser.uaId, updates)
      // Sync sessionStorage
      const updatedUser = { ...storedUser, uaUsername: editUsername, uaEmail: editEmail }
      sessionStorage.setItem('user', JSON.stringify(updatedUser))
      setIsEditing(false)
      setEditPassword('')
      loadProfile()
      showToast('Profile updated successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userAccountService.deleteUserAccount(storedUser.uaId)
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      navigate('/')
    } catch (err) {
      showToast(err.message, 'error')
      setShowDeleteModal(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await subscriptionPlanService.cancelSubscription(subscription.spId, storedUser.uaId)
      setShowCancelModal(false)
      loadSubscription()
      loadProfile()
      showToast('Subscription cancelled successfully')
    } catch (err) {
      showToast(err.message, 'error')
      setShowCancelModal(false)
    }
  }

  const handleCancelEdit = () => {
    setEditUsername(account?.uaUsername ?? '')
    setEditEmail(account?.uaEmail ?? '')
    setEditPassword('')
    setIsEditing(false)
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const planInfo = PLAN_LABELS[account?.uaUserProfileId ?? storedUser?.uaUserProfileId]
  const isPremium = (account?.uaUserProfileId ?? storedUser?.uaUserProfileId) === 3
  const isFree = (account?.uaUserProfileId ?? storedUser?.uaUserProfileId) === 2

  // ── Tab button style ───────────────────────────────────────────────────────
  const tabStyle = (tab) => ({
    padding: '9px 24px',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 10,
    border: activeTab === tab
      ? '1px solid rgba(255,255,255,0.15)'
      : '1px solid transparent',
    background: activeTab === tab
      ? 'rgba(255,255,255,0.08)'
      : 'transparent',
    color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  })

  // ── Section card ───────────────────────────────────────────────────────────
  const sectionCard = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(5,5,15,0.85), rgba(5,5,15,0.85)), url(${backgroundWebsite})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <PublicNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Modal title="Delete Account" onClose={() => setShowDeleteModal(false)}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Are you sure you want to permanently delete your account?{' '}
            <strong style={{ color: '#fff' }}>This action cannot be undone</strong> and will remove all your scan history and data.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleDeleteAccount}
              style={{
                flex: 1, background: 'rgba(255,107,107,0.15)', color: '#FF6B6B',
                border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10,
                padding: '10px 0', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >Delete My Account</button>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                padding: '10px 0', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >Cancel</button>
          </div>
        </Modal>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <Modal title="Cancel Subscription" onClose={() => setShowCancelModal(false)}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Are you sure you want to cancel your Premium subscription? You'll be downgraded to the{' '}
            <strong style={{ color: '#fff' }}>Free plan</strong> immediately and lose access to Premium features.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCancelSubscription}
              style={{
                flex: 1, background: 'rgba(255,107,107,0.15)', color: '#FF6B6B',
                border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10,
                padding: '10px 0', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >Yes, Cancel</button>
            <button
              onClick={() => setShowCancelModal(false)}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                padding: '10px 0', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >Keep Premium</button>
          </div>
        </Modal>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 36, fontWeight: 700, margin: '0 0 6px' }}>
            My Account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            Manage your profile and subscription settings.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'inline-flex',
          gap: 4,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: 4,
          marginBottom: 28,
        }}>
          <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>
            Profile
          </button>
          <button style={tabStyle('subscription')} onClick={() => setActiveTab('subscription')}>
            Subscription
          </button>
        </div>

        {/* ── PROFILE TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <>
            {loadingProfile ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                Loading profile...
              </div>
            ) : errorProfile ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#FF6B6B', fontSize: 14 }}>
                {errorProfile}
              </div>
            ) : (
              <>
                {/* Account Info Card */}
                <div style={sectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div>
                      <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
                        Account Info
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
                        Your personal details
                      </p>
                    </div>
                    {planInfo && (
                      <span style={{
                        background: planInfo.bg,
                        border: `1px solid ${planInfo.border}`,
                        color: planInfo.color,
                        borderRadius: 999, padding: '4px 14px',
                        fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                      }}>
                        {planInfo.label}
                      </span>
                    )}
                  </div>

                  {!isEditing ? (
                    /* View Mode */
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                        {[
                          { label: 'Username', value: account?.uaUsername },
                          { label: 'Email', value: account?.uaEmail },
                          { label: 'Member Since', value: account?.uaCreatedAt ? new Date(account.uaCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                        ].map((row, i) => (
                          <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            paddingBottom: 16,
                            borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{row.label}</span>
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        style={{
                          background: '#0E0E95', color: '#fff',
                          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                          padding: '10px 24px', fontSize: 14, fontWeight: 600,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1a1ab0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#0E0E95'}
                      >
                        Edit Profile
                      </button>
                    </>
                  ) : (
                    /* Edit Mode */
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                        <div>
                          <label style={labelStyle}>Username</label>
                          <input
                            style={inputStyle}
                            value={editUsername}
                            onChange={e => setEditUsername(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Email</label>
                          <input
                            style={inputStyle}
                            type="email"
                            value={editEmail}
                            onChange={e => setEditEmail(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>
                            New Password{' '}
                            <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>
                              (leave blank to keep current)
                            </span>
                          </label>
                          <input
                            style={inputStyle}
                            type="password"
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={handleUpdateProfile}
                          style={{
                            flex: 1, background: '#0E0E95', color: '#fff',
                            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                            padding: '10px 0', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}
                        >Save Changes</button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                            padding: '10px 0', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}
                        >Cancel</button>
                      </div>
                    </>
                  )}
                </div>

                {/* Danger Zone */}
                <div style={{
                  ...sectionCard,
                  border: '1px solid rgba(255,107,107,0.15)',
                  background: 'rgba(255,107,107,0.03)',
                }}>
                  <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: '#FF6B6B' }}>
                    Danger Zone
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      background: 'rgba(255,107,107,0.1)', color: '#FF6B6B',
                      border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10,
                      padding: '10px 24px', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,107,107,0.18)'
                      e.currentTarget.style.borderColor = 'rgba(255,107,107,0.4)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,107,107,0.1)'
                      e.currentTarget.style.borderColor = 'rgba(255,107,107,0.25)'
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── SUBSCRIPTION TAB ─────────────────────────────────────────────── */}
        {activeTab === 'subscription' && (
          <>
            {loadingSubscription ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                Loading subscription...
              </div>
            ) : errorSubscription ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#FF6B6B', fontSize: 14 }}>
                {errorSubscription}
              </div>
            ) : (
              <>
                {/* Current Plan Card */}
                <div style={sectionCard}>
                  <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 18, fontWeight: 700, margin: '0 0 24px' }}>
                    Current Plan
                  </h2>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                        Plan
                      </div>
                      {planInfo && (
                        <span style={{
                          background: planInfo.bg,
                          border: `1px solid ${planInfo.border}`,
                          color: planInfo.color,
                          borderRadius: 999, padding: '5px 16px',
                          fontSize: 13, fontWeight: 700,
                        }}>
                          {planInfo.label}
                        </span>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                        Status
                      </div>
                      <span style={{
                        background: subscription?.spStatus === 'active' ? 'rgba(74,255,145,0.1)' : 'rgba(255,107,107,0.1)',
                        border: `1px solid ${subscription?.spStatus === 'active' ? 'rgba(74,255,145,0.25)' : 'rgba(255,107,107,0.25)'}`,
                        color: subscription?.spStatus === 'active' ? '#4AFF91' : '#FF6B6B',
                        borderRadius: 999, padding: '5px 16px',
                        fontSize: 13, fontWeight: 700,
                      }}>
                        {subscription?.spStatus === 'active' ? 'Active' : 'Cancelled'}
                      </span>
                    </div>
                  </div>

                  {/* Billing details */}
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    marginBottom: 24,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Next Billing Date</span>
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                        {subscription?.spNextBillingDate
                          ? new Date(subscription.spNextBillingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : '—'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Member Since</span>
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                        {subscription?.spCreatedAt
                          ? new Date(subscription.spCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* CTA based on plan */}
                  {isPremium && subscription?.spStatus === 'active' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      style={{
                        background: 'rgba(255,107,107,0.1)', color: '#FF6B6B',
                        border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10,
                        padding: '10px 24px', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,107,107,0.18)'
                        e.currentTarget.style.borderColor = 'rgba(255,107,107,0.4)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,107,107,0.1)'
                        e.currentTarget.style.borderColor = 'rgba(255,107,107,0.25)'
                      }}
                    >
                      Cancel Subscription
                    </button>
                  )}

                  {isFree && (
                    <button
                      onClick={() => navigate('/upgrade')}
                      style={{
                        background: '#0E0E95', color: '#fff',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                        padding: '10px 24px', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1ab0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#0E0E95'}
                    >
                      Upgrade to Premium
                    </button>
                  )}

                  {isPremium && subscription?.spStatus === 'cancelled' && (
                    <button
                      onClick={() => navigate('/upgrade')}
                      style={{
                        background: '#0E0E95', color: '#fff',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                        padding: '10px 24px', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1ab0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#0E0E95'}
                    >
                      Resubscribe to Premium
                    </button>
                  )}
                </div>

                {/* Plan comparison hint for Free users */}
                {isFree && (
                  <div style={{
                    background: 'rgba(14,14,149,0.08)',
                    border: '1px solid rgba(14,14,149,0.25)',
                    borderRadius: 16,
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                        Unlock Premium Features
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                        Unlimited scans, AI analysis, full history, and more for $9.99/mo.
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/upgrade')}
                      style={{
                        background: 'rgba(240,165,0,0.15)', color: '#f0a500',
                        border: '1px solid rgba(240,165,0,0.3)', borderRadius: 10,
                        padding: '9px 20px', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: 'nowrap', flexShrink: 0,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(240,165,0,0.22)'
                        e.currentTarget.style.borderColor = 'rgba(240,165,0,0.5)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(240,165,0,0.15)'
                        e.currentTarget.style.borderColor = 'rgba(240,165,0,0.3)'
                      }}
                    >
                      View Plans
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RegisteredUserProfilePage