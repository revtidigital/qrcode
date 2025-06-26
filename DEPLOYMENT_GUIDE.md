# Complete Deployment Guide

## 🚀 Deploy Your QR Code Generator

### Step 1: GitHub Repository Setup

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: QR Code vCard Generator with MongoDB integration"

# Create main branch
git branch -M main

# Add your GitHub repository
git remote add origin https://github.com/YOUR-USERNAME/qr-vcard-generator.git

# Push to GitHub
git push -u origin main
```

### Step 2: Backend Deployment on Netlify

1. **Create Netlify Account**: Go to [netlify.com](https://netlify.com)

2. **Connect Repository**:
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository

3. **Build Settings**:
   - **Build command**: `npm install`
   - **Publish directory**: `netlify/functions`
   - **Functions directory**: `netlify/functions`

4. **Environment Variables** (Site Settings > Environment Variables):
   ```
   MONGODB_URI=mongodb+srv://revtisoftwares:azFmqnxGJuRTvjPq@vcards.cx8qhoz.mongodb.net/?retryWrites=true&w=majority&appName=vcards
   NODE_VERSION=20
   ```

5. **Deploy**: Click "Deploy site"

### Step 3: Frontend Deployment on Vercel

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://YOUR-NETLIFY-SITE.netlify.app
   ```
   (Replace with actual Netlify URL after step 2)

5. **Deploy**: Click "Deploy"

### Step 4: Final Configuration

1. **Update Frontend Environment**:
   - After Netlify deployment, copy the backend URL
   - Go to Vercel project settings
   - Update `VITE_API_URL` with your Netlify URL
   - Redeploy frontend

2. **Test Your Application**:
   - Visit your Vercel frontend URL
   - Upload a CSV file
   - Generate QR codes
   - Test contact landing pages

## 📝 Configuration Files

Your project includes these deployment configurations:

- `netlify.toml` - Netlify deployment settings
- `vercel.json` - Vercel deployment settings
- `.gitignore` - Git ignore patterns
- `package.json` - Dependencies and scripts

## 🔧 Environment Variables Reference

### Backend (Netlify)
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NODE_VERSION` - Set to "20"

### Frontend (Vercel)
- `VITE_API_URL` - Your Netlify backend URL

## 🎯 After Deployment

Your application will be available at:
- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.netlify.app/api`
- **Contact Pages**: `https://your-project.vercel.app/contact/{id}`

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Node version (should be 20)
   - Verify environment variables are set
   - Check build logs for errors

2. **API Not Working**:
   - Verify VITE_API_URL is correct
   - Check Netlify function logs
   - Ensure MongoDB URI is valid

3. **File Upload Issues**:
   - Check file size (10MB limit)
   - Verify CORS settings
   - Test with smaller files first

### Support:
- Check deployment logs in Netlify/Vercel dashboards
- Verify all environment variables are set correctly
- Test API endpoints directly before frontend integration

## ✅ Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Netlify backend deployed with environment variables
- [ ] Vercel frontend deployed with API URL configured
- [ ] File upload functionality tested
- [ ] QR code generation working
- [ ] Contact landing pages displaying correctly
- [ ] MongoDB data persistence confirmed