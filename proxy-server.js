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

const PORT = 8546;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Blockchain proxy server running on port ${PORT}`);
  console.log(`Proxying requests to: http://127.0.0.1:8545`);
  console.log(`Frontend should connect to: http://127.0.0.1:${PORT}/rpc`);
  console.log(`Server accessible at: http://0.0.0.0:${PORT}/rpc`);
});