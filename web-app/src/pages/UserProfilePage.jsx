import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as userProfileService from '../services/userProfile.service'
import AdminNavbar from '../components/AdminNavbar'

const Modal = ({ children, onClose }) => (
  <div style={styles.overlay} onClick={onClose}>
    <div style={styles.modal} onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
)

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ ...styles.toast, backgroundColor: type === 'success' ? '#4caf50' : '#f44336' }}>
      {message}
    </div>
  )
}

const UserProfilePage = () => {
  const [profiles, setProfiles] = useState([])
  const [viewingProfile, setViewingProfile] = useState(null)
  const [updatingProfile, setUpdatingProfile] = useState(null)
  const [deletingProfile, setDeletingProfile] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  // for creating user profile
  const [newProfileName, setNewProfileName] = useState('')

  // for updating user profile
  const [editProfileName, setEditProfileName] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchProfiles()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

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
      if (!searchQuery.trim()) {
        fetchProfiles()
        return
      }
      const data = await userProfileService.searchUserProfiles(searchQuery)
      setProfiles(data)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleCreate = async () => {
    try {
      await userProfileService.createUserProfile({ upName: newProfileName })
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
      await userProfileService.updateUserProfile(updatingProfile.upId, { upName: editProfileName })
      setUpdatingProfile(null)
      fetchProfiles()
      showToast('Profile updated successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (upId) => {
    try {
      await userProfileService.deleteUserProfile(upId)
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

  return (
    <div>
      <AdminNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* View Modal */}
      {viewingProfile && (
        <Modal onClose={() => setViewingProfile(null)}>
          <h2 style={styles.modalTitle}>Profile Details</h2>
          <p><strong>ID:</strong> {viewingProfile.upId}</p>
          <p><strong>Profile Name:</strong> {viewingProfile.upName}</p>
          <p><strong>Description:</strong> {viewingProfile.upDescription || 'N/A'}</p>
          <p><strong>Created At:</strong> {new Date(viewingProfile.upCreatedAt).toLocaleDateString()}</p>
          <div style={styles.modalButtons}>
            <button style={styles.updateBtn} onClick={() => openUpdate(viewingProfile)}>Update</button>
            <button style={styles.cancelBtn} onClick={() => setViewingProfile(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Update Modal */}
      {updatingProfile && (
        <Modal onClose={() => setUpdatingProfile(null)}>
          <h2 style={styles.modalTitle}>Update User Profile</h2>
          <div style={styles.formGroup}>
            <label>Profile Name</label>
            <input
              style={styles.input}
              value={editProfileName}
              onChange={e => setEditProfileName(e.target.value)}
            />
          </div>
          <div style={styles.modalButtons}>
            <button style={styles.updateBtn} onClick={handleUpdate}>Submit</button>
            <button style={styles.cancelBtn} onClick={() => setUpdatingProfile(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <h2 style={styles.modalTitle}>Create User Profile</h2>
          <div style={styles.formGroup}>
            <label>User Profile Name</label>
            <input
              style={styles.input}
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              placeholder="Enter user profile name"
            />
          </div>
          <div style={styles.modalButtons}>
            <button style={styles.updateBtn} onClick={handleCreate}>Submit</button>
            <button style={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deletingProfile && (
        <Modal onClose={() => setDeletingProfile(null)}>
          <h2 style={styles.modalTitle}>Delete User Profile</h2>
          <p>Are you sure you want to delete <strong>{deletingProfile.upName}</strong>? This action cannot be undone.</p>
          <div style={styles.modalButtons}>
            <button style={styles.deleteBtn} onClick={() => handleDelete(deletingProfile.upId)}>Confirm Delete</button>
            <button style={styles.cancelBtn} onClick={() => setDeletingProfile(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      <div style={{ padding: '2rem' }}>
        <h1>User Profiles</h1>

        {/* Buttons Row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button onClick={() => setShowCreateModal(true)}>+ Create User Profile</button>
          <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); fetchProfiles() }}>
            {showSearch ? 'Hide Search' : 'Search User Profile'}
          </button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by profile name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', width: '250px' }}
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={() => { setSearchQuery(''); fetchProfiles() }}>Clear</button>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Profile Name</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.sort((a, b) => a.upId - b.upId).map((profile) => (
              <tr key={profile.upId}>
                <td style={tdStyle}>{profile.upId}</td>
                <td style={tdStyle}>{profile.upName}</td>
                <td style={tdStyle}>
                  <button onClick={() => setViewingProfile(profile)}>View</button>
                  <button onClick={() => setDeletingProfile(profile)} style={{ marginLeft: '0.5rem', color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>No profiles found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    justifyContent: 'flex-end',
  },
  updateBtn: {
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: '#eee',
    color: '#000',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#e53935',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginBottom: '1rem',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  toast: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    color: '#fff',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    zIndex: 2000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  }
}

const thStyle = { border: '1px solid #ccc', padding: '0.5rem', textAlign: 'left' }
const tdStyle = { border: '1px solid #ccc', padding: '0.5rem' }

export default UserProfilePage