import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const PublicNavbar = () => {
  const navigate = useNavigate()

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
    onClick={() => navigate('/')}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
    }}
  >
    <img
      src={logo}
      alt="Scure"
      style={{ width: 36, height: 36 }}
    />
    <span
      style={{
        fontFamily: "'Bodoni Moda', serif",
        fontWeight: 500,
        fontSize: 22,
        color: '#fff',
        letterSpacing: 1,
      }}
    >
      Scure
    </span>
  </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: '8px 20px',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.target.style.color = '#fff'
            e.target.style.borderColor = 'rgba(255,255,255,0.3)'
          }}
          onMouseLeave={e => {
            e.target.style.color = 'rgba(255,255,255,0.65)'
            e.target.style.borderColor = 'rgba(255,255,255,0.12)'
          }}
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          style={{
            background: '#0E0E95',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '8px 20px',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = '#1a1ab0'}
          onMouseLeave={e => e.target.style.background = '#0E0E95'}
        >
          Register
        </button>
      </div>
    </nav>
  )
}

export default PublicNavbar