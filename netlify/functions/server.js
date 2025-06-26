const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { HybridStorage } = require('../../server/hybridStorage');
const { generateVCard } = require('../../server/routes');

const app = express();
const storage = new HybridStorage();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import and register routes
async function setupRoutes() {
  try {
    const { registerRoutes } = await import('../../server/routes.js');
    await registerRoutes(app);
  } catch (error) {
    console.error('Error setting up routes:', error);
    
    // Fallback basic routes if import fails
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    app.get('/api/*', (req, res) => {
      res.status(503).json({ error: 'Service temporarily unavailable' });
    });
    
    app.post('/api/*', (req, res) => {
      res.status(503).json({ error: 'Service temporarily unavailable' });
    });
  }
}

setupRoutes();

module.exports.handler = serverless(app);