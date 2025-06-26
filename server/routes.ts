import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBatchSchema, insertContactSchema, fieldMappingSchema } from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import archiver from "archiver";
import path from "path";
import fs from "fs";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

function generateVCard(contact: any): string {
  const lines = ['BEGIN:VCARD', 'VERSION:2.1'];
  
  // Name is required - put entire name in first name field for both iOS/Android
  if (contact.name) {
    const fullName = contact.name.trim();
    
    // Clean the full name for vCard compatibility
    const cleanFullName = fullName.replace(/[;,\\]/g, ' ').trim();
    
    // Put entire name in first name field, leave last name empty
    // N field format: Last;First;Middle;Prefix;Suffix
    lines.push(`N:;${cleanFullName};;;`);
    lines.push(`FN:${cleanFullName}`);
    
    // Add Android-specific name field with full name in first name position
    lines.push(`X-ANDROID-CUSTOM:vnd.android.cursor.item/name;${cleanFullName};1;;;;;;;;;;;;;`);
  }
  
  // Email with Android/iOS compatibility
  if (contact.email) {
    lines.push(`EMAIL;INTERNET:${contact.email}`);
  }
  
  // Phone numbers with Android compatibility and international format
  if (contact.phone) {
    const formattedPhone = contact.phone.startsWith('+') ? contact.phone : `+${contact.phone}`;
    lines.push(`TEL;CELL:${formattedPhone}`);
  }
  if (contact.phone2) {
    const formattedPhone2 = contact.phone2.startsWith('+') ? contact.phone2 : `+${contact.phone2}`;
    lines.push(`TEL;WORK:${formattedPhone2}`);
  }
  
  // Organization and title with Android compatibility
  if (contact.company) {
    const company = contact.company.replace(/[;,\\]/g, ' ').trim();
    lines.push(`ORG:${company}`);
  }
  if (contact.position) {
    const position = contact.position.replace(/[;,\\]/g, ' ').trim();
    lines.push(`TITLE:${position}`);
  }
  
  // Website with proper URL formatting
  if (contact.website) {
    let website = contact.website;
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      website = 'https://' + website;
    }
    lines.push(`URL;TYPE=WORK:${website}`);
  }
  
  // Add unique identifier for iOS compatibility
  lines.push(`UID:${contact.id}-${Date.now()}`);
  
  lines.push('END:VCARD');
  
  return lines.join('\r\n');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and parse CSV/Excel file
  app.post("/api/upload", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { originalname, buffer, mimetype } = req.file;
      const batchId = nanoid();
      
      let data: any[] = [];
      let headers: string[] = [];

      // Parse based on file type
      if (mimetype === 'text/csv' || originalname.endsWith('.csv')) {
        const csvText = buffer.toString('utf-8');
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        data = parsed.data as any[];
        headers = (parsed.meta.fields || []).filter(header => header && header.trim() !== '');
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 mimetype === 'application/vnd.ms-excel' ||
                 originalname.endsWith('.xlsx') || originalname.endsWith('.xls')) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
        if (data.length > 0) {
          headers = Object.keys(data[0]).filter(header => header && header.trim() !== '');
        }
      } else {
        return res.status(400).json({ error: "Unsupported file format. Please upload CSV or Excel files." });
      }

      if (data.length === 0) {
        return res.status(400).json({ error: "No data found in the uploaded file" });
      }

      // Create batch
      const batch = await storage.createBatch({
        batchId,
        fileName: originalname,
        totalContacts: data.length,
        status: "pending",
        fieldMapping: null
      });

      res.json({ 
        batchId, 
        headers, 
        preview: data.slice(0, 5),
        totalContacts: data.length 
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process uploaded file" });
    }
  });

  // Set field mapping and create contacts
  app.post("/api/batches/:batchId/mapping", async (req, res) => {
    try {
      const { batchId } = req.params;
      const { mapping, data } = req.body;

      // Validate mapping
      const validatedMapping = fieldMappingSchema.parse(mapping);

      // Update batch with field mapping
      await storage.updateBatch(batchId, { 
        fieldMapping: validatedMapping,
        status: "processing"
      });

      // Create contacts from mapped data
      for (const row of data) {
        const contactData: any = { batchId };
        
        // Map fields based on user mapping
        for (const [vCardField, csvField] of Object.entries(validatedMapping)) {
          if (csvField && row[csvField]) {
            contactData[vCardField] = row[csvField];
          }
        }

        await storage.createContact(contactData);
      }

      // Update batch status
      await storage.updateBatch(batchId, { 
        status: "mapped",
        processedContacts: data.length
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Mapping error:", error);
      res.status(500).json({ error: "Failed to process field mapping" });
    }
  });

  // Generate QR codes for a batch
  app.post("/api/batches/:batchId/generate", async (req, res) => {
    try {
      const { batchId } = req.params;
      const contacts = await storage.getContactsByBatch(batchId);

      if (contacts.length === 0) {
        return res.status(404).json({ error: "No contacts found for this batch" });
      }

      await storage.updateBatch(batchId, { status: "generating" });

      // Generate QR codes for each contact
      let processedCount = 0;
      for (const contact of contacts) {
        const vCardData = generateVCard(contact);
        
        try {
          // Create short URL for the contact page
          const contactUrl = `${req.protocol}://${req.get('host')}/contact/${contact.id}`;
          
          const qrCodeDataUrl = await QRCode.toDataURL(contactUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: '#FFFFFF',
              light: '#000000'
            }
          });

          await storage.updateContact(contact.id, {
            vCardData,
            qrCodeUrl: qrCodeDataUrl
          });

          processedCount++;
        } catch (qrError) {
          console.error(`Failed to generate QR code for contact ${contact.id}:`, qrError);
        }
      }

      await storage.updateBatch(batchId, { 
        status: "completed",
        processedContacts: processedCount
      });

      res.json({ 
        success: true, 
        processedCount,
        totalContacts: contacts.length 
      });
    } catch (error) {
      console.error("Generation error:", error);
      await storage.updateBatch(req.params.batchId, { status: "failed" });
      res.status(500).json({ error: "Failed to generate QR codes" });
    }
  });

  // Get individual contact details
  app.get("/api/contacts/:contactId", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      if (isNaN(contactId)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }

      const foundContact = await storage.getContactById(contactId);

      if (!foundContact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      res.json(foundContact);
    } catch (error) {
      console.error("Contact fetch error:", error);
      res.status(500).json({ error: "Failed to fetch contact details" });
    }
  });

  // Download vCard for iOS compatibility
  app.get("/api/contacts/:contactId/vcard", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      if (isNaN(contactId)) {
        console.log("Invalid contact ID:", req.params.contactId);
        return res.status(400).json({ error: "Invalid contact ID" });
      }

      console.log("Attempting to get contact:", contactId);
      const foundContact = await storage.getContactById(contactId);

      if (!foundContact) {
        console.log("Contact not found:", contactId);
        return res.status(404).json({ error: "Contact not found" });
      }

      console.log("Contact found, generating vCard for:", foundContact.name);
      const vCardData = generateVCard(foundContact);
      
      // Enhanced iOS-compatible headers
      res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${(foundContact.name || 'contact').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_')}.vcf"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', Buffer.byteLength(vCardData, 'utf8').toString());
      
      console.log("Sending vCard data, length:", vCardData.length);
      res.send(vCardData);
    } catch (error: any) {
      console.error("vCard download error:", error.message);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ error: "Failed to download vCard" });
    }
  });

  // Download individual QR code as PNG
  app.get("/api/qr/:contactId/download", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      console.log("QR download requested for contact ID:", contactId);
      
      if (isNaN(contactId)) {
        console.log("Invalid contact ID:", req.params.contactId);
        return res.status(400).json({ error: "Invalid contact ID" });
      }

      const foundContact = await storage.getContactById(contactId);
      console.log("Contact found:", foundContact ? "Yes" : "No");

      if (!foundContact) {
        console.log("Contact not found for ID:", contactId);
        return res.status(404).json({ error: "Contact not found" });
      }

      if (!foundContact.qrCodeUrl) {
        console.log("QR code URL not found for contact:", contactId);
        return res.status(404).json({ error: "QR code not found for this contact" });
      }

      console.log("QR code URL exists, length:", foundContact.qrCodeUrl.length);
      
      // Extract base64 data from data URL
      const base64Data = foundContact.qrCodeUrl.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `qr-${(foundContact.name || 'contact').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_')}.png`;
      
      console.log("Sending QR image, buffer size:", buffer.length, "filename:", fileName);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      
      res.send(buffer);
    } catch (error: any) {
      console.error("QR download error:", error.message);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ error: "Failed to download QR code" });
    }
  });

  // Get batch details
  app.get("/api/batches/:batchId", async (req, res) => {
    try {
      const { batchId } = req.params;
      const batch = await storage.getBatch(batchId);
      
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      const contacts = await storage.getContactsByBatch(batchId);
      
      res.json({ 
        batch,
        contacts: contacts.map(contact => ({
          ...contact,
          qrCodeUrl: contact.qrCodeUrl
        }))
      });
    } catch (error) {
      console.error("Batch fetch error:", error);
      res.status(500).json({ error: "Failed to fetch batch details" });
    }
  });

  // Download individual QR code
  app.get("/api/qr/:contactId/download", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      if (isNaN(contactId)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }

      // Find contact across all batches - same approach as contact details endpoint
      let foundContact = null;
      const allContacts = Array.from((storage as any).contacts.values()) as any[];
      foundContact = allContacts.find(c => c.id === contactId);
      
      if (!foundContact || !foundContact.qrCodeUrl) {
        return res.status(404).json({ error: "QR code not found" });
      }

      const base64Data = foundContact.qrCodeUrl.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${foundContact.name || contactId}.png"`);
      res.send(buffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download QR code" });
    }
  });

  // Download all QR codes as ZIP
  app.get("/api/batches/:batchId/download", async (req, res) => {
    try {
      const { batchId } = req.params;
      const contacts = await storage.getContactsByBatch(batchId);
      
      if (contacts.length === 0) {
        return res.status(404).json({ error: "No contacts found" });
      }

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="qr-codes-${batchId}.zip"`);

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);

      for (const contact of contacts) {
        if (contact.qrCodeUrl) {
          const base64Data = contact.qrCodeUrl.replace(/^data:image\/png;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = `${contact.name || contact.id}-qr.png`;
          archive.append(buffer, { name: filename });
        }
      }

      await archive.finalize();
    } catch (error) {
      console.error("ZIP download error:", error);
      res.status(500).json({ error: "Failed to create ZIP file" });
    }
  });

  // Download sample template
  app.get("/api/template/download", (req, res) => {
    const sampleData = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        "primary phone": "1-555-123-4567",
        "secondary phone": "1-555-987-6543",
        company: "Example Corp",
        position: "Software Engineer",
        website: "https://johndoe.com"
      },
      {
        name: "Jane Smith",
        email: "jane.smith@company.com",
        "primary phone": "91-9876543210",
        "secondary phone": "91-1234567890",
        company: "Tech Solutions Inc",
        position: "Product Manager",
        website: "https://janesmith.com"
      }
    ];

    const csv = Papa.unparse(sampleData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="vcard-template.csv"');
    res.send(csv);
  });

  const httpServer = createServer(app);
  return httpServer;
}
