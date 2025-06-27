import { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { parseFile } from '../server/lib/fileParser';
import { storage } from '../server/storage';
import { nanoid } from 'nanoid';

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper to handle multer in serverless environment
const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'));
    
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse the file
    const result = await parseFile({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype
    } as Express.Multer.File);

    if (result.errors?.length) {
      return res.status(400).json({ error: 'File parsing failed', details: result.errors });
    }

    // Create batch
    const batchId = nanoid();
    const batch = await storage.createBatch({
      batchId,
      fileName: file.originalname,
      totalContacts: result.data.length,
      status: 'uploaded'
    });

    // Return preview data (first 5 rows)
    const preview = result.data.slice(0, 5);

    res.json({
      batchId,
      headers: result.headers,
      preview,
      totalContacts: result.data.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}