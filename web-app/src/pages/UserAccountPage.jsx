import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as userAccountService from '../services/userAccount.service'
import AdminNavbar from '../components/AdminNavbar'
import backgroundWebsite from '../assets/background-website.jpg'

const PROFILE_LABELS = {
  1: { label: 'Admin',   color: '#6bb3ff', bg: 'rgba(107, 206, 255, 0.12)', border: 'rgba(107, 223, 255, 0.3)' },
  2: { label: 'Free',    color: '#aaa',    bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)' },
  3: { label: 'Premium', color: '#f0a500', bg: 'rgba(240,165,0,0.12)',   border: 'rgba(240,165,0,0.3)'   },
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

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  }} onClick={onClose}>
    <div style={{
      background: '#0d0d1a',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: 28,
      width: '100%', maxWidth: 440,
      fontFamily: "'DM Sans', sans-serif",
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>
          {title}
        </h2>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '5px 12px', color: 'rgba(255,255,255,0.5)',
          fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>✕</button>
      </div>
      {children}
    </div>
  </div>
)

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

const UserAccountPage = () => {
  const [accounts, setAccounts] = useState([])
  const [viewingAccount, setViewingAccount] = useState(null)
  const [updatingAccount, setUpdatingAccount] = useState(null)
  const [deletingAccount, setDeletingAccount] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const token = sessionStorage.getItem('token')

  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchAccounts()
  }, [])

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchAccounts = async () => {
    try {
      const data = await userAccountService.getAllUserAccounts(token)
      setAccounts(data)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) { fetchAccounts(); return }
      const data = await userAccountService.searchUserAccounts(searchQuery, token)
      setAccounts(data)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleCreate = async () => {
    try {
      await userAccountService.registerUserAccount(newUsername, newEmail, newPassword)
      setShowCreateModal(false)
      setNewUsername(''); setNewEmail(''); setNewPassword('')
      fetchAccounts()
      showToast('Account created successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleUpdate = async () => {
    try {
      const updates = { uaUsername: editUsername, uaEmail: editEmail }
      if (editPassword.trim()) updates.uaPasswordHash = editPassword
      await userAccountService.updateUserAccount(updatingAccount.uaId, updates, token)
      setUpdatingAccount(null)
      fetchAccounts()
      showToast('Account updated successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (uaId) => {
    try {
      await userAccountService.deleteUserAccount(uaId, token)
      setDeletingAccount(null)
      fetchAccounts()
      showToast('Account deleted successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const openUpdate = (account) => {
    setViewingAccount(null)
    setEditUsername(account.uaUsername)
    setEditEmail(account.uaEmail)
    setEditPassword('')
    setUpdatingAccount(account)
  }

  const filteredAccounts = accounts.filter(a =>
    a.uaUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.uaEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(5,5,15,0.85), rgba(5,5,15,0.85)), url(${backgroundWebsite})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <AdminNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* View Modal */}
      {viewingAccount && (
        <Modal title="Account Details" onClose={() => setViewingAccount(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'ID', value: viewingAccount.uaId },
              { label: 'Username', value: viewingAccount.uaUsername },
              { label: 'Email', value: viewingAccount.uaEmail },
              { label: 'Created', value: new Date(viewingAccount.uaCreatedAt).toLocaleDateString() },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{row.label}</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Plan</span>
              <span style={{
                background: PROFILE_LABELS[viewingAccount.uaUserProfileId]?.bg,
                border: `1px solid ${PROFILE_LABELS[viewingAccount.uaUserProfileId]?.border}`,
                color: PROFILE_LABELS[viewingAccount.uaUserProfileId]?.color,
                borderRadius: 999, padding: '2px 12px', fontSize: 11, fontWeight: 700,
              }}>
                {PROFILE_LABELS[viewingAccount.uaUserProfileId]?.label ?? 'Unknown'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => openUpdate(viewingAccount)} style={{
              flex: 1, background: '#0E0E95', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Edit</button>
            <button onClick={() => setViewingAccount(null)} style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Close</button>
          </div>
        </Modal>
      )}

      {/* Update Modal */}
      {updatingAccount && (
        <Modal title="Update Account" onClose={() => setUpdatingAccount(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input style={inputStyle} value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>New Password <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(leave blank to keep current)</span></label>
              <input style={inputStyle} type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleUpdate} style={{
              flex: 1, background: '#0E0E95', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Save Changes</button>
            <button onClick={() => setUpdatingAccount(null)} style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Create Account" onClose={() => setShowCreateModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input style={inputStyle} value={newUsername} onChange={e => setNewUsername(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleCreate} style={{
              flex: 1, background: '#0E0E95', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Create</button>
            <button onClick={() => setShowCreateModal(false)} style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deletingAccount && (
        <Modal title="Delete Account" onClose={() => setDeletingAccount(null)}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Are you sure you want to delete <strong style={{ color: '#fff' }}>{deletingAccount.uaUsername}</strong>? This action cannot be undone and will remove all associated scan history.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleDelete(deletingAccount.uaId)} style={{
              flex: 1, background: 'rgba(255,107,107,0.15)', color: '#FF6B6B',
              border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Delete</button>
            <button onClick={() => setDeletingAccount(null)} style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Cancel</button>
          </div>
        </Modal>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 36, fontWeight: 700, margin: '0 0 6px' }}>
            User Accounts
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            Manage all registered user accounts.
          </p>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setShowCreateModal(true)} style={{
            background: '#0E0E95', color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
            padding: '9px 20px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>+ Create Account</button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '8px 14px', flex: 1, maxWidth: 320,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 13, flex: 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); fetchAccounts() }} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer', fontSize: 14, padding: 0,
              }}>✕</button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['ID', 'Username', 'Email', 'Plan', 'Actions'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '14px 16px',
                      color: 'rgba(255,255,255,0.35)', fontWeight: 600,
                      fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map(account => {
                    const plan = PROFILE_LABELS[account.uaUserProfileId]
                    return (
                      <tr key={account.uaId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 12 }}>
                          #{account.uaId}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#fff', fontWeight: 600 }}>
                          {account.uaUsername}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.5)' }}>
                          {account.uaEmail}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {plan && (
                            <span style={{
                              background: plan.bg, border: `1px solid ${plan.border}`,
                              color: plan.color, borderRadius: 999,
                              padding: '3px 10px', fontSize: 11, fontWeight: 700,
                            }}>
                              {plan.label}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setViewingAccount(account)} style={{
                              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                              padding: '6px 14px', fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            }}>View</button>
                            <button onClick={() => setDeletingAccount(account)} style={{
                              background: 'rgba(255,107,107,0.08)', color: '#FF6B6B',
                              border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8,
                              padding: '6px 14px', fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAccountPage