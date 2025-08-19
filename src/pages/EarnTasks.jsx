import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Search, 
  Clock, 
  Coins, 
  ExternalLink,
  Filter,
  RefreshCw,
  Eye,
  Timer
} from 'lucide-react'

const EarnTasks = () => {
  const { apiCall } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [currentPage])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await apiCall(`/tasks/available?page=${currentPage}&per_page=12`)
      setTasks(data.tasks || [])
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTasks()
    setRefreshing(false)
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && tasks.length === 0) {
    return <LoadingSpinner text="Loading available tasks..." />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earn Money</h1>
        <p className="text-gray-600">
          Complete simple tasks and earn money instantly
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {task.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {task.description}
                      </CardDescription>
                    </div>
                    <Badge className="ml-2">
                      ${parseFloat(task.reward_per_click).toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Task Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 mr-1" />
                        {task.timer_duration}s timer
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {task.current_completions} completed
                      </div>
                    </div>

                    {/* Publisher Info */}
                    <div className="text-sm text-gray-500">
                      By: {task.publisher_username}
                    </div>

                    {/* Budget Info */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{
                          width: `${((task.total_budget - task.remaining_budget) / task.total_budget) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      ${parseFloat(task.remaining_budget).toFixed(2)} remaining of ${parseFloat(task.total_budget).toFixed(2)}
                    </div>

                    {/* Action Button */}
                    <Link to={`/task/${task.id}`} className="block">
                      <Button className="w-full">
                        <Coins className="mr-2 h-4 w-4" />
                        Start Task
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No tasks found' : 'No available tasks'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or check back later.'
                : 'Check back later for new earning opportunities.'
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">1. Choose a Task</h4>
              <p className="text-sm text-gray-600">
                Browse available tasks and select one that interests you
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Timer className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">2. Complete the Task</h4>
              <p className="text-sm text-gray-600">
                Visit the link and wait for the timer to complete
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Coins className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">3. Get Paid</h4>
              <p className="text-sm text-gray-600">
                Earn money instantly credited to your wallet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EarnTasks

