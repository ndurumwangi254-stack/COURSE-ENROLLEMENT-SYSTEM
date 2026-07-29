import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return

    fetch('/api/me', {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage setToken={setToken} setUser={setUser} />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage user={user} token={token} /></ProtectedRoute>} />
    </Routes>
  )
}
