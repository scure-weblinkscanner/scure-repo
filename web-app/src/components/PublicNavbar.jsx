import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const PublicNavbar = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
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
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div
        onClick={() => navigate('/')}
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


      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}></div>

      {/* Home Link */}
      <button
        onClick={() => navigate('/')}
        style={{
          marginLeft: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.55)',
          fontFamily: "'DM Sans', sans-serif",
          padding: '4px 8px',
          borderRadius: 6,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
      >
        Home
      </button>

      {/* Profile Dropdown */}
      <div
        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 999,
          padding: '7px 14px 7px 10px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {/* Profile icon */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(14,14,149,0.5)',
            border: '1px solid rgba(14,14,149,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#fff',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          {/* Chevron */}
          <svg
            width="10" height="10"
            viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'rgba(10,10,25,0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, overflow: 'hidden',
            minWidth: 180,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{
              padding: '10px 16px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.3)', fontSize: 11,
                fontWeight: 600, letterSpacing: 1,
                textTransform: 'uppercase', margin: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Account
              </p>
            </div>

            {[
              { label: 'Login', route: '/login' },
              { label: 'Register', route: '/register' },
            ].map(item => (
              <button
                key={item.route}
                onClick={() => { navigate(item.route); setOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  background: 'transparent',
                  border: 'none', borderRadius: 0,
                  padding: '11px 16px',
                  fontSize: 14, fontWeight: 500,
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(14,14,149,0.3)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default PublicNavbar