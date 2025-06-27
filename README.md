# QR Code Generator - Vercel Deployment

A full-stack QR code generator application built with React, Express.js, and MongoDB, optimized for deployment on Vercel.

## Features

- Upload CSV/Excel files with contact information
- Map fields to vCard properties
- Generate QR codes linking to contact landing pages
- Download individual QR codes or ZIP archives
- Professional contact landing pages with brand colors
- MongoDB persistence for data storage

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js (Serverless Functions)
- **Database**: MongoDB Atlas
- **Deployment**: Vercel
- **QR Generation**: QRCode.js
- **File Processing**: xlsx, papaparse

## Project Structure

```
├── api/                          # Vercel serverless functions
│   ├── upload.ts                 # File upload endpoint
│   ├── batches/[batchId]/       # Batch management
│   ├── contacts/[contactId]/    # Contact endpoints
│   └── qr/[contactId]/         # QR code downloads
├── client/                      # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/                      # Shared server logic
│   ├── lib/                     # Utility functions
│   ├── storage.ts              # Database abstractions
│   └── hybridStorage.ts        # MongoDB/memory hybrid
├── shared/                      # Shared types and schemas
├── vercel.json                 # Vercel configuration
└── package.json               # Root dependencies
```

## Deployment Instructions

### 1. Prerequisites

- Node.js 18+
- MongoDB Atlas account
- GitHub account
- Vercel account

### 2. Environment Variables

Set up these environment variables in Vercel:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### 3. Deploy to Vercel

#### Option A: GitHub Integration

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

#### Option B: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### 4. Configure Domain (Optional)

- Add custom domain in Vercel dashboard
- Update QR generation URLs in the code

## Local Development

1. Install dependencies:
```bash
npm install
cd client && npm install
```

2. Set environment variables:
```bash
export MONGODB_URI="your-mongodb-connection-string"
```

3. Run development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/upload` - Upload CSV/Excel files
- `POST /api/batches/[id]/mapping` - Set field mapping
- `POST /api/batches/[id]/generate` - Generate QR codes
- `GET /api/batches/[id]` - Get batch details
- `GET /api/contacts/[id]` - Get contact details
- `GET /api/contacts/[id]/vcard` - Download vCard
- `GET /api/qr/[id]/download` - Download QR code

## Brand Colors

The application uses custom brand colors:
- Primary: #BC412D (Dark Red)
- Secondary: #D35D30 (Orange Red)
- Accent: #1E3460 (Dark Blue)
- Light Blue: #104E83
- Background: #CBD9E9

## License

MIT License