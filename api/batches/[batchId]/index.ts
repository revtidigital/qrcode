import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { batchId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the batch
    const batch = await storage.getBatch(batchId as string);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Get contacts for this batch
    const contacts = await storage.getContactsByBatch(batchId as string);

    res.json({
      batch: {
        ...batch,
        contacts
      }
    });

  } catch (error) {
    console.error('Batch fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
}