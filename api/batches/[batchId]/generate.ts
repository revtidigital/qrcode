import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage.js';
import QRCode from 'qrcode';
import { generateVCard } from '../../../server/lib/vcard.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { batchId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the batch
    const batch = await storage.getBatch(batchId as string);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    if (!batch.fieldMapping || !batch.originalData) {
      return res.status(400).json({ error: 'Batch not ready for generation' });
    }

    const mapping = batch.fieldMapping;
    const contacts = [];

    // Process each contact
    for (const row of batch.originalData) {
      const contactData = {
        name: row[mapping.name] || '',
        email: row[mapping.email] || '',
        phone: row[mapping.phone] || '',
        phone2: row[mapping.phone2] || '',
        company: row[mapping.company] || '',
        position: row[mapping.position] || '',
        website: row[mapping.website] || '',
      };

      // Create contact record
      const contact = await storage.createContact({
        batchId: batchId as string,
        name: contactData.name,
        email: contactData.email || undefined,
        phone: contactData.phone || undefined,
        phone2: contactData.phone2 || undefined,
        company: contactData.company || undefined,
        position: contactData.position || undefined,
        website: contactData.website || undefined,
      });

      // Generate QR code with contact URL
      const contactUrl = `${process.env.VERCEL_URL || 'https://your-domain.vercel.app'}/contact/${contact.id}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(contactUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#FFFFFF',
          light: '#0000'
        },
        width: 256
      });

      // Update contact with QR code
      await storage.updateContact(contact.id, {
        qrCodeUrl: qrCodeDataUrl
      });

      contacts.push({ ...contact, qrCodeUrl: qrCodeDataUrl });
    }

    // Update batch status
    await storage.updateBatch(batchId as string, {
      status: 'completed',
      generatedAt: new Date()
    });

    res.json({ 
      success: true, 
      generated: contacts.length,
      message: `Generated ${contacts.length} QR codes`
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
}
