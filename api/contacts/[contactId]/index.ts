import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { contactId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const contact = await storage.getContactById(Number(contactId));
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);

  } catch (error) {
    console.error('Contact fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
}