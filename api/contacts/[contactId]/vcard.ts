import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';
import { generateVCard } from '../../../server/lib/vcard';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { contactId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Attempting to get contact:', contactId);
    
    const contact = await storage.getContactById(Number(contactId));
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    console.log('Contact found, generating vCard for:', contact.name);
    
    const vCardData = generateVCard({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      phone2: contact.phone2,
      company: contact.company,
      position: contact.position,
      website: contact.website,
    });

    console.log('Sending vCard data, length:', vCardData.length);

    // Set appropriate headers for vCard download
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${contact.name || 'contact'}.vcf"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // For iOS compatibility
    res.setHeader('Content-Transfer-Encoding', 'binary');
    
    res.send(vCardData);

  } catch (error) {
    console.error('vCard generation error:', error);
    res.status(500).json({ error: 'Failed to generate vCard' });
  }
}