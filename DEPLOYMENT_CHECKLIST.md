
# Deployment Checklist for vcard.revtidigital.com

## 📋 Pre-deployment Setup

### 1. GitHub Repository
- [ ] Initialize repository: `git init`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit: QR Code vCard Generator"`
- [ ] Push to GitHub: `git push -u origin main`

### 2. Backend Deployment (Netlify)
- [ ] Connect GitHub repository to Netlify
- [ ] Set build command: `npm install`
- [ ] Set functions directory: `netlify/functions`
- [ ] Add custom domain: `vcard-api.revtidigital.com`
- [ ] Configure environment variables:
  - `MONGODB_URI=mongodb+srv://revtisoftwares:azFmqnxGJuRTvjPq@vcards.cx8qhoz.mongodb.net/?retryWrites=true&w=majority&appName=vcards`
  - `NODE_VERSION=20`

### 3. Frontend Deployment (Vercel)  
- [ ] Connect GitHub repository to Vercel
- [ ] Set framework: Vite
- [ ] Set build command: `vite build`
- [ ] Set output directory: `dist`
- [ ] Add custom domain: `vcard.revtidigital.com`
- [ ] Configure environment variables:
  - `VITE_API_URL=https://vcard-api.revtidigital.com`

### 4. DNS Configuration
Add these DNS records to your domain provider:

```
Type: CNAME
Name: vcard
Value: cname.vercel-dns.com

Type: CNAME  
Name: vcard-api
Value: [your-netlify-site].netlify.app
```

## 🎯 Expected URLs
- Frontend: https://vcard.revtidigital.com
- Backend API: https://vcard-api.revtidigital.com
- Contact pages: https://vcard.revtidigital.com/contact/{id}

## ✅ Post-deployment Testing
- [ ] Upload CSV file
- [ ] Map fields and generate QR codes
- [ ] Test QR code scanning
- [ ] Verify contact landing pages
- [ ] Test vCard download functionality
- [ ] Confirm MongoDB data persistence

## 🔧 Configuration Files Ready
- ✅ netlify.toml - Backend deployment config
- ✅ vercel.json - Frontend deployment config  
- ✅ DEPLOYMENT_GUIDE.md - Step-by-step instructions
- ✅ deploy-prep.js - This preparation script

Your QR Code Generator is ready for production deployment!
