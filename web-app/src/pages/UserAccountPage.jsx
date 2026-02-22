import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as userAccountService from '../services/userAccount.service'
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

const UserAccountPage = () => {
  const [accounts, setAccounts] = useState([])
  const [viewingAccount, setViewingAccount] = useState(null)
  const [updatingAccount, setUpdatingAccount] = useState(null)
  const [deletingAccount, setDeletingAccount] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  // for creating user account
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // for updating user account
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchAccounts()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const fetchAccounts = async () => {
    try {
      const data = await userAccountService.getAllUserAccounts()
      setAccounts(data)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleCreate = async () => {
    try {
      await userAccountService.registerUserAccount(newUsername, newEmail, newPassword)
      setShowCreateModal(false)
      setNewUsername('')
      setNewEmail('')
      setNewPassword('')
      fetchAccounts()
      showToast('Account created successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleUpdate = async () => {
    try {
      const updates = {
        uaUsername: editUsername,
        uaEmail: editEmail,
      }
      if (editPassword.trim()) {
        updates.uaPasswordHash = editPassword
      }
      await userAccountService.updateUserAccount(updatingAccount.uaId, updates)
      setUpdatingAccount(null)
      fetchAccounts()
      showToast('Account updated successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (uaId) => {
    try {
      await userAccountService.deleteUserAccount(uaId)
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

  return (
    <div>
      <AdminNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* View Modal */}
      {viewingAccount && (
        <Modal onClose={() => setViewingAccount(null)}>
          <h2 style={styles.modalTitle}>Account Details</h2>
          <p><strong>ID:</strong> {viewingAccount.uaId}</p>
          <p><strong>Username:</strong> {viewingAccount.uaUsername}</p>
          <p><strong>Email:</strong> {viewingAccount.uaEmail}</p>
          <p><strong>Profile ID:</strong> {viewingAccount.uaUserProfileId}</p>
          <p><strong>Created At:</strong> {new Date(viewingAccount.uaCreatedAt).toLocaleDateString()}</p>
          <div style={styles.modalButtons}>
            <button style={styles.updateBtn} onClick={() => openUpdate(viewingAccount)}>Update</button>
            <button style={styles.cancelBtn} onClick={() => setViewingAccount(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Update Modal */}
      {updatingAccount && (
        <Modal onClose={() => setUpdatingAccount(null)}>
          <h2 style={styles.modalTitle}>Update Account</h2>
          <div style={styles.formGroup}>
            <label>Username</label>
            <input style={styles.input} value={editUsername} onChange={e => setEditUsername(e.target.value)} />
          </div>
          <div style={styles.formGroup}>
            <label>Email</label>
            <input style={styles.input} value={editEmail} onChange={e => setEditEmail(e.target.value)} />
          </div>
          <div style={styles.formGroup}>
            <label>New Password <span style={{ color: '#888', fontSize: '12px' }}>(leave blank to keep current)</span></label>
            <input style={styles.input} type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Enter new password" />
          </div>
          <div style={styles.modalButtons}>
            <button style={styles.updateBtn} onClick={handleUpdate}>Submit</button>
            <button style={styles.cancelBtn} onClick={() => setUpdatingAccount(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <h2 style={styles.modalTitle}>Create Account</h2>
          <div style={styles.formGroup}>
            <label>Username</label>
            <input style={styles.input} value={newUsername} onChange={e => setNewUsername(e.target.value)} />
          </div>
          <div style={styles.formGroup}>
            <label>Email</label>
            <input style={styles.input} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          </div>
          <div style={styles.formGroup}>
            <label>Password</label>
            <input style={styles.input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div style={styles.modalButtons}>
            <button style={styles.updateBtn} onClick={handleCreate}>Submit</button>
            <button style={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deletingAccount && (
        <Modal onClose={() => setDeletingAccount(null)}>
          <h2 style={styles.modalTitle}>Delete Account</h2>
          <p>Are you sure you want to delete <strong>{deletingAccount.uaUsername}</strong>? This action cannot be undone.</p>
          <div style={styles.modalButtons}>
            <button style={styles.deleteBtn} onClick={() => handleDelete(deletingAccount.uaId)}>Confirm Delete</button>
            <button style={styles.cancelBtn} onClick={() => setDeletingAccount(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      <div style={{ padding: '2rem' }}>
        <h1>User Accounts</h1>
        <button onClick={() => setShowCreateModal(true)} style={{ marginBottom: '1rem' }}>
          + Create Account
        </button>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.uaId}>
                <td style={tdStyle}>{account.uaId}</td>
                <td style={tdStyle}>{account.uaUsername}</td>
                <td style={tdStyle}>
                  <button onClick={() => setViewingAccount(account)}>View</button>
                  <button onClick={() => setDeletingAccount(account)} style={{ marginLeft: '0.5rem', color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>No accounts found</td></tr>
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

export default UserAccountPage