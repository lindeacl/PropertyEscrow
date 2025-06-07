const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

// Serve static files from frontend/build directory
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle React Router (return index.html for any non-static file requests)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Property Escrow Platform running on port ${port}`);
  console.log(`Access at: http://localhost:${port}`);
});