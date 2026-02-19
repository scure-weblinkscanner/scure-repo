import { useNavigate } from 'react-router-dom'

const PublicNavbar = () => {
  const navigate = useNavigate()

  return (
    <nav style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Scure</span>
      <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </nav>
  )
}

export default PublicNavbar