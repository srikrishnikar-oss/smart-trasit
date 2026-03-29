import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleLogin() {
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    setError('')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">🚌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">SmartTransit</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400"
            />
          </div>

          <div className="mb-1">
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400"
            />
          </div>

          <p className="text-xs text-blue-600 text-right mb-4 cursor-pointer">Forgot password?</p>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white text-sm py-3 rounded-xl font-medium mb-3"
          >
            Sign in
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="w-full border border-gray-200 text-gray-600 text-sm py-3 rounded-xl font-medium"
          >
            Create an account
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          By signing in you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}