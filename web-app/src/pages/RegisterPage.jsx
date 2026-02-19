import * as userAccountService from '../services/userAccount.service'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../components/PublicNavbar'

const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

const handleRegister = async () => {
  try {
    await userAccountService.registerUserAccount(username, email, password)
    navigate('/login')
  } catch (err) {
    console.error(err.message)
  }
}

  return (
    <div>
      <PublicNavbar />
      <div style={{ padding: '2rem' }}>
        <h1>Register</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
          <button onClick={handleRegister}>Register</button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage