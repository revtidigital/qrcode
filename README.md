# QR Code vCard Generator

A full-stack web application for generating vCard QR codes with professional contact landing pages. Upload CSV/Excel files, map contact fields, and generate QR codes that link to branded contact pages.

## Features

- **File Upload**: Support for CSV and Excel files with drag-and-drop interface
- **Field Mapping**: Smart mapping of spreadsheet columns to vCard fields
- **QR Code Generation**: White QR codes with transparent backgrounds for professional use
- **Contact Landing Pages**: Branded contact pages with your custom colors
- **Multiple Phone Support**: Primary and secondary phone numbers
- **Cross-Platform vCard**: iOS and Android compatible contact downloads
- **Persistent Storage**: MongoDB integration with automatic fallback to memory storage
- **Bulk Operations**: Generate and download multiple QR codes as ZIP archives

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: MongoDB with hybrid storage system
- **File Processing**: Support for CSV (papaparse) and Excel (xlsx) files
- **QR Generation**: QRCode library with vCard data
- **Deployment**: Vercel (frontend) + Netlify (backend)

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd qr-vcard-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
MONGODB_URI=your_mongodb_connection_string
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

### Backend Deployment (Netlify)

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set build command: `npm run build:server`
4. Set publish directory: `dist`
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_VERSION`: `20`

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set framework preset: `Vite`
3. Set build command: `npm run build:client`
4. Set output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your Netlify backend URL (e.g., `https://your-app.netlify.app`)

### Environment Variables

**Backend (Netlify):**
- `MONGODB_URI` - MongoDB Atlas connection string
- `NODE_VERSION` - Set to `20`

**Frontend (Vercel):**
- `VITE_API_URL` - Backend API URL from Netlify deployment

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Storage interface
│   ├── mongoStorage.ts   # MongoDB implementation
│   └── hybridStorage.ts  # Hybrid storage with fallback
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schemas and types
├── netlify/             # Netlify deployment config
│   └── functions/       # Serverless functions
└── dist/                # Build output
```

## API Endpoints

- `POST /api/upload` - Upload CSV/Excel file
- `POST /api/batches/{id}/mapping` - Set field mapping
- `POST /api/batches/{id}/generate` - Generate QR codes
- `GET /api/batches/{id}` - Get batch status
- `GET /api/contacts/{id}` - Get contact details
- `GET /api/contacts/{id}/vcard` - Download vCard file
- `GET /api/qr/{id}/download` - Download individual QR code
- `GET /api/batches/{id}/download` - Download all QR codes as ZIP

## Brand Customization

The contact landing pages use these brand colors:
- Primary Dark: `#1E3460`
- Primary Medium: `#104E83` 
- Secondary Dark: `#BC412D`
- Secondary Light: `#D35D30`
- Accent Light: `#CBD9E9`

To customize colors, update the values in `client/src/pages/contact.tsx`.

## File Format Support

**CSV Files:**
- UTF-8 encoding recommended
- First row should contain headers
- Common delimiters supported (comma, semicolon, tab)

**Excel Files:**
- .xlsx format supported
- First row should contain headers
- Multiple sheets supported (first sheet used)

**Supported Fields:**
- Name (required)
- Email
- Phone (Primary)
- Phone (Secondary) 
- Company
- Position
- Website

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details