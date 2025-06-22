import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { cryptoConverter } from '../services/cryptoConverter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  Users, 
  FileText, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Search,
  Plus,
  Database,
  Server
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'agent' | 'buyer' | 'seller';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface TransactionRecord {
  id: number;
  user_id: number;
  transaction_hash: string;
  transaction_type: string;
  status: string;
  amount?: string;
  created_at: string;
}

interface SystemStatus {
  message: string;
  version: string;
  blockchain_connected: boolean;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [transactionPrices, setTransactionPrices] = useState<{ [key: number]: { primary: string; secondary: string } }>({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersData, transactionsData, statusData] = await Promise.all([
        apiService.getUsers(),
        apiService.getAllTransactions(),
        apiService.getSystemStatus()
      ]);
      
      setUsers(usersData);
      setTransactions(transactionsData);
      setSystemStatus(statusData);
      
      // Convert ETH prices to ZAR for transactions
      const priceConversions: { [key: number]: { primary: string; secondary: string } } = {};
      for (const transaction of transactionsData) {
        if (transaction.amount && transaction.amount.includes('ETH')) {
          try {
            const ethAmount = transaction.amount.replace(' ETH', '');
            const conversion = await cryptoConverter.getDisplayPrice(ethAmount);
            priceConversions[transaction.id] = conversion;
          } catch (error) {
            console.error(`Failed to convert price for transaction ${transaction.id}:`, error);
          }
        }
      }
      setTransactionPrices(priceConversions);
    } catch (err: any) {
      setError('Failed to load admin data');
      console.error('Admin data error:', err);
    }
  };

  const handleRoleUpdate = async (userId: number, newRole: string) => {
    setError('');
    setSuccess('');
    
    try {
      await apiService.updateUserRole(userId, newRole);
      setSuccess(`User role updated to ${newRole}`);
      fetchAdminData(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user role');
    }
  };



  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'seller':
        return 'bg-green-100 text-green-800';
      case 'buyer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('AdminPanel - User object:', user);
  console.log('AdminPanel - User role:', user?.role);
  console.log('AdminPanel - Role check result:', user?.role?.toLowerCase() !== 'admin');
  
  if (user?.role?.toLowerCase() !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">System administration and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Shield className="w-3 h-3 mr-1" />
            Administrator
          </Badge>
          {systemStatus?.blockchain_connected ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              System Online
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              System Issues
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.status.toLowerCase() === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus?.blockchain_connected ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              v{systemStatus?.version || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Polygon</div>
            <p className="text-xs text-muted-foreground">
              {systemStatus?.blockchain_connected ? 'Connected' : 'Disconnected'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="overrides">Admin Overrides</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{u.full_name}</div>
                          <div className="text-sm text-gray-500">@{u.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(u.role)}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {u.is_active && (
                            <Badge variant="outline" className="text-xs">Active</Badge>
                          )}
                          {u.is_verified && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Select
                            value={u.role}
                            onValueChange={(value) => handleRoleUpdate(u.id, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buyer">Buyer</SelectItem>
                              <SelectItem value="seller">Seller</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All blockchain transactions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {tx.transaction_hash.substring(0, 10)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        {tx.transaction_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.amount ? (
                          transactionPrices[tx.id] ? (
                            <div>
                              <div className="font-medium">
                                {transactionPrices[tx.id].primary}
                              </div>
                              <div className="text-xs text-gray-500">
                                {transactionPrices[tx.id].secondary}
                              </div>
                            </div>
                          ) : (
                            `${tx.amount} ETH`
                          )
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        User #{tx.user_id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage system settings and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Blockchain Connection</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Status: {systemStatus?.blockchain_connected ? 'Connected' : 'Disconnected'}
                  </p>
                  <Button variant="outline" size="sm">
                    Test Connection
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Database Status</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    MySQL connection active
                  </p>
                  <Button variant="outline" size="sm">
                    Check Database
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">System Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Version:</span> {systemStatus?.version || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Environment:</span> Development
                  </div>
                  <div>
                    <span className="font-medium">Network:</span> Polygon
                  </div>
                  <div>
                    <span className="font-medium">Total Users:</span> {users.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Overrides</CardTitle>
              <CardDescription>
                Execute administrative actions on escrow transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Override Actions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Administrative override capabilities will be available when there are active escrow transactions.
                </p>
                <Button className="mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Manual Override
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
