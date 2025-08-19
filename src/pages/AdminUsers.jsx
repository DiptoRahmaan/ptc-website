import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../hooks/use-toast'
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  UserX,
  UserCheck,
  Shield,
  ShieldOff,
  DollarSign,
  Plus,
  Minus,
  MoreHorizontal,
  Calendar,
  Wallet
} from 'lucide-react'

const AdminUsers = () => {
  const { user, apiCall } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetailOpen, setUserDetailOpen] = useState(false)
  const [balanceAdjustOpen, setBalanceAdjustOpen] = useState(false)
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentType, setAdjustmentType] = useState('add')

  useEffect(() => {
    fetchUsers()
  }, [currentPage, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 20,
        search: searchTerm,
        status: statusFilter
      })
      
      const data = await apiCall(`/admin/users?${params}`)
      setUsers(data.users || [])
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId) => {
    try {
      const data = await apiCall(`/admin/users/${userId}`)
      setSelectedUser(data.user)
      setUserDetailOpen(true)
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive"
      })
    }
  }

  const handleUserAction = async (userId, action) => {
    try {
      await apiCall(`/admin/users/${userId}/${action}`, 'POST')
      toast({
        title: "Success",
        description: `User ${action} successfully`,
        variant: "default"
      })
      fetchUsers()
      if (selectedUser && selectedUser.id === userId) {
        fetchUserDetails(userId)
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive"
      })
    }
  }

  const handleBalanceAdjustment = async () => {
    if (!selectedUser || !adjustmentAmount) return

    try {
      const amount = parseFloat(adjustmentAmount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive"
        })
        return
      }

      const finalAmount = adjustmentType === 'subtract' ? -amount : amount
      
      await apiCall(`/admin/users/${selectedUser.id}/adjust-balance`, 'POST', {
        amount: finalAmount,
        reason: `Manual ${adjustmentType} by admin`
      })

      toast({
        title: "Success",
        description: `Balance ${adjustmentType}ed successfully`,
        variant: "default"
      })

      setBalanceAdjustOpen(false)
      setAdjustmentAmount('')
      fetchUsers()
      fetchUserDetails(selectedUser.id)
    } catch (error) {
      console.error('Error adjusting balance:', error)
      toast({
        title: "Error",
        description: "Failed to adjust balance",
        variant: "destructive"
      })
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchUsers()
  }

  const getStatusBadge = (user) => {
    if (user.is_suspended) {
      return <Badge variant="destructive">Suspended</Badge>
    }
    if (user.is_admin) {
      return <Badge variant="default">Admin</Badge>
    }
    if (user.is_active) {
      return <Badge variant="secondary">Active</Badge>
    }
    return <Badge variant="outline">Inactive</Badge>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts and permissions</p>
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
                  placeholder="Search by username, email, or name..."
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
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Loading users..." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Wallet Balance</TableHead>
                      <TableHead>Total Earned</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{userData.username}</div>
                            <div className="text-sm text-gray-500">
                              {userData.first_name} {userData.last_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{userData.email}</TableCell>
                        <TableCell>{getStatusBadge(userData)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Wallet className="h-4 w-4 text-gray-400" />
                            ${(userData.wallet?.balance || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          ${(userData.wallet?.total_earned || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(userData.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchUserDetails(userData.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {!userData.is_suspended ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(userData.id, 'suspend')}
                                disabled={userData.is_admin}
                              >
                                <UserX className="h-4 w-4 text-red-500" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(userData.id, 'unsuspend')}
                              >
                                <UserCheck className="h-4 w-4 text-green-500" />
                              </Button>
                            )}

                            {!userData.is_admin ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(userData.id, 'make-admin')}
                              >
                                <Shield className="h-4 w-4 text-blue-500" />
                              </Button>
                            ) : userData.id !== user.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(userData.id, 'remove-admin')}
                              >
                                <ShieldOff className="h-4 w-4 text-orange-500" />
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

      {/* User Detail Dialog */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information and actions for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Username:</strong> {selectedUser.username}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedUser)}</div>
                    <div><strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wallet Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Balance:</strong> ${(selectedUser.wallet?.balance || 0).toFixed(2)}</div>
                    <div><strong>Total Earned:</strong> ${(selectedUser.wallet?.total_earned || 0).toFixed(2)}</div>
                    <div><strong>Total Deposited:</strong> ${(selectedUser.wallet?.total_deposited || 0).toFixed(2)}</div>
                    <div><strong>Total Withdrawn:</strong> ${(selectedUser.wallet?.total_withdrawn || 0).toFixed(2)}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBalanceAdjustOpen(true)}
                      className="mt-2"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Adjust Balance
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Statistics */}
              {selectedUser.statistics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedUser.statistics.total_completions}</div>
                        <div className="text-sm text-gray-600">Tasks Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedUser.statistics.total_published}</div>
                        <div className="text-sm text-gray-600">Tasks Published</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">${selectedUser.statistics.total_earned.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Total Earned</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {!selectedUser.is_suspended ? (
                      <Button
                        variant="destructive"
                        onClick={() => handleUserAction(selectedUser.id, 'suspend')}
                        disabled={selectedUser.is_admin}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend User
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => handleUserAction(selectedUser.id, 'unsuspend')}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Unsuspend User
                      </Button>
                    )}

                    {!selectedUser.is_admin ? (
                      <Button
                        variant="outline"
                        onClick={() => handleUserAction(selectedUser.id, 'make-admin')}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Make Admin
                      </Button>
                    ) : selectedUser.id !== user.id && (
                      <Button
                        variant="outline"
                        onClick={() => handleUserAction(selectedUser.id, 'remove-admin')}
                      >
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Remove Admin
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Balance Adjustment Dialog */}
      <Dialog open={balanceAdjustOpen} onOpenChange={setBalanceAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust User Balance</DialogTitle>
            <DialogDescription>
              Manually adjust the wallet balance for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add to Balance</SelectItem>
                  <SelectItem value="subtract">Subtract from Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBalanceAdjustOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBalanceAdjustment}>
                {adjustmentType === 'add' ? <Plus className="h-4 w-4 mr-2" /> : <Minus className="h-4 w-4 mr-2" />}
                {adjustmentType === 'add' ? 'Add' : 'Subtract'} ${adjustmentAmount || '0.00'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminUsers

