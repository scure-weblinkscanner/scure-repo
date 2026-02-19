import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../components/PublicNavbar'
import { loginUserAccount } from '../services/userAccount.service'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const account = await loginUserAccount(email, password)

      // check if user is admin via their profile
      if (account.uaUserProfileId !== 1) {
        setError('Access denied. Admins only.')
        return
      }

      // store account in session for later use
      sessionStorage.setItem('user', JSON.stringify(account))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <PublicNavbar />
      <div style={{ padding: '2rem' }}>
        <h1>Admin Login</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage