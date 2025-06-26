# Deployment Guide

## Quick Deployment Steps

### 1. GitHub Repository Setup
```bash
git init
git add .
git commit -m "Initial commit: QR Code vCard Generator"
git branch -M main
git remote add origin https://github.com/your-username/qr-vcard-generator.git
git push -u origin main
```

### 2. Backend Deployment (Netlify)

1. **Connect Repository to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository

2. **Build Settings:**
   - Build command: `npm run build:server`
   - Publish directory: `netlify/functions`
   - Node version: `20`

3. **Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://revtisoftwares:azFmqnxGJuRTvjPq@vcards.cx8qhoz.mongodb.net/?retryWrites=true&w=majority&appName=vcards
   NODE_VERSION=20
   ```

4. **Deploy:** Click "Deploy site"

### 3. Frontend Deployment (Vercel)

1. **Connect Repository to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build:client`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables:**
   ```
   VITE_API_URL=https://your-netlify-app.netlify.app
   ```
   (Replace with your actual Netlify URL after step 2)

4. **Deploy:** Click "Deploy"

### 4. Final Configuration

After both deployments:

1. **Update Vercel Environment Variable:**
   - Go to Vercel project settings
   - Update `VITE_API_URL` with your Netlify backend URL
   - Redeploy the frontend

2. **Test the Application:**
   - Visit your Vercel frontend URL
   - Upload a test CSV file
   - Verify QR code generation works
   - Test contact landing pages

## Build Commands Reference

- `npm run build:client` - Builds React frontend for Vercel
- `npm run build:server` - Builds Express backend for Netlify
- `npm run dev` - Local development server

## Environment Variables

### Backend (.env for local, Netlify settings for production)
```
MONGODB_URI=your_mongodb_connection_string
NODE_VERSION=20
```

### Frontend (Vercel environment variables)
```
VITE_API_URL=https://your-backend.netlify.app
```

## Troubleshooting

### Common Issues:

1. **Build Fails on Netlify:**
   - Check Node version is set to 20
   - Verify MongoDB URI is correct
   - Check build logs for missing dependencies

2. **API Calls Fail from Frontend:**
   - Verify VITE_API_URL is set correctly
   - Check CORS settings in backend
   - Ensure Netlify functions are working

3. **File Uploads Not Working:**
   - Check file size limits (10MB default)
   - Verify multer configuration
   - Check network connectivity

### Logs and Debugging:

- **Netlify:** Functions tab shows serverless function logs
- **Vercel:** Function logs in deployment dashboard
- **Browser:** Network tab to check API requests

## Production URLs

After deployment, update these in your documentation:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.netlify.app/api`
- Contact Pages: `https://your-app.vercel.app/contact/{id}`