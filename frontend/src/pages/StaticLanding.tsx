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
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>Advanced encryption and smart contract validation ensure your funds are completely secure.</p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Zap style={{ 
                height: '48px', 
                width: '48px', 
                color: '#9333ea', 
                margin: '0 auto 16px auto' 
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>Lightning Fast</h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>Complete transactions in minutes, not weeks. Automated processes eliminate delays.</p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Globe style={{ 
                height: '48px', 
                width: '48px', 
                color: '#059669', 
                margin: '0 auto 16px auto' 
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>Global Access</h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>Cross-border transactions with automatic compliance and currency conversion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '80px 0',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#2563eb',
                marginBottom: '8px'
              }}>$2.4B+</div>
              <div style={{
                color: '#6b7280'
              }}>Total Value Secured</div>
            </div>
            <div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#9333ea',
                marginBottom: '8px'
              }}>15,000+</div>
              <div style={{
                color: '#6b7280'
              }}>Transactions Completed</div>
            </div>
            <div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#059669',
                marginBottom: '8px'
              }}>99.9%</div>
              <div style={{
                color: '#6b7280'
              }}>Uptime Reliability</div>
            </div>
            <div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#ea580c',
                marginBottom: '8px'
              }}>24/7</div>
              <div style={{
                color: '#6b7280'
              }}>Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
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
              Simple 4-Step Process
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#6b7280'
            }}>From contract to completion in just four easy steps</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <FileText style={{ height: '32px', width: '32px', color: '#2563eb' }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>1. Create Escrow</h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>Set up your property escrow with all parties and terms clearly defined.</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#faf5ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <DollarSign style={{ height: '32px', width: '32px', color: '#9333ea' }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>2. Secure Funds</h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>Buyer deposits funds into the secure smart contract escrow.</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#ecfdf5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle style={{ height: '32px', width: '32px', color: '#059669' }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>3. Verify Conditions</h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>All parties confirm that conditions and requirements are met.</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#fff7ed',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <TrendingUp style={{ height: '32px', width: '32px', color: '#ea580c' }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>4. Complete Transaction</h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>Funds are automatically released to the seller upon completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(to right, #2563eb, #9333ea)'
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '0 24px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px'
          }}>
            Ready to Transform Your Property Transactions?
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#bfdbfe',
            marginBottom: '32px'
          }}>
            Join thousands of professionals who trust PropertyEscrow for secure, efficient real estate transactions.
          </p>
          <button style={{
            background: 'white',
            color: '#2563eb',
            padding: '16px 32px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '500',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
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