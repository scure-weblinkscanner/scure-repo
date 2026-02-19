import { Link, useNavigate } from 'react-router-dom'

const AdminNavbar = () => {
  const navigate = useNavigate()

    const handleLogout = () => {
    sessionStorage.removeItem('user')
    navigate('/login')
    }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Scure</span>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/user-accounts">User Accounts</Link>
      <Link to="/user-profiles">User Profiles</Link>
      <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout</button>
    </nav>
  )
}

export default AdminNavbar