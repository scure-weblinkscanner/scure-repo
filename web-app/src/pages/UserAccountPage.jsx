import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as userAccountService from '../services/userAccount.service'
import AdminNavbar from '../components/AdminNavbar'

const UserAccountPage = () => {
  const [accounts, setAccounts] = useState([])
  const [viewingAccount, setViewingAccount] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const data = await userAccountService.getAllUserAccounts()
      setAccounts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreate = async () => {
    try {
      await userAccountService.registerUserAccount(newUsername, newEmail, newPassword)
      setSuccess('Account created successfully')
      setNewUsername('')
      setNewEmail('')
      setNewPassword('')
      setShowCreateForm(false)
      fetchAccounts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <AdminNavbar />
      <div style={{ padding: '2rem' }}>
        <h1>User Accounts</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        {viewingAccount && (
          <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', maxWidth: '300px' }}>
            <h3>Account Details</h3>
            <p><strong>ID:</strong> {viewingAccount.uaId}</p>
            <p><strong>Username:</strong> {viewingAccount.uaUsername}</p>
            <p><strong>Email:</strong> {viewingAccount.uaEmail}</p>
            <p><strong>Profile ID:</strong> {viewingAccount.uaUserProfileId}</p>
            <p><strong>Created At:</strong> {new Date(viewingAccount.uaCreatedAt).toLocaleDateString()}</p>
            <button onClick={() => setViewingAccount(null)}>Close</button>
          </div>
        )}

        <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ marginBottom: '1rem' }}>
          {showCreateForm ? 'Cancel' : '+ Create Account'}
        </button>

        {showCreateForm && (
          <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', maxWidth: '300px' }}>
            <h3>Create Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="text" placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              <input type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button onClick={handleCreate}>Create</button>
            </div>
          </div>
        )}

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

const thStyle = { border: '1px solid #ccc', padding: '0.5rem', textAlign: 'left' }
const tdStyle = { border: '1px solid #ccc', padding: '0.5rem' }

export default UserAccountPage