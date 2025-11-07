const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://6d5c1854bdbb.ngrok-free.app',
      changeOrigin: true,
      secure: false,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔄 Proxying request:', req.method, req.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('✅ Proxy response:', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
      }
    })
  );
};
