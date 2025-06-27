import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';
import { parseFile } from '../../../server/lib/fileParser';
import { fieldMappingSchema } from '../../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { batchId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mappingData = fieldMappingSchema.parse(req.body);
    
    // Get the batch
    const batch = await storage.getBatch(batchId as string);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Update batch with mapping
    await storage.updateBatch(batchId as string, {
      fieldMapping: mappingData,
      status: 'mapped'
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Mapping error:', error);
    res.status(500).json({ error: 'Mapping failed' });
  }
}