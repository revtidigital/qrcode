# QR Code Generator - Deployment Guide

This folder contains the separated frontend and backend code for deployment.

## Folder Structure

### Backend (`/backend`)
Contains the Express.js API server with:
- Express routes and middleware
- MongoDB storage implementation
- QR code generation logic
- File upload handling
- Database schema and operations

### Frontend (`/frontend`)
Contains the React application with:
- React components and pages
- UI components (shadcn/ui)
- Client-side routing
- Form handling and validation
- API client logic

## Deployment Steps

### 1. Create Separate Repositories

**Backend Repository:**
1. Create new GitHub repo: `qr-backend`
2. Copy all files from `deployment/backend/` to the root of this repo
3. Push to GitHub

**Frontend Repository:**
1. Create new GitHub repo: `qr-frontend`  
2. Copy all files from `deployment/frontend/` to the root of this repo
3. Push to GitHub

### 2. Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import the `qr-backend` repository
3. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add environment variable: `MONGODB_URI` with your MongoDB connection string
5. Deploy

### 3. Deploy Frontend to Vercel

1. Import the `qr-frontend` repository
2. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Add environment variable: `VITE_API_URL` with your backend URL (from step 2)
4. Deploy

### 4. Update Frontend API Calls

After deploying the backend, you'll need to update the frontend API calls to use the full backend URL instead of relative paths.

The backend URL will be something like: `https://your-backend.vercel.app`

## Important Notes

- The backend will be available at: `https://your-backend.vercel.app`
- The frontend will be available at: `https://your-frontend.vercel.app`
- Make sure to update CORS settings in the backend to allow your frontend domain
- Add the `MONGODB_URI` environment variable to your backend deployment
- Add the `VITE_API_URL` environment variable to your frontend deployment