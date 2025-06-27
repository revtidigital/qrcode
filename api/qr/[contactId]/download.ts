import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { contactId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('QR download requested for contact ID:', contactId);
    
    const contact = await storage.getContactById(Number(contactId));
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    console.log('Contact found:', contact ? 'Yes' : 'No');

    if (!contact.qrCodeUrl) {
      return res.status(404).json({ error: 'QR code not found for this contact' });
    }

    console.log('QR code URL exists, length:', contact.qrCodeUrl.length);

    // Extract base64 data from data URL
    const base64Data = contact.qrCodeUrl.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('Sending QR image, buffer size:', imageBuffer.length, 'filename:', `qr-${contact.name?.replace(/\s+/g, '_')}.png`);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-${contact.name?.replace(/\s+/g, '_') || contactId}.png"`);
    res.setHeader('Content-Length', imageBuffer.length.toString());
    
    res.send(imageBuffer);

  } catch (error) {
    console.error('QR download error:', error);
    res.status(500).json({ error: 'Failed to download QR code' });
  }
}