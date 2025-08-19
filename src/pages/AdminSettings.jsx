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
import { Switch } from '@/components/ui/switch'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../hooks/use-toast'
import { 
  Settings, 
  Bitcoin,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Globe,
  DollarSign,
  Shield,
  Clock,
  Users,
  Mail,
  Database,
  Server,
  Eye,
  EyeOff
} from 'lucide-react'

const AdminSettings = () => {
  const { user, apiCall } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState({})
  const [cryptoNetworks, setCryptoNetworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState(null)
  const [networkDialogOpen, setNetworkDialogOpen] = useState(false)
  const [networkFormData, setNetworkFormData] = useState({
    name: '',
    symbol: '',
    currency: '',
    wallet_address: '',
    is_active: true,
    min_deposit: '',
    min_withdrawal: '',
    deposit_fee: '',
    withdrawal_fee: ''
  })
  const [activeTab, setActiveTab] = useState('general')
  const [showWalletAddress, setShowWalletAddress] = useState({})

  useEffect(() => {
    fetchSettings()
    fetchCryptoNetworks()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await apiCall('/admin/settings')
      setSettings(data.settings || {})
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCryptoNetworks = async () => {
    try {
      const data = await apiCall('/admin/crypto-networks')
      setCryptoNetworks(data.networks || [])
    } catch (error) {
      console.error('Error fetching crypto networks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch crypto networks",
        variant: "destructive"
      })
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      await apiCall('/admin/settings', 'PUT', { settings })
      toast({
        title: "Success",
        description: "Settings saved successfully",
        variant: "default"
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNetworkSave = async () => {
    try {
      if (selectedNetwork) {
        // Update existing network
        await apiCall(`/admin/crypto-networks/${selectedNetwork.id}`, 'PUT', networkFormData)
        toast({
          title: "Success",
          description: "Network updated successfully",
          variant: "default"
        })
      } else {
        // Create new network
        await apiCall('/admin/crypto-networks', 'POST', networkFormData)
        toast({
          title: "Success",
          description: "Network created successfully",
          variant: "default"
        })
      }
      
      setNetworkDialogOpen(false)
      setSelectedNetwork(null)
      setNetworkFormData({
        name: '',
        symbol: '',
        currency: '',
        wallet_address: '',
        is_active: true,
        min_deposit: '',
        min_withdrawal: '',
        deposit_fee: '',
        withdrawal_fee: ''
      })
      fetchCryptoNetworks()
    } catch (error) {
      console.error('Error saving network:', error)
      toast({
        title: "Error",
        description: "Failed to save network",
        variant: "destructive"
      })
    }
  }

  const handleNetworkDelete = async (networkId) => {
    if (!confirm('Are you sure you want to delete this network?')) return

    try {
      await apiCall(`/admin/crypto-networks/${networkId}`, 'DELETE')
      toast({
        title: "Success",
        description: "Network deleted successfully",
        variant: "default"
      })
      fetchCryptoNetworks()
    } catch (error) {
      console.error('Error deleting network:', error)
      toast({
        title: "Error",
        description: "Failed to delete network",
        variant: "destructive"
      })
    }
  }

  const openNetworkDialog = (network = null) => {
    if (network) {
      setSelectedNetwork(network)
      setNetworkFormData({
        name: network.name || '',
        symbol: network.symbol || '',
        currency: network.currency || '',
        wallet_address: network.wallet_address || '',
        is_active: network.is_active || false,
        min_deposit: network.min_deposit || '',
        min_withdrawal: network.min_withdrawal || '',
        deposit_fee: network.deposit_fee || '',
        withdrawal_fee: network.withdrawal_fee || ''
      })
    } else {
      setSelectedNetwork(null)
      setNetworkFormData({
        name: '',
        symbol: '',
        currency: '',
        wallet_address: '',
        is_active: true,
        min_deposit: '',
        min_withdrawal: '',
        deposit_fee: '',
        withdrawal_fee: ''
      })
    }
    setNetworkDialogOpen(true)
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleWalletVisibility = (networkId) => {
    setShowWalletAddress(prev => ({
      ...prev,
      [networkId]: !prev[networkId]
    }))
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure system settings and crypto networks</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading settings..." />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="financial">Financial Settings</TabsTrigger>
            <TabsTrigger value="crypto">Crypto Networks</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Site Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Name</label>
                    <Input
                      value={settings.site_name || ''}
                      onChange={(e) => updateSetting('site_name', e.target.value)}
                      placeholder="PTC Pro"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Description</label>
                    <Textarea
                      value={settings.site_description || ''}
                      onChange={(e) => updateSetting('site_description', e.target.value)}
                      placeholder="Professional PTC platform"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <Input
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => updateSetting('contact_email', e.target.value)}
                      placeholder="admin@ptcpro.fun"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Site Maintenance Mode</label>
                      <p className="text-xs text-gray-600">Disable site for maintenance</p>
                    </div>
                    <Switch
                      checked={settings.maintenance_mode || false}
                      onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Allow User Registration</label>
                      <p className="text-xs text-gray-600">Enable new user signups</p>
                    </div>
                    <Switch
                      checked={settings.allow_registration || true}
                      onCheckedChange={(checked) => updateSetting('allow_registration', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Email Verification Required</label>
                      <p className="text-xs text-gray-600">Require email verification for new users</p>
                    </div>
                    <Switch
                      checked={settings.email_verification_required || false}
                      onCheckedChange={(checked) => updateSetting('email_verification_required', checked)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Default User Role</label>
                    <Select 
                      value={settings.default_user_role || 'user'} 
                      onValueChange={(value) => updateSetting('default_user_role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="premium">Premium User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.max_login_attempts || 5}
                      onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Settings */}
          <TabsContent value="financial" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Task Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Task Reward ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.min_task_reward || 0.01}
                      onChange={(e) => updateSetting('min_task_reward', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Task Reward ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.max_task_reward || 10.00}
                      onChange={(e) => updateSetting('max_task_reward', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Task Timer Duration (seconds)</label>
                    <Input
                      type="number"
                      min="10"
                      max="300"
                      value={settings.task_timer_duration || 30}
                      onChange={(e) => updateSetting('task_timer_duration', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Auto-approve Tasks</label>
                      <p className="text-xs text-gray-600">Automatically approve new tasks</p>
                    </div>
                    <Switch
                      checked={settings.auto_approve_tasks || false}
                      onCheckedChange={(checked) => updateSetting('auto_approve_tasks', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Withdrawal Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Withdrawal ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.min_withdrawal || 5.00}
                      onChange={(e) => updateSetting('min_withdrawal', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Withdrawal ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.max_withdrawal || 1000.00}
                      onChange={(e) => updateSetting('max_withdrawal', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Withdrawal Fee (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={settings.withdrawal_fee_percent || 2.00}
                      onChange={(e) => updateSetting('withdrawal_fee_percent', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Auto-approve Withdrawals</label>
                      <p className="text-xs text-gray-600">Automatically approve withdrawal requests</p>
                    </div>
                    <Switch
                      checked={settings.auto_approve_withdrawals || false}
                      onCheckedChange={(checked) => updateSetting('auto_approve_withdrawals', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Crypto Networks */}
          <TabsContent value="crypto" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5" />
                  Crypto Networks
                </CardTitle>
                <CardDescription>
                  Manage supported cryptocurrency networks for deposits and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-medium">Configured Networks</h3>
                    <p className="text-sm text-gray-600">Manage your crypto payment networks</p>
                  </div>
                  <Button onClick={() => openNetworkDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Network
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Network</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Min Deposit</TableHead>
                        <TableHead>Min Withdrawal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cryptoNetworks.map((network) => (
                        <TableRow key={network.id}>
                          <TableCell>
                            <div className="font-medium">{network.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{network.symbol}</Badge>
                          </TableCell>
                          <TableCell>{network.currency}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="max-w-32 truncate text-sm">
                                {showWalletAddress[network.id] 
                                  ? network.wallet_address 
                                  : '••••••••••••••••••••••••••••••••••••••••'
                                }
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleWalletVisibility(network.id)}
                              >
                                {showWalletAddress[network.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>${(network.min_deposit || 0).toFixed(2)}</TableCell>
                          <TableCell>${(network.min_withdrawal || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            {network.is_active ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openNetworkDialog(network)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNetworkDelete(network.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Save Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="shadow-lg"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Network Dialog */}
      <Dialog open={networkDialogOpen} onOpenChange={setNetworkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedNetwork ? 'Edit Network' : 'Add New Network'}
            </DialogTitle>
            <DialogDescription>
              Configure cryptocurrency network settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Network Name</label>
                <Input
                  value={networkFormData.name}
                  onChange={(e) => setNetworkFormData({...networkFormData, name: e.target.value})}
                  placeholder="Bitcoin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Symbol</label>
                <Input
                  value={networkFormData.symbol}
                  onChange={(e) => setNetworkFormData({...networkFormData, symbol: e.target.value})}
                  placeholder="BTC"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <Input
                value={networkFormData.currency}
                onChange={(e) => setNetworkFormData({...networkFormData, currency: e.target.value})}
                placeholder="USDT"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Wallet Address</label>
              <Input
                value={networkFormData.wallet_address}
                onChange={(e) => setNetworkFormData({...networkFormData, wallet_address: e.target.value})}
                placeholder="Enter wallet address for receiving deposits"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Deposit ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={networkFormData.min_deposit}
                  onChange={(e) => setNetworkFormData({...networkFormData, min_deposit: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Withdrawal ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={networkFormData.min_withdrawal}
                  onChange={(e) => setNetworkFormData({...networkFormData, min_withdrawal: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Deposit Fee (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={networkFormData.deposit_fee}
                  onChange={(e) => setNetworkFormData({...networkFormData, deposit_fee: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Withdrawal Fee (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={networkFormData.withdrawal_fee}
                  onChange={(e) => setNetworkFormData({...networkFormData, withdrawal_fee: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Active</label>
                <p className="text-xs text-gray-600">Enable this network for transactions</p>
              </div>
              <Switch
                checked={networkFormData.is_active}
                onCheckedChange={(checked) => setNetworkFormData({...networkFormData, is_active: checked})}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setNetworkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleNetworkSave}>
                <Save className="h-4 w-4 mr-2" />
                {selectedNetwork ? 'Update' : 'Create'} Network
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminSettings

