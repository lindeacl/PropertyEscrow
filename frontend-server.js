const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Property Escrow Platform running on http://0.0.0.0:${PORT}`);
});