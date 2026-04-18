import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as userProfileService from '../services/userProfile.service'
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

const UserProfilePage = () => {
  const [profiles, setProfiles] = useState([])
  const [viewingProfile, setViewingProfile] = useState(null)
  const [updatingProfile, setUpdatingProfile] = useState(null)
  const [deletingProfile, setDeletingProfile] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const [newProfileName, setNewProfileName] = useState('')
  const [editProfileName, setEditProfileName] = useState('')
  const token = sessionStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchProfiles()
  }, [])

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchProfiles = async () => {
    try {
      const data = await userProfileService.getAllUserProfiles()
      setProfiles(data)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) { fetchProfiles(); return }
      const data = await userProfileService.searchUserProfiles(searchQuery, token)
      setProfiles(data)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleCreate = async () => {
    try {
      await userProfileService.createUserProfile({ upName: newProfileName }, token)
      setShowCreateModal(false)
      setNewProfileName('')
      fetchProfiles()
      showToast('Profile created successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleUpdate = async () => {
    try {
      await userProfileService.updateUserProfile(updatingProfile.upId, { upName: editProfileName }, token)
      setUpdatingProfile(null)
      fetchProfiles()
      showToast('Profile updated successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (upId) => {
    try {
      await userProfileService.deleteUserProfile(upId, token)
      setDeletingProfile(null)
      fetchProfiles()
      showToast('Profile deleted successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const openUpdate = (profile) => {
    setViewingProfile(null)
    setEditProfileName(profile.upName)
    setUpdatingProfile(profile)
  }

  const filteredProfiles = profiles
    .filter(p => p.upName?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.upId - b.upId)

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
      {viewingProfile && (
        <Modal title="Profile Details" onClose={() => setViewingProfile(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'ID', value: viewingProfile.upId },
              { label: 'Profile Name', value: viewingProfile.upName },
              { label: 'Description', value: viewingProfile.upDescription || 'N/A' },
              { label: 'Created', value: new Date(viewingProfile.upCreatedAt).toLocaleDateString() },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{row.label}</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Badge</span>
              {PROFILE_LABELS[viewingProfile.upId] && (
                <span style={{
                  background: PROFILE_LABELS[viewingProfile.upId].bg,
                  border: `1px solid ${PROFILE_LABELS[viewingProfile.upId].border}`,
                  color: PROFILE_LABELS[viewingProfile.upId].color,
                  borderRadius: 999, padding: '2px 12px', fontSize: 11, fontWeight: 700,
                }}>
                  {PROFILE_LABELS[viewingProfile.upId].label}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => openUpdate(viewingProfile)} style={{
              flex: 1, background: '#0E0E95', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Edit</button>
            <button onClick={() => setViewingProfile(null)} style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Close</button>
          </div>
        </Modal>
      )}

      {/* Update Modal */}
      {updatingProfile && (
        <Modal title="Update Profile" onClose={() => setUpdatingProfile(null)}>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Profile Name</label>
            <input style={inputStyle} value={editProfileName} onChange={e => setEditProfileName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleUpdate} style={{
              flex: 1, background: '#0E0E95', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Save Changes</button>
            <button onClick={() => setUpdatingProfile(null)} style={{
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
        <Modal title="Create User Profile" onClose={() => setShowCreateModal(false)}>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Profile Name</label>
            <input
              style={inputStyle}
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              placeholder="e.g. Premium"
            />
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
      {deletingProfile && (
        <Modal title="Delete Profile" onClose={() => setDeletingProfile(null)}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Are you sure you want to delete <strong style={{ color: '#fff' }}>{deletingProfile.upName}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleDelete(deletingProfile.upId)} style={{
              flex: 1, background: 'rgba(255,107,107,0.15)', color: '#FF6B6B',
              border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10,
              padding: '10px 0', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Delete</button>
            <button onClick={() => setDeletingProfile(null)} style={{
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
            User Profiles
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            Manage user profile types and their access levels.
          </p>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setShowCreateModal(true)} style={{
            background: '#0E0E95', color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
            padding: '9px 20px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>+ Create Profile</button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '8px 14px', flex: 1, maxWidth: 320,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by profile name..."
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
              <button onClick={() => { setSearchQuery(''); fetchProfiles() }} style={{
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
                  {['ID', 'Profile Name', 'Badge', 'Actions'].map(h => (
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
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                      No profiles found.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map(profile => {
                    const badge = PROFILE_LABELS[profile.upId]
                    return (
                      <tr key={profile.upId}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 12 }}>
                          #{profile.upId}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#fff', fontWeight: 600 }}>
                          {profile.upName}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {badge ? (
                            <span style={{
                              background: badge.bg, border: `1px solid ${badge.border}`,
                              color: badge.color, borderRadius: 999,
                              padding: '3px 10px', fontSize: 11, fontWeight: 700,
                            }}>
                              {badge.label}
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setViewingProfile(profile)} style={{
                              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                              padding: '6px 14px', fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            }}>View</button>
                            <button onClick={() => setDeletingProfile(profile)} style={{
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

export default UserProfilePage