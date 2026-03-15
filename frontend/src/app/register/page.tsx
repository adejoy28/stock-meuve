'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Enter your name'); return }
    if (!email && !username && !phone) { setError('Provide at least one of: email, username, or phone'); return }
    if (!password) { setError('Enter a password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim()    || undefined,
        username: username.trim() || undefined,
        phone: phone.trim()    || undefined,
        password,
        password_confirmation: confirmPassword,
      })
      router.replace('/')
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">C</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-sm text-gray-400 mt-1">Start managing your stock today</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 max-w-sm mx-auto w-full">

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
              placeholder="Your full name..."
            />
          </div>

          {/* Login identifiers section */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Login details — fill at least one
            </p>
            <div className="space-y-3">

              {/* Email */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="e.g. john_driver"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="+234 800 000 0000"
                />
              </div>

            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-orange-500"
                placeholder="Min. 6 characters..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full h-12 px-4 border rounded-xl text-sm placeholder-gray-400 focus:outline-none ${
                confirmPassword && confirmPassword !== password
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-gray-200 focus:border-orange-500'
              }`}
              placeholder="Repeat your password..."
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-orange-500 text-white text-sm font-semibold rounded-xl active:opacity-70 disabled:opacity-40 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-8 pb-8">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 font-semibold">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
