'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loginUser, registerUser, logoutUser } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'

interface User {
  id: number
  name: string
  email?: string
  username?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (login: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

interface RegisterData {
  name: string
  email?: string
  username?: string
  phone?: string
  password: string
  password_confirmation: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('charly_token')
    const savedUser = localStorage.getItem('charly_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('charly_token')
        localStorage.removeItem('charly_user')
      }
    }
    setLoading(false)
  }, [])

  const saveSession = (userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('charly_token', userToken)
    localStorage.setItem('charly_user', JSON.stringify(userData))
  }

  const clearSession = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('charly_token')
    localStorage.removeItem('charly_user')
  }

  const login = async (loginField: string, password: string) => {
    try {
      console.log('AuthContext: Calling loginUser API...')
      const response = await loginUser({ login: loginField, password })
      console.log('AuthContext: API response:', response.data)
      const { user: userData, token: userToken } = response.data.data
      console.log('AuthContext: Extracted user data:', userData, 'Token:', userToken.substring(0, 20) + '...')
      saveSession(userData, userToken)
      console.log('AuthContext: Session saved successfully')
    } catch (error) {
      console.error('AuthContext: Login failed:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
  const payload: any = {
    name:                  data.name,
    password:              data.password,
    password_confirmation: data.password_confirmation,
  }

  if (data.email)    payload.email    = data.email
  if (data.username) payload.username = data.username
  if (data.phone)    payload.phone    = data.phone

  const response = await registerUser(payload)
  const { user: userData, token: userToken } = response.data.data
  saveSession(userData, userToken)
}

  const logout = async () => {
    try {
      await logoutUser()
    } catch {
      // Even if API call fails, clear local session
    } finally {
      clearSession()
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
