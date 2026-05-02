import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UserAccountPage from './pages/UserAccountPage'
import UserProfilePage from './pages/UserProfilePage'
import TicketsPage from './pages/TicketsPage'
import UpgradePage from './pages/UpgradePage'
import RegisteredUserProfilePage from './pages/RegisteredUserProfilePage'
import { setOnUnauthorized } from './services/api'
import './App.css'

const AuthSetup = () => {
  const navigate = useNavigate()
  useEffect(() => {
    setOnUnauthorized(() => {
      sessionStorage.setItem('sessionExpired', '1')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      navigate('/login')
    })
  }, [navigate])
  return null
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthSetup />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/user-accounts" element={<UserAccountPage />} />
        <Route path="/user-profiles" element={<UserProfilePage />} />
        <Route path="/admin/tickets" element={<TicketsPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="/dashboard" element={<Navigate to="/profile" />} />
        <Route path="/profile" element={<RegisteredUserProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App