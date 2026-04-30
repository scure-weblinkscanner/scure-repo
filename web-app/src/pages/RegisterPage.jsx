import * as userAccountService from '../services/userAccount.service'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../components/PublicNavbar'
import backgroundWebsite from '../assets/background-website.jpg'
import { Link } from 'react-router-dom'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/

const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    const errs = {}
    if (!username.trim()) errs.username = 'Username is required.'
    else if (!usernameRegex.test(username.trim())) errs.username = 'Username must be 3–20 characters and contain only letters, numbers, or underscores.'
    if (!email.trim()) errs.email = 'Email is required.'
    else if (!emailRegex.test(email.trim())) errs.email = 'Please enter a valid email address.'
    if (!password) errs.password = 'Password is required.'
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    setError(null)
    setLoading(true)
    try {
      await userAccountService.registerUserAccount(username, email, password)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    color: '#fff',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(5,5,15,0.78), rgba(5,5,15,0.78)), url(${backgroundWebsite})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <PublicNavbar />

      {/* blue radial glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14,14,149,0.4) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
        padding: '40px 24px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px 36px',
          backdropFilter: 'blur(12px)',
        }}>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Bodoni Moda', serif",
            fontSize: 32, fontWeight: 700,
            margin: '0 0 6px', textAlign: 'center',
          }}>
            Create account
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.4)', fontSize: 14,
            textAlign: 'center', margin: '0 0 32px',
          }}>
            Join Scure and start scanning safely
          </p>

          {/* Username */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              placeholder="yourname"
              value={username}
              onChange={e => { setUsername(e.target.value); setFieldErrors(prev => ({ ...prev, username: undefined })) }}
              style={{ ...inputStyle, borderColor: fieldErrors.username ? 'rgba(255,107,107,0.6)' : 'rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = fieldErrors.username ? 'rgba(255,107,107,0.8)' : 'rgba(14,14,149,0.7)'}
              onBlur={e => e.target.style.borderColor = fieldErrors.username ? 'rgba(255,107,107,0.6)' : 'rgba(255,255,255,0.1)'}
            />
            {fieldErrors.username && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#FF6B6B' }}>{fieldErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })) }}
              style={{ ...inputStyle, borderColor: fieldErrors.email ? 'rgba(255,107,107,0.6)' : 'rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = fieldErrors.email ? 'rgba(255,107,107,0.8)' : 'rgba(14,14,149,0.7)'}
              onBlur={e => e.target.style.borderColor = fieldErrors.email ? 'rgba(255,107,107,0.6)' : 'rgba(255,255,255,0.1)'}
            />
            {fieldErrors.email && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#FF6B6B' }}>{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })) }}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              style={{ ...inputStyle, borderColor: fieldErrors.password ? 'rgba(255,107,107,0.6)' : 'rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = fieldErrors.password ? 'rgba(255,107,107,0.8)' : 'rgba(14,14,149,0.7)'}
              onBlur={e => e.target.style.borderColor = fieldErrors.password ? 'rgba(255,107,107,0.6)' : 'rgba(255,255,255,0.1)'}
            />
            {fieldErrors.password && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#FF6B6B' }}>{fieldErrors.password}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,107,107,0.1)',
              border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: 10, padding: '10px 14px',
              marginBottom: 16,
            }}>
              <span style={{ color: '#FF6B6B', fontSize: 13 }}>⚠ {error}</span>
            </div>
          )}

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%',
              background: '#0E0E95',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '14px 0',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#1a1ab0' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#0E0E95' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Login link */}
          <p style={{
            textAlign: 'center', marginTop: 20,
            fontSize: 14, color: 'rgba(255,255,255,0.35)',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default RegisterPage