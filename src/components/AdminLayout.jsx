import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Wallet, 
  Settings,
  ChevronRight
} from 'lucide-react'

const AdminLayout = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()

  const adminNavItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and statistics'
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: Users,
      description: 'Manage user accounts'
    },
    {
      path: '/admin/tasks',
      label: 'Task Management',
      icon: ClipboardList,
      description: 'Review and manage tasks'
    },
    {
      path: '/admin/wallet',
      label: 'Wallet & Transactions',
      icon: Wallet,
      description: 'Manage deposits and withdrawals'
    },
    {
      path: '/admin/settings',
      label: 'System Settings',
      icon: Settings,
      description: 'Configure system settings'
    }
  ]

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  if (!user?.is_admin) {
    return children
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                      {active && (
                        <ChevronRight className="ml-2 h-4 w-4 text-blue-500" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <div className="lg:hidden">
        {/* Mobile navigation can be added here if needed */}
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

