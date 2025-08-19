import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../hooks/use-toast'
import { 
  ClipboardList, 
  Search, 
  Filter,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  ExternalLink,
  User,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react'

const AdminTasks = () => {
  const { user, apiCall } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({})

  useEffect(() => {
    fetchTasks()
  }, [currentPage, statusFilter])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 20,
        search: searchTerm,
        status: statusFilter
      })
      
      const data = await apiCall(`/admin/tasks?${params}`)
      setTasks(data.tasks || [])
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskDetails = async (taskId) => {
    try {
      const data = await apiCall(`/admin/tasks/${taskId}`)
      setSelectedTask(data.task)
      setTaskDetailOpen(true)
    } catch (error) {
      console.error('Error fetching task details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch task details",
        variant: "destructive"
      })
    }
  }

  const handleTaskAction = async (taskId, action, reason = '') => {
    try {
      await apiCall(`/admin/tasks/${taskId}/${action}`, 'POST', { reason })
      toast({
        title: "Success",
        description: `Task ${action}d successfully`,
        variant: "default"
      })
      fetchTasks()
      if (selectedTask && selectedTask.id === taskId) {
        fetchTaskDetails(taskId)
      }
    } catch (error) {
      console.error(`Error ${action} task:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} task`,
        variant: "destructive"
      })
    }
  }

  const handleEditTask = async () => {
    if (!selectedTask) return

    try {
      await apiCall(`/admin/tasks/${selectedTask.id}`, 'PUT', editFormData)
      toast({
        title: "Success",
        description: "Task updated successfully",
        variant: "default"
      })
      setEditTaskOpen(false)
      fetchTasks()
      fetchTaskDetails(selectedTask.id)
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (task) => {
    setEditFormData({
      title: task.title,
      description: task.description,
      link: task.link,
      reward_per_click: task.reward_per_click,
      total_budget: task.total_budget,
      is_active: task.is_active
    })
    setEditTaskOpen(true)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchTasks()
  }

  const getStatusBadge = (task) => {
    switch (task.status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return task.is_active 
          ? <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
          : <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'completed':
        return <Badge variant="secondary"><Check className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">{task.status}</Badge>
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Management</h1>
        <p className="text-gray-600">Review and manage published tasks and advertisements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'approved' && t.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${tasks.reduce((sum, t) => sum + (t.total_budget || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All tasks combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, description, or publisher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Tasks ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Loading tasks..." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Publisher</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Completions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {task.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-400" />
                            {task.publisher_username || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(task)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            ${(task.reward_per_click || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${(task.total_budget || 0).toFixed(2)}</div>
                            <div className="text-sm text-gray-500">
                              ${(task.remaining_budget || 0).toFixed(2)} left
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{task.current_completions || 0}</div>
                            <div className="text-sm text-gray-500">
                              / {task.max_completions || '∞'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(task.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchTaskDetails(task.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {task.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTaskAction(task.id, 'approve')}
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTaskAction(task.id, 'reject')}
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}

                            {task.status === 'approved' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog open={taskDetailOpen} onOpenChange={setTaskDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              Detailed information and actions for task: {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6">
              {/* Task Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Title:</strong> {selectedTask.title}</div>
                    <div><strong>Description:</strong> {selectedTask.description}</div>
                    <div><strong>Link:</strong> 
                      <a href={selectedTask.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                        <ExternalLink className="h-4 w-4 inline" />
                        Visit Link
                      </a>
                    </div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedTask)}</div>
                    <div><strong>Created:</strong> {new Date(selectedTask.created_at).toLocaleDateString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Reward per Click:</strong> ${(selectedTask.reward_per_click || 0).toFixed(2)}</div>
                    <div><strong>Total Budget:</strong> ${(selectedTask.total_budget || 0).toFixed(2)}</div>
                    <div><strong>Remaining Budget:</strong> ${(selectedTask.remaining_budget || 0).toFixed(2)}</div>
                    <div><strong>Spent:</strong> ${((selectedTask.total_budget || 0) - (selectedTask.remaining_budget || 0)).toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedTask.current_completions || 0}</div>
                      <div className="text-sm text-gray-600">Completions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedTask.max_completions || '∞'}</div>
                      <div className="text-sm text-gray-600">Max Completions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedTask.max_completions 
                          ? Math.round((selectedTask.current_completions / selectedTask.max_completions) * 100)
                          : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          onClick={() => handleTaskAction(selectedTask.id, 'approve')}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve Task
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleTaskAction(selectedTask.id, 'reject')}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject Task
                        </Button>
                      </>
                    )}

                    {selectedTask.status === 'approved' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => openEditDialog(selectedTask)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </Button>
                        {selectedTask.is_active ? (
                          <Button
                            variant="outline"
                            onClick={() => handleTaskAction(selectedTask.id, 'pause')}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Pause Task
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleTaskAction(selectedTask.id, 'activate')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate Task
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Modify task details and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                placeholder="Task title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="Task description"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Link</label>
              <Input
                value={editFormData.link || ''}
                onChange={(e) => setEditFormData({...editFormData, link: e.target.value})}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reward per Click ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.reward_per_click || ''}
                  onChange={(e) => setEditFormData({...editFormData, reward_per_click: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Total Budget ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.total_budget || ''}
                  onChange={(e) => setEditFormData({...editFormData, total_budget: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select 
                value={editFormData.is_active ? 'active' : 'inactive'} 
                onValueChange={(value) => setEditFormData({...editFormData, is_active: value === 'active'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditTaskOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTask}>
                <Edit className="h-4 w-4 mr-2" />
                Update Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminTasks

