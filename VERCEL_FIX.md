# Vercel 404 Error Fix

## Issue
Getting 404 Not Found error when deploying to Vercel.

## Root Cause
The build configuration mismatch between Vite output directory and Vercel expectations.

## Solutions

### Option 1: Use Simplified Configuration (Recommended)
Replace your `vercel.json` with this minimal version:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Manual Vercel Dashboard Setup
1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Framework: **Vite**
4. Build Command: `vite build`
5. Output Directory: `dist/public`
6. Install Command: `npm install`
7. Environment Variables:
   - `VITE_API_URL`: `https://vcard-api.revtidigital.com`

### Option 3: Check Build Output
Ensure your build creates files in the correct directory:

```bash
# Test build locally
vite build
ls -la dist/public/
```

Should show:
- index.html
- assets/ folder
- Other static files

## Deployment Steps (Fixed)

1. **Delete current vercel.json**
2. **Use vercel-simple.json** (rename to vercel.json)
3. **Redeploy on Vercel**
4. **Set environment variable**: `VITE_API_URL=https://vcard-api.revtidigital.com`

## Test After Deployment
- Visit: https://vcard.revtidigital.com
- Should show the QR code generator interface
- Upload a CSV file to test functionality

## If Still Getting 404
1. Check Vercel build logs for errors
2. Verify the output directory contains index.html
3. Confirm DNS settings are correct
4. Try deploying without custom domain first