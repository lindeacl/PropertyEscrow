const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:3000'],
  credentials: true
}));

// Proxy middleware configuration
const proxyOptions = {
  target: 'http://127.0.0.1:8545',
  changeOrigin: true,
  pathRewrite: {
    '^/rpc': '', // remove /rpc prefix when forwarding to target
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('=== PROXY REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
};

// Create and use the proxy middleware
app.use('/rpc', createProxyMiddleware(proxyOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Blockchain proxy server running' });
});

// Test endpoint to verify blockchain connectivity from server side
app.get('/test', async (req, res) => {
  try {
    console.log('Testing blockchain connection from server...');
    const response = await fetch('http://127.0.0.1:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    
    const data = await response.json();
    console.log('Blockchain test response:', data);
    
    res.json({
      success: true,
      blockNumber: parseInt(data.result, 16),
      rawResponse: data
    });
  } catch (error) {
    console.error('Blockchain test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint for frontend to get blockchain status without CORS issues
app.get('/api/status', async (req, res) => {
  try {
    // Test blockchain connection
    const blockResponse = await fetch('http://127.0.0.1:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    
    const blockData = await blockResponse.json();
    const blockNumber = parseInt(blockData.result, 16);
    
    // Test contract deployment by checking if contracts exist at known addresses
    const contractAddresses = {
      MockERC20: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      EscrowFactory: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    };
    
    const contractChecks = {};
    for (const [name, address] of Object.entries(contractAddresses)) {
      try {
        const codeResponse = await fetch('http://127.0.0.1:8545', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [address, 'latest'],
            id: Date.now()
          })
        });
        
        const codeData = await codeResponse.json();
        contractChecks[name] = {
          deployed: codeData.result && codeData.result !== '0x',
          address
        };
      } catch (error) {
        contractChecks[name] = { deployed: false, error: error.message };
      }
    }
    
    res.json({
      blockchain: {
        success: true,
        blockNumber,
        network: 'localhost'
      },
      contracts: contractChecks
    });
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({
      blockchain: { success: false, error: error.message },
      contracts: { error: 'Unable to check contracts' }
    });
  }
});

const PORT = 8546;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Blockchain proxy server running on port ${PORT}`);
  console.log(`Proxying requests to: http://127.0.0.1:8545`);
  console.log(`Frontend should connect to: http://127.0.0.1:${PORT}/rpc`);
  console.log(`Server accessible at: http://0.0.0.0:${PORT}/rpc`);
});