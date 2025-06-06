const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8546',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      onError: (err, req, res) => {
        console.log('Proxy error:', err);
        res.status(500).send('Proxy error');
      },
      logLevel: 'debug'
    })
  );

  app.use(
    '/blockchain',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8546',
      changeOrigin: true,
      pathRewrite: {
        '^/blockchain': '/rpc'
      },
      onError: (err, req, res) => {
        console.log('Blockchain proxy error:', err);
        res.status(500).send('Blockchain proxy error');
      },
      logLevel: 'debug'
    })
  );
};