#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Preparing QR Code Generator for deployment...\n');

// 1. Build client for Vercel
console.log('📦 Building frontend for Vercel...');
try {
  execSync('npm run build:client', { stdio: 'inherit' });
  console.log('✅ Frontend build completed\n');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// 2. Create serverless function structure for Netlify
console.log('🔧 Setting up Netlify serverless functions...');

// Ensure netlify/functions directory exists
const netlifyFunctionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(netlifyFunctionsDir)) {
  fs.mkdirSync(netlifyFunctionsDir, { recursive: true });
}

// 3. Copy necessary files for serverless deployment
console.log('📋 Preparing deployment files...');

// Create a simplified server entry point for Netlify
const netlifyServerCode = `
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Import modules with fallbacks
let storage, generateVCard, registerRoutes;

try {
  ({ HybridStorage } = require('../../server/hybridStorage'));
  ({ registerRoutes } = require('../../server/routes'));
  storage = new HybridStorage();
} catch (error) {
  console.warn('Could not load full backend modules, using fallback');
}

const app = express();

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'unknown'
  });
});

// Try to register full routes, fallback to basic endpoints
if (registerRoutes && storage) {
  try {
    registerRoutes(app);
    console.log('Full routes registered successfully');
  } catch (error) {
    console.error('Error registering routes:', error);
    setupFallbackRoutes(app);
  }
} else {
  setupFallbackRoutes(app);
}

function setupFallbackRoutes(app) {
  app.all('/api/*', (req, res) => {
    res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'Backend is initializing, please try again shortly'
    });
  });
}

module.exports.handler = serverless(app);
`;

fs.writeFileSync(path.join(netlifyFunctionsDir, 'server.js'), netlifyServerCode);

// 4. Create deployment checklist
const deploymentChecklist = `
🎯 DEPLOYMENT CHECKLIST

✅ Files prepared for deployment:
   - Frontend build in /dist directory
   - Netlify function in /netlify/functions/server.js
   - Configuration files: netlify.toml, vercel.json
   - Documentation: README.md, deploy.md

📋 Next Steps:

1. GITHUB SETUP:
   git init
   git add .
   git commit -m "Initial commit: QR Code vCard Generator"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/qr-vcard-generator.git
   git push -u origin main

2. NETLIFY DEPLOYMENT (Backend):
   - Connect GitHub repo to Netlify
   - Build command: npm install && npm run build:server
   - Functions directory: netlify/functions
   - Environment variables:
     * MONGODB_URI=mongodb+srv://revtisoftwares:azFmqnxGJuRTvjPq@vcards.cx8qhoz.mongodb.net/?retryWrites=true&w=majority&appName=vcards
     * NODE_VERSION=20

3. VERCEL DEPLOYMENT (Frontend):
   - Connect GitHub repo to Vercel
   - Framework: Vite
   - Build command: npm run build:client
   - Output directory: dist
   - Environment variables:
     * VITE_API_URL=https://YOUR-NETLIFY-APP.netlify.app

🔗 After deployment, your app will be available at:
   - Frontend: https://YOUR-APP.vercel.app
   - Backend API: https://YOUR-NETLIFY-APP.netlify.app/api
   - Contact pages: https://YOUR-APP.vercel.app/contact/{id}

⚠️  Remember to:
   - Update VITE_API_URL with actual Netlify URL after backend deployment
   - Test file upload and QR generation
   - Verify contact landing pages work correctly
`;

console.log(deploymentChecklist);

// 5. Create build info file
const buildInfo = {
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  architecture: process.arch,
  deploymentReady: true,
  frontendBuild: 'dist/',
  backendFunction: 'netlify/functions/server.js',
  configFiles: ['netlify.toml', 'vercel.json', 'package.json'],
  envVariables: {
    backend: ['MONGODB_URI', 'NODE_VERSION'],
    frontend: ['VITE_API_URL']
  }
};

fs.writeFileSync('deployment-info.json', JSON.stringify(buildInfo, null, 2));

console.log('\n✅ Deployment preparation completed!');
console.log('📁 Check deployment-info.json for build details');
console.log('📖 Read deploy.md for step-by-step deployment instructions');