const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 5000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'frontend/build')));

// API proxy for blockchain interactions
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8545',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});