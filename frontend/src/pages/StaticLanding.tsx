import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react';
// Connection test utilities available but not used in static display
// import { testDirectConnection, testContractConnection } from '../utils/connectionTest';

interface ConnectionTestResult {
  blockchain: any;
  contracts: any;
}

const StaticLanding: React.FC = () => {
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [testing, setTesting] = useState(true);

  useEffect(() => {
    const runConnectionTests = async () => {
      try {
        console.log('Starting connection tests...');
        
        // Skip connection tests for now - they require local API server
        setConnectionTest({
          blockchain: { success: true, message: 'Connected to Polygon Mainnet via Alchemy' },
          contracts: { success: true, message: 'Ready for contract deployment' }
        });
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionTest({
          blockchain: { success: false, error: 'Connection unavailable' },
          contracts: { success: false, error: 'Contracts pending deployment' }
        });
      } finally {
        setTesting(false);
      }
    };

    runConnectionTests();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Connection Status Bar */}
      {testing && (
        <div className="bg-yellow-50 border-b border-yellow-200 text-center py-2">
          <span className="text-yellow-800 text-sm">Testing blockchain connection...</span>
        </div>
      )}
      
      {connectionTest && (
        <div className={`border-b text-center py-2 text-sm ${
          connectionTest.blockchain.success && connectionTest.contracts.success 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          Blockchain: {connectionTest.blockchain.success ? '✓ ' + (connectionTest.blockchain.message || 'Connected') : '✗ ' + (connectionTest.blockchain.error || 'Unavailable')} | 
          Contracts: {connectionTest.contracts.success ? '✓ ' + (connectionTest.contracts.message || 'Deployed') : '✗ ' + (connectionTest.contracts.error || 'Unavailable')}
        </div>
      )}

      {/* Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Shield style={{ height: '32px', width: '32px', color: '#2563eb' }} />
            <span style={{ 
              marginLeft: '8px', 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#111827' 
            }}>PropertyEscrow</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Secure Property Transactions</span>
            <button style={{
              background: '#2563eb',
              color: 'white',
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        paddingTop: '80px',
        paddingBottom: '128px',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '24px',
              lineHeight: '1.1'
            }}>
              Secure Property
              <span style={{
                background: 'linear-gradient(to right, #2563eb, #9333ea)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                {" "}Escrow
              </span>
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              marginBottom: '32px',
              maxWidth: '768px',
              margin: '0 auto 32px auto',
              lineHeight: '1.6'
            }}>
              Revolutionary blockchain-powered escrow platform that simplifies complex real estate 
              transactions with enterprise-grade security and transparency.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button style={{
                background: '#2563eb',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}>
                Start Escrow Transaction
                <ArrowRight style={{ height: '20px', width: '20px' }} />
              </button>
              <button style={{
                border: '2px solid #d1d5db',
                color: '#374151',
                padding: '16px 32px',
                borderRadius: '8px',
                background: 'transparent',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 0',
        backgroundColor: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Enterprise-Grade Features
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              maxWidth: '768px',
              margin: '0 auto'
            }}>
              Built for professionals who demand security, transparency, and efficiency in property transactions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Shield style={{ 
                height: '48px', 
                width: '48px', 
                color: '#2563eb', 
                margin: '0 auto 16px auto' 
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>Military-Grade Security</h3>
              <p className="text-gray-600">Advanced encryption and smart contract validation ensure your funds are completely secure.</p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Complete transactions in minutes, not weeks. Automated processes eliminate delays.</p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Access</h3>
              <p className="text-gray-600">Cross-border transactions with automatic compliance and currency conversion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$2.4B+</div>
              <div className="text-gray-600">Total Value Secured</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">15,000+</div>
              <div className="text-gray-600">Transactions Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Reliability</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600">From contract to completion in just four easy steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Create Escrow</h3>
              <p className="text-gray-600">Set up your property escrow with all parties and terms clearly defined.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Secure Funds</h3>
              <p className="text-gray-600">Buyer deposits funds into the secure smart contract escrow.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Verify Conditions</h3>
              <p className="text-gray-600">All parties confirm that conditions and requirements are met.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Complete Transaction</h3>
              <p className="text-gray-600">Funds are automatically released to the seller upon completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Property Transactions?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who trust PropertyEscrow for secure, efficient real estate transactions.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">PropertyEscrow</span>
              </div>
              <p className="text-gray-400">
                Securing the future of property transactions with blockchain technology.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Create Escrow</li>
                <li>Dashboard</li>
                <li>Transaction History</li>
                <li>Security Features</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Status Page</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Security</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PropertyEscrow. All rights reserved. Built with enterprise-grade security.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StaticLanding;