import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

function ProtectedRoute({ auth, children }) {
  return auth.token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const auth = useAuth()

  if (auth.loading) {
    return <div className="page centered"><div className="card loading-card">Loading session…</div></div>
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage auth={auth} />} />
      <Route path="/register" element={<RegisterPage auth={auth} />} />
      <Route path="/" element={<ProtectedRoute auth={auth}><DashboardPage auth={auth} /></ProtectedRoute>} />
    </Routes>
  )
}
