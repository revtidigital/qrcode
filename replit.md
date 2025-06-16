# QR Code Generator Application

## Overview

This is a full-stack web application that allows users to upload CSV/Excel files containing contact information and generate QR codes for each contact. The application provides a step-by-step workflow for uploading files, mapping fields to vCard properties, generating QR codes, and downloading the results.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for data management
- **File Processing**: Support for CSV and Excel file parsing
- **QR Code Generation**: Server-side QR code generation with vCard support

### Monorepo Structure
The application follows a monorepo structure with clear separation:
- `client/` - Frontend React application
- `server/` - Backend Express.js API
- `shared/` - Shared schemas and types between frontend and backend

## Key Components

### Frontend Architecture
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **File Handling**: React Dropzone for drag-and-drop file uploads

### Backend Architecture
- **API Framework**: Express.js with TypeScript
- **File Processing**: Multer for file uploads, xlsx and papaparse for file parsing
- **QR Code Generation**: QRCode library for generating QR codes
- **Archive Creation**: Archiver for creating ZIP downloads
- **Storage**: Abstracted storage interface with in-memory implementation

### Database Schema
Two main entities:
- **Batches**: Track file upload sessions and processing status
- **Contacts**: Store individual contact information and generated QR codes

## Data Flow

### Upload Process
1. User uploads CSV/Excel file via drag-and-drop interface
2. Server parses file and extracts headers and preview data
3. Batch record created with unique ID and file metadata
4. Preview data returned to client for field mapping

### Field Mapping
1. User maps CSV/Excel columns to vCard fields (name, email, phone, etc.)
2. Field mapping configuration sent to server
3. Server validates mapping and processes all contacts in batch

### QR Code Generation
1. Server generates vCard data for each contact
2. QR codes created containing vCard information
3. Batch status updated with generation progress
4. Generated QR codes stored with contact records

### Download Process
1. User can preview generated QR codes in grid layout
2. Download all QR codes as ZIP archive
3. Archive contains individual QR code images named by contact

## External Dependencies

### Core Technologies
- **React 18**: Frontend framework with modern hooks
- **Express.js**: Backend web framework
- **PostgreSQL**: Primary database (via Drizzle ORM)
- **TypeScript**: Type safety across the entire stack

### Key Libraries
- **Drizzle ORM**: Type-safe database operations
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **React Query**: Server state management and caching
- **Vite**: Fast development and build tooling

### File Processing
- **multer**: Multipart form data handling
- **xlsx**: Excel file parsing
- **papaparse**: CSV file parsing
- **qrcode**: QR code generation
- **archiver**: ZIP file creation

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit with proper modules and build commands
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Database**: PostgreSQL 16 provisioned through Replit

### Build Process
- Frontend builds to `dist/public` for static asset serving
- Backend bundles with esbuild for production deployment
- Environment-specific configurations for development vs production

### Production Deployment
- Autoscale deployment target on Replit
- Static assets served by Express in production
- Database connection via environment variable (DATABASE_URL)

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
- June 16, 2025. Enhanced QR code functionality:
  * Implemented QR Tiger-style contact pages with professional UI
  * QR codes now generate short URLs (e.g., /contact/123) instead of vCard data
  * Added modern gradient design with improved color contrast
  * Implemented "Save to Contacts" functionality with vCard download
  * Added direct action buttons for phone, email, and website
  * Fixed file upload FormData handling issue
  * Enhanced mobile-responsive contact display pages
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```