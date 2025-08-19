import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EarnTasks from './pages/EarnTasks'
import TaskView from './pages/TaskView'
import PublishTask from './pages/PublishTask'
import MyTasks from './pages/MyTasks'
import Wallet from './pages/Wallet'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminTasks from './pages/AdminTasks'
import AdminWallet from './pages/AdminWallet'
import AdminSettings from './pages/AdminSettings'
import AdminTestPage from './pages/AdminTestPage'

import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              
              {/* Protected User Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/earn" 
                element={
                  <ProtectedRoute>
                    <EarnTasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/task/:id" 
                element={
                  <ProtectedRoute>
                    <TaskView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/publish" 
                element={
                  <ProtectedRoute>
                    <PublishTask />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-tasks" 
                element={
                  <ProtectedRoute>
                    <MyTasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deposit" 
                element={
                  <ProtectedRoute>
                    <Deposit />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/withdraw" 
                element={
                  <ProtectedRoute>
                    <Withdraw />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/tasks" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminTasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/wallet" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminWallet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminSettings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Test Route (for development) */}
              <Route path="/admin-test" element={<AdminTestPage />} />
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  )
}

export default App

