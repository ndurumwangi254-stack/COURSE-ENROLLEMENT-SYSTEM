import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage({ auth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await auth.login(form)
    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div className="page auth-page">
      <nav className="auth-navbar">
        <div className="brand">Course Enrollment System</div>
        <div className="nav-links">
          <Link to="/login">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>
      <div className="card auth-card">
        <h1>Course Enrollment</h1>
        {auth.error && <p className="error">{auth.error}</p>}
        <form onSubmit={handleSubmit}>
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" disabled={auth.loading}>{auth.loading ? 'Logging in…' : 'Login'}</button>
        </form>
        <p className="secondary">New here? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}
