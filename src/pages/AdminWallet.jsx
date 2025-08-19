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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../hooks/use-toast'
import { 
  Wallet, 
  Search, 
  Filter,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  CreditCard,
  Bitcoin
} from 'lucide-react'

const AdminWallet = () => {
  const { user, apiCall } = useAuth()
  const { toast } = useToast()
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [transactionDetailOpen, setTransactionDetailOpen] = useState(false)
  const [manualAdjustOpen, setManualAdjustOpen] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    user_id: '',
    amount: '',
    type: 'add',
    reason: ''
  })
  const [activeTab, setActiveTab] = useState('deposits')

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, statusFilter, activeTab])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const endpoint = activeTab === 'deposits' ? '/admin/deposits' : '/admin/withdrawals'
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 20,
        search: searchTerm,
        status: statusFilter
      })
      
      const data = await apiCall(`${endpoint}?${params}`)
      
      if (activeTab === 'deposits') {
        setDeposits(data.deposits || [])
      } else {
        setWithdrawals(data.withdrawals || [])
      }
      
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactionDetails = async (transactionId, type) => {
    try {
      const endpoint = type === 'deposit' ? `/admin/deposits/${transactionId}` : `/admin/withdrawals/${transactionId}`
      const data = await apiCall(endpoint)
      setSelectedTransaction({ ...data.transaction, type })
      setTransactionDetailOpen(true)
    } catch (error) {
      console.error('Error fetching transaction details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch transaction details",
        variant: "destructive"
      })
    }
  }

  const handleTransactionAction = async (transactionId, action, type) => {
    try {
      const endpoint = type === 'deposit' 
        ? `/admin/deposits/${transactionId}/${action}` 
        : `/admin/withdrawals/${transactionId}/${action}`
      
      await apiCall(endpoint, 'POST')
      toast({
        title: "Success",
        description: `Transaction ${action}d successfully`,
        variant: "default"
      })
      fetchTransactions()
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        fetchTransactionDetails(transactionId, type)
      }
    } catch (error) {
      console.error(`Error ${action} transaction:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} transaction`,
        variant: "destructive"
      })
    }
  }

  const handleManualAdjustment = async () => {
    try {
      const amount = parseFloat(adjustmentData.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive"
        })
        return
      }

      if (!adjustmentData.user_id || !adjustmentData.reason) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      const finalAmount = adjustmentData.type === 'subtract' ? -amount : amount
      
      await apiCall(`/admin/users/${adjustmentData.user_id}/adjust-balance`, 'POST', {
        amount: finalAmount,
        reason: adjustmentData.reason
      })

      toast({
        title: "Success",
        description: `Balance ${adjustmentData.type}ed successfully`,
        variant: "default"
      })

      setManualAdjustOpen(false)
      setAdjustmentData({ user_id: '', amount: '', type: 'add', reason: '' })
      fetchTransactions()
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
    fetchTransactions()
  }

  const getStatusBadge = (transaction) => {
    switch (transaction.status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'confirmed':
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
      case 'paid':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'rejected':
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{transaction.status}</Badge>
    }
  }

  const currentTransactions = activeTab === 'deposits' ? deposits : withdrawals

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet & Transactions</h1>
        <p className="text-gray-600">Manage deposits, withdrawals, and user balances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deposits.filter(d => d.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {withdrawals.filter(w => w.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${deposits.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + (d.amount || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Confirmed deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + (w.amount || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Paid withdrawals</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Balance Adjustment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Manual Balance Adjustment
          </CardTitle>
          <CardDescription>
            Manually adjust user wallet balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setManualAdjustOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adjust User Balance
          </Button>
        </CardContent>
      </Card>

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
                  placeholder="Search by user, transaction ID, or amount..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposits" className="mt-6">
              {loading ? (
                <LoadingSpinner text="Loading deposits..." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-gray-400" />
                              {deposit.user_username || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              ${(deposit.amount || 0).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Bitcoin className="h-4 w-4 text-gray-400" />
                              {deposit.currency || 'USD'}
                            </div>
                          </TableCell>
                          <TableCell>{deposit.network || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(deposit)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(deposit.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchTransactionDetails(deposit.id, 'deposit')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {deposit.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTransactionAction(deposit.id, 'confirm', 'deposit')}
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTransactionAction(deposit.id, 'reject', 'deposit')}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="withdrawals" className="mt-6">
              {loading ? (
                <LoadingSpinner text="Loading withdrawals..." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-gray-400" />
                              {withdrawal.user_username || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              ${(withdrawal.amount || 0).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Bitcoin className="h-4 w-4 text-gray-400" />
                              {withdrawal.currency || 'USD'}
                            </div>
                          </TableCell>
                          <TableCell>{withdrawal.network || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate text-sm">
                              {withdrawal.wallet_address || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(withdrawal)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(withdrawal.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchTransactionDetails(withdrawal.id, 'withdrawal')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {withdrawal.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTransactionAction(withdrawal.id, 'approve', 'withdrawal')}
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTransactionAction(withdrawal.id, 'reject', 'withdrawal')}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              
                              {withdrawal.status === 'approved' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTransactionAction(withdrawal.id, 'mark-paid', 'withdrawal')}
                                >
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>

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
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={transactionDetailOpen} onOpenChange={setTransactionDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedTransaction?.type} transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>ID:</strong> {selectedTransaction.id}</div>
                <div><strong>Type:</strong> {selectedTransaction.type}</div>
                <div><strong>User:</strong> {selectedTransaction.user_username || 'Unknown'}</div>
                <div><strong>Amount:</strong> ${(selectedTransaction.amount || 0).toFixed(2)}</div>
                <div><strong>Currency:</strong> {selectedTransaction.currency || 'USD'}</div>
                <div><strong>Network:</strong> {selectedTransaction.network || 'N/A'}</div>
                <div><strong>Status:</strong> {getStatusBadge(selectedTransaction)}</div>
                <div><strong>Date:</strong> {new Date(selectedTransaction.created_at).toLocaleDateString()}</div>
              </div>
              
              {selectedTransaction.wallet_address && (
                <div>
                  <strong>Wallet Address:</strong>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm break-all">
                    {selectedTransaction.wallet_address}
                  </div>
                </div>
              )}
              
              {selectedTransaction.transaction_hash && (
                <div>
                  <strong>Transaction Hash:</strong>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm break-all">
                    {selectedTransaction.transaction_hash}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedTransaction.status === 'pending' && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleTransactionAction(
                        selectedTransaction.id, 
                        selectedTransaction.type === 'deposit' ? 'confirm' : 'approve', 
                        selectedTransaction.type
                      )}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {selectedTransaction.type === 'deposit' ? 'Confirm' : 'Approve'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleTransactionAction(selectedTransaction.id, 'reject', selectedTransaction.type)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                
                {selectedTransaction.status === 'approved' && selectedTransaction.type === 'withdrawal' && (
                  <Button
                    variant="default"
                    onClick={() => handleTransactionAction(selectedTransaction.id, 'mark-paid', selectedTransaction.type)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Adjustment Dialog */}
      <Dialog open={manualAdjustOpen} onOpenChange={setManualAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Balance Adjustment</DialogTitle>
            <DialogDescription>
              Manually adjust a user's wallet balance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">User ID</label>
              <Input
                type="number"
                value={adjustmentData.user_id}
                onChange={(e) => setAdjustmentData({...adjustmentData, user_id: e.target.value})}
                placeholder="Enter user ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <Select 
                value={adjustmentData.type} 
                onValueChange={(value) => setAdjustmentData({...adjustmentData, type: value})}
              >
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
                value={adjustmentData.amount}
                onChange={(e) => setAdjustmentData({...adjustmentData, amount: e.target.value})}
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <Textarea
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                placeholder="Enter reason for adjustment"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setManualAdjustOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleManualAdjustment}>
                {adjustmentData.type === 'add' ? <Plus className="h-4 w-4 mr-2" /> : <Minus className="h-4 w-4 mr-2" />}
                {adjustmentData.type === 'add' ? 'Add' : 'Subtract'} ${adjustmentData.amount || '0.00'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminWallet

