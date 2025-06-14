import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Activity,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Copy,
  Save,
  RefreshCw,
  Download
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

interface UserProfile {
  displayName: string;
  email: string;
  walletAddress: string;
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  complianceLevel: 'basic' | 'enhanced' | 'institutional';
  createdAt: Date;
  lastActive: Date;
}

interface NotificationSettings {
  escrowUpdates: boolean;
  transactionAlerts: boolean;
  systemMaintenance: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  mobilePush: boolean;
  emailDigest: boolean;
  smsAlerts: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'pending';
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, address, disconnectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [showWalletAddress, setShowWalletAddress] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: 'Property Investor',
    email: 'investor@propertyescrow.com',
    walletAddress: address || '',
    kycStatus: 'verified',
    complianceLevel: 'enhanced',
    createdAt: new Date('2024-05-15'),
    lastActive: new Date()
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    escrowUpdates: true,
    transactionAlerts: true,
    systemMaintenance: true,
    marketingEmails: false,
    securityAlerts: true,
    mobilePush: true,
    emailDigest: true,
    smsAlerts: false
  });

  const [activityLog] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Wallet Connected',
      timestamp: new Date(Date.now() - 3600000),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 91.0',
      status: 'success'
    },
    {
      id: '2',
      action: 'Escrow Created',
      timestamp: new Date(Date.now() - 86400000),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 91.0',
      status: 'success'
    },
    {
      id: '3',
      action: 'Document Upload',
      timestamp: new Date(Date.now() - 172800000),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 91.0',
      status: 'success'
    }
  ]);

  useEffect(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet to access settings');
      navigate('/');
      return;
    }

    if (address) {
      setUserProfile(prev => ({ ...prev, walletAddress: address }));
    }

    logger.uiAction('Settings page loaded');
  }, [isConnected, address, navigate]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
      logger.uiAction('Profile settings saved');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences updated');
      logger.uiAction('Notification settings saved');
    } catch (error) {
      toast.error('Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400 bg-green-500/20 border-green-500/40';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'rejected':
        return 'text-red-400 bg-red-500/20 border-red-500/40';
      default:
        return 'text-grey-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  const exportActivityLog = () => {
    const data = activityLog.map(log => ({
      Action: log.action,
      Timestamp: log.timestamp.toISOString(),
      'IP Address': log.ipAddress,
      'User Agent': log.userAgent,
      Status: log.status
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity-log.csv';
    a.click();
    
    toast.success('Activity log exported');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold">Settings & Profile</h1>
              <p className="text-gray-300">Manage your account, wallet, and platform preferences</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-6 mb-8 border-b border-gray-700">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'compliance', label: 'Compliance', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
            { id: 'activity', label: 'Activity Log', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-medium flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-royal-400 border-b-2 border-royal-400'
                  : 'text-grey-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <User className="w-5 h-5 mr-2" />
                User Profile
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.displayName}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Wallet Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={showWalletAddress ? userProfile.walletAddress : formatAddress(userProfile.walletAddress)}
                      readOnly
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono"
                    />
                    <button
                      onClick={() => setShowWalletAddress(!showWalletAddress)}
                      className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors"
                    >
                      {showWalletAddress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(userProfile.walletAddress)}
                      className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Member Since
                    </label>
                    <p className="text-white bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                      {userProfile.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Active
                    </label>
                    <p className="text-white bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                      {userProfile.lastActive.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-royal-500 hover:bg-royal-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Wallet Management
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h4 className="font-semibold text-white">Connected Wallet</h4>
                    <p className="text-gray-300 font-mono">{formatAddress(address || '')}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Wallet Actions</h4>
                    <button
                      onClick={() => copyToClipboard(address || '')}
                      className="w-full bg-royal-500 hover:bg-royal-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </button>
                    <button
                      onClick={disconnectWallet}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Security Information</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>• Never share your private keys</p>
                      <p>• Always verify transaction details</p>
                      <p>• Use hardware wallets for large amounts</p>
                      <p>• Keep your wallet software updated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                KYC & Compliance
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h4 className="font-semibold text-white">KYC Verification Status</h4>
                    <p className="text-gray-300">Identity verification and compliance level</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-sm font-semibold ${getKycStatusColor(userProfile.kycStatus)}`}>
                    {userProfile.kycStatus.charAt(0).toUpperCase() + userProfile.kycStatus.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-4">Compliance Level</h4>
                    <div className="space-y-3">
                      {['basic', 'enhanced', 'institutional'].map((level) => (
                        <div
                          key={level}
                          className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                            userProfile.complianceLevel === level
                              ? 'bg-blue-500/20 border-royal-500/40 text-royal-400'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="capitalize font-medium">{level}</span>
                            {userProfile.complianceLevel === level && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </div>
                          <p className="text-xs mt-1 opacity-80">
                            {level === 'basic' && 'Standard verification for basic transactions'}
                            {level === 'enhanced' && 'Enhanced KYC for larger transaction limits'}
                            {level === 'institutional' && 'Full institutional compliance requirements'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-4">Required Documents</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Government ID', status: 'verified', required: true },
                        { name: 'Proof of Address', status: 'verified', required: true },
                        { name: 'Source of Funds', status: 'pending', required: false },
                        { name: 'Business Registration', status: 'not_required', required: false }
                      ].map((doc) => (
                        <div key={doc.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-gray-300">{doc.name}</span>
                          <div className="flex items-center space-x-2">
                            {doc.status === 'verified' && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                            {doc.status === 'pending' && (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              doc.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                              doc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-grey-400'
                            }`}>
                              {doc.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-white mb-4">Transaction Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'escrowUpdates', label: 'Escrow Status Updates', description: 'Notifications for escrow state changes' },
                        { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'Real-time transaction confirmations' },
                        { key: 'securityAlerts', label: 'Security Alerts', description: 'Critical security-related notifications' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div>
                            <h5 className="text-white font-medium">{item.label}</h5>
                            <p className="text-sm text-grey-400">{item.description}</p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => ({
                              ...prev,
                              [item.key]: !prev[item.key as keyof NotificationSettings]
                            }))}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              notifications[item.key as keyof NotificationSettings]
                                ? 'bg-royal-500'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              notifications[item.key as keyof NotificationSettings]
                                ? 'translate-x-7'
                                : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-4">Communication Preferences</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'emailDigest', label: 'Email Digest', description: 'Weekly summary of platform activity' },
                        { key: 'mobilePush', label: 'Mobile Push', description: 'Push notifications on mobile devices' },
                        { key: 'smsAlerts', label: 'SMS Alerts', description: 'Text message notifications for urgent updates' },
                        { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and promotional content' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div>
                            <h5 className="text-white font-medium">{item.label}</h5>
                            <p className="text-sm text-grey-400">{item.description}</p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => ({
                              ...prev,
                              [item.key]: !prev[item.key as keyof NotificationSettings]
                            }))}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              notifications[item.key as keyof NotificationSettings]
                                ? 'bg-royal-500'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              notifications[item.key as keyof NotificationSettings]
                                ? 'translate-x-7'
                                : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="bg-royal-500 hover:bg-royal-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2" />
                Platform Preferences
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">Theme Settings</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor }
                    ].map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value as any)}
                        className={`p-4 rounded-xl border transition-colors ${
                          theme === themeOption.value
                            ? 'bg-blue-500/20 border-royal-500/40 text-royal-400'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <themeOption.icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="block text-sm font-medium">{themeOption.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-4">Display Options</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing and padding for more content' },
                      { key: 'animations', label: 'Animations', description: 'Enable smooth transitions and animations' },
                      { key: 'tooltips', label: 'Tooltips', description: 'Show helpful tooltips throughout the interface' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <h5 className="text-white font-medium">{option.label}</h5>
                          <p className="text-sm text-grey-400">{option.description}</p>
                        </div>
                        <button className="w-12 h-6 bg-royal-500 rounded-full">
                          <div className="w-4 h-4 bg-white rounded-full translate-x-7 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Activity Log
                </h3>
                <button
                  onClick={exportActivityLog}
                  className="bg-royal-500 hover:bg-royal-600 text-white px-4 py-2 rounded-xl flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Log
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Action</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Timestamp</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">IP Address</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">User Agent</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map((log) => (
                      <tr key={log.id} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-white">{log.action}</td>
                        <td className="py-3 px-4 text-gray-300">{log.timestamp.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-300 font-mono">{log.ipAddress}</td>
                        <td className="py-3 px-4 text-gray-300">{log.userAgent}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                            log.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;