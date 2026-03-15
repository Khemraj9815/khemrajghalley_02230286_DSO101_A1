const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1y',
  etag: false,
  index: false,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Frontend is running' });
});

// Serve index.html for all routes (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'), {
    maxAge: 0,
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Frontend server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});
