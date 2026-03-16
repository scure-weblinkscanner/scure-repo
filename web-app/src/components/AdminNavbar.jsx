import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const AdminNavbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      height: 64,
      backgroundColor: 'rgba(5,5,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div
        onClick={() => navigate('/admin/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <img src={logo} alt="Scure" style={{ width: 36, height: 36 }} />
        <span style={{
          fontFamily: "'Bodoni Moda', serif",
          fontWeight: 700,
          fontSize: 22,
          color: '#fff',
          letterSpacing: 1,
        }}>
          Scure
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 32 }}>
        {[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'User Accounts', to: '/user-accounts' },
          { label: 'User Profiles', to: '/user-profiles' },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.color = '#fff'
              e.target.style.background = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={e => {
              e.target.style.color = 'rgba(255,255,255,0.55)'
              e.target.style.background = 'transparent'
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          marginLeft: 'auto',
          background: 'rgba(255,107,107,0.08)',
          color: '#FF6B6B',
          border: '1px solid rgba(255,107,107,0.2)',
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.target.style.background = 'rgba(255,107,107,0.15)'
          e.target.style.borderColor = 'rgba(255,107,107,0.4)'
        }}
        onMouseLeave={e => {
          e.target.style.background = 'rgba(255,107,107,0.08)'
          e.target.style.borderColor = 'rgba(255,107,107,0.2)'
        }}
      >
        Logout
      </button>
    </nav>
  )
}

export default AdminNavbar