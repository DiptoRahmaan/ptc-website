import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const API_BASE_URL = '/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred')
      }

      return data
    } catch (error) {
      console.error('API call error:', error)
      throw error
    }
  }

  // Verify token and get user info
  const verifyToken = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const data = await apiCall('/auth/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })

      if (data.valid) {
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (credentials) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      })

      return { success: true }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return { success: false, error: error.message }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      
      toast({
        title: 'Success',
        description: 'Account created successfully',
      })

      return { success: true }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return { success: false, error: error.message }
    }
  }

  // Google login function
  const googleLogin = async (googleToken) => {
    try {
      const data = await apiCall('/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({ token: googleToken }),
      })

      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      
      toast({
        title: 'Success',
        description: 'Logged in with Google successfully',
      })

      return { success: true }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    
    toast({
      title: 'Success',
      description: 'Logged out successfully',
    })
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const data = await apiCall('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      })

      setUser(data.user)
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })

      return { success: true }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return { success: false, error: error.message }
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await apiCall('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      })
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      })

      return { success: true }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    verifyToken()
  }, [token])

  const value = {
    user,
    loading,
    token,
    setToken: (newToken) => {
      if (newToken) {
        localStorage.setItem('token', newToken)
        setToken(newToken)
      } else {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    },
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
    apiCall,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

