import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage({ auth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    bio: '',
    role: 'student'
  })
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    const result = await auth.register(form)
    if (!result.success) {
      setMessage(result.message || 'Could not register')
      return
    }
    setMessage('Registration successful! Please log in.')
    navigate('/login')
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <h1>Join the Learning Platform</h1>
        {message && <p className="success">{message}</p>}
        {auth.error && <p className="error">{auth.error}</p>}
        <form onSubmit={handleSubmit}>
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <label className="role-label">
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </label>
          <button type="submit" disabled={auth.loading}>{auth.loading ? 'Registering…' : 'Register'}</button>
        </form>
        <p className="secondary">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}
