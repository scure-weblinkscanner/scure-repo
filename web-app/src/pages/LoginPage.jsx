import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../components/PublicNavbar'
import { loginUserAccount } from '../services/userAccount.service'
import backgroundWebsite from '../assets/background-website.jpg'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loginAs, setLoginAs] = useState('user')
  const navigate = useNavigate()

const handleLogin = async () => {
  try {
    const { token, account } = await loginUserAccount(email, password, loginAs)
    sessionStorage.setItem('user', JSON.stringify(account))
    sessionStorage.setItem('token', token)
    if (loginAs === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/dashboard')
    }
  } catch (err) {
    setError(err.message)
  }
}

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(5,5,15,0.78), rgba(5,5,15,0.78)), url(${backgroundWebsite})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
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
            fontSize: 32,
            fontWeight: 700,
            margin: '0 0 6px',
            textAlign: 'center',
          }}>
            Welcome back
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 14,
            textAlign: 'center',
            margin: '0 0 32px',
          }}>
            Sign in to your Scure account
          </p>

          {/* Login As */}
          <div style={{ marginBottom: 28 }}>
            <p style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              margin: '0 0 12px',
            }}>
              Login as
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { value: 'user', label: 'User', icon: '👤' },
                { value: 'admin', label: 'Admin', icon: '🛡️' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setLoginAs(option.value)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 12px',
                    background: loginAs === option.value ? 'rgba(14,14,149,0.3)' : 'rgba(255,255,255,0.03)',
                    border: loginAs === option.value ? '1px solid rgba(14,14,149,0.7)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ fontSize: 24 }}>{option.icon}</span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: loginAs === option.value ? '#fff' : 'rgba(255,255,255,0.45)',
                  }}>
                    {option.label}
                  </span>
                  {loginAs === option.value && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: '#4AFF91',
                      display: 'block',
                    }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 8,
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
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
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(14,14,149,0.7)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 8,
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{
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
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(14,14,149,0.7)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
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

          {/* Login Button */}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              background: '#0E0E95',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '14px 0',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#1a1ab0'}
            onMouseLeave={e => e.target.style.background = '#0E0E95'}
          >
            Sign In as {loginAs === 'admin' ? 'Admin' : 'User'}
          </button>

          {/* Register link */}
          <p style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 14,
            color: 'rgba(255,255,255,0.35)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default LoginPage