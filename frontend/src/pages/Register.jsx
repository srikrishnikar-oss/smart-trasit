import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleRegister() {
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirm) {
      setError('Please fill in all fields')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6">
        <div className="max-w-sm mx-auto w-full text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account created!</h2>
          <p className="text-sm text-gray-400 mb-6">You can now sign in to SmartTransit.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white text-sm py-3 rounded-xl font-medium"
          >
            Go to Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-10">

      {/* Logo */}
      <div className="text-center mb-6 max-w-sm mx-auto w-full">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-xl">🚌</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Create an account</h1>
        <p className="text-sm text-gray-400 mt-1">Join SmartTransit today</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-w-sm mx-auto w-full">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">Full name</label>
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Sri Krishnika R"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400"
          />
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400"
          />
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">Phone number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400"
          />
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => update('password', e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400"
          />
        </div>

        <div className="mb-5">
          <label className="text-xs text-gray-400 mb-1 block">Confirm password</label>
          <input
            type="password"
            value={form.confirm}
            onChange={e => update('confirm', e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400"
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white text-sm py-3 rounded-xl font-medium"
        >
          Create account
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-blue-600 cursor-pointer font-medium">
            Sign in
          </span>
        </p>
      </div>

    </div>
  )
}