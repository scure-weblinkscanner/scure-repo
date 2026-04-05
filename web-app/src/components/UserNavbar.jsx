import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

const UserNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    navigate('/login')
  }

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
  ]

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
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <img src={logo} alt="Scure" style={{ width: 36, height: 36 }} />
        <span style={{
          fontFamily: "'Bodoni Moda', serif",
          fontWeight: 500, fontSize: 22,
          color: '#fff', letterSpacing: 1,
        }}>
          Scure
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ marginLeft: 32, display: 'flex', alignItems: 'center', gap: 4 }}>
        {navLinks.map(link => {
          const isActive = location.pathname === link.path
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {link.label}
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <div style={{ marginLeft: 'auto' }}>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,107,107,0.08)',
            color: '#FF6B6B',
            border: '1px solid rgba(255,107,107,0.2)',
            borderRadius: 8,
            padding: '7px 18px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,107,107,0.15)'
            e.currentTarget.style.borderColor = 'rgba(255,107,107,0.35)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,107,107,0.08)'
            e.currentTarget.style.borderColor = 'rgba(255,107,107,0.2)'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default UserNavbar