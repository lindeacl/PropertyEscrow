import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Save,
  AlertCircle,
  CheckCircle,
  Wallet
} from 'lucide-react';

interface UserProfile {
  bio?: string;
  company?: string;
  license_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  profile_image_url?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [userInfo, setUserInfo] = useState({
    email: user?.email || '',
    username: user?.username || '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    wallet_address: user?.wallet_address || ''
  });

  const [profile, setProfile] = useState<UserProfile>({
    bio: '',
    company: '',
    license_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    profile_image_url: ''
  });

  const handleUserInfoChange = (field: string, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateUserInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateCurrentUser(userInfo);
      setSuccess('User information updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user information');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'AGENT':
        return 'bg-blue-100 text-blue-800';
      case 'SELLER':
        return 'bg-green-100 text-green-800';
      case 'BUYER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        <Badge className={getRoleBadgeColor(user?.role || '')}>
          <User className="w-3 h-3 mr-1" />
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
        </Badge>
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

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account Information</TabsTrigger>
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your basic account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateUserInfo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => handleUserInfoChange('email', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Username
                    </label>
                    <Input
                      id="username"
                      value={userInfo.username}
                      onChange={(e) => handleUserInfoChange('username', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    id="full_name"
                    value={userInfo.full_name}
                    onChange={(e) => handleUserInfoChange('full_name', e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700 mb-1">
                      <Wallet className="w-4 h-4 inline mr-1" />
                      Wallet Address
                    </label>
                    <Input
                      id="wallet_address"
                      value={userInfo.wallet_address}
                      onChange={(e) => handleUserInfoChange('wallet_address', e.target.value)}
                      placeholder="0x..."
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Additional information about your professional background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="w-4 h-4 inline mr-1" />
                    Company
                  </label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => handleProfileChange('company', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <Input
                    id="license_number"
                    value={profile.license_number}
                    onChange={(e) => handleProfileChange('license_number', e.target.value)}
                    placeholder="Professional license number"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => handleProfileChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    id="state"
                    value={profile.state}
                    onChange={(e) => handleProfileChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <Input
                    id="zip_code"
                    value={profile.zip_code}
                    onChange={(e) => handleProfileChange('zip_code', e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium">Account Status</h4>
                  <p className="text-sm text-gray-600">
                    Your account is {user?.is_active ? 'active' : 'inactive'} and {user?.is_verified ? 'verified' : 'unverified'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {user?.is_active && (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  )}
                  {user?.is_verified && (
                    <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium">Password</h4>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline">
                  Change Password
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
