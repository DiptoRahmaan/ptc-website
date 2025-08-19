import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  PlusCircle, 
  Eye, 
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const Dashboard = () => {
  const { user, apiCall, setToken } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check for JWT token in URL parameters (from Google OAuth callback)
    const urlParams = new URLSearchParams(location.search)
    const token = urlParams.get('token')
    
    if (token) {
      // Store the token and remove it from URL
      setToken(token)
      navigate('/dashboard', { replace: true })
    }
    
    fetchDashboardData()
  }, [location, navigate, setToken])

  const fetchDashboardData = async () => {
    try {
      const data = await apiCall('/dashboard')
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  const wallet = dashboardData?.wallet || {}
  const recentCompletions = dashboardData?.recent_completions || []
  const publishedTasks = dashboardData?.published_tasks || []
  const availableTasksCount = dashboardData?.available_tasks_count || 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-gray-600">
          Here's your PTC Pro dashboard overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(wallet.balance || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(wallet.total_earned || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tasks</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTasksCount}</div>
            <p className="text-xs text-muted-foreground">
              Ready to complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Your active campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/earn" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Coins className="mr-2 h-4 w-4" />
                Browse Available Tasks
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            
            <Link to="/publish" className="block">
              <Button className="w-full justify-start" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Publish New Task
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            
            <Link to="/wallet" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                Manage Wallet
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Completions</CardTitle>
            <CardDescription>
              Your latest task completions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCompletions.length > 0 ? (
              <div className="space-y-4">
                {recentCompletions.map((completion) => (
                  <div key={completion.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">{completion.task_title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(completion.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      +${parseFloat(completion.reward_amount).toFixed(2)}
                    </Badge>
                  </div>
                ))}
                <Link to="/earn">
                  <Button variant="outline" className="w-full">
                    View All Tasks
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No completions yet</p>
                <Link to="/earn">
                  <Button>Start Earning Now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Published Tasks */}
      {publishedTasks.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Published Tasks</CardTitle>
            <CardDescription>
              Monitor your active campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publishedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Reward: ${parseFloat(task.reward_per_click).toFixed(2)}</span>
                      <span>Budget: ${parseFloat(task.remaining_budget).toFixed(2)} remaining</span>
                      <span>Completions: {task.current_completions}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={task.status === 'approved' ? 'default' : 
                               task.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Link to="/my-tasks">
                <Button variant="outline" className="w-full">
                  Manage All Tasks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard

