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
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  
  // Name is required
  if (contact.name) {
    lines.push(`FN:${contact.name}`);
    lines.push(`N:${contact.name};;;;`); // Last;First;Middle;Prefix;Suffix
  }
  
  // Email
  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${contact.email}`);
  }
  
  // Phone numbers
  if (contact.phone) {
    lines.push(`TEL;TYPE=CELL:${contact.phone}`);
  }
  if (contact.phone2) {
    lines.push(`TEL;TYPE=WORK:${contact.phone2}`);
  }
  
  // Organization and title
  if (contact.company) {
    lines.push(`ORG:${contact.company}`);
  }
  if (contact.position) {
    lines.push(`TITLE:${contact.position}`);
  }
  
  // Website
  if (contact.website) {
    lines.push(`URL:${contact.website}`);
  }
  

  
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
              light: 'transparent'
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

      // Find contact across all batches - simplified approach
      let foundContact = null;
      const allContacts = Array.from((storage as any).contacts.values()) as any[];
      foundContact = allContacts.find(c => c.id === contactId);

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
        return res.status(400).json({ error: "Invalid contact ID" });
      }

      // Find contact across all batches
      let foundContact = null;
      const allContacts = Array.from((storage as any).contacts.values()) as any[];
      foundContact = allContacts.find(c => c.id === contactId);

      if (!foundContact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      const vCardData = generateVCard(foundContact);
      
      // iOS-compatible headers
      res.setHeader('Content-Type', 'text/x-vcard; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${(foundContact.name || 'contact').replace(/[^a-zA-Z0-9]/g, '_')}.vcf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
      res.send(vCardData);
    } catch (error) {
      console.error("vCard download error:", error);
      res.status(500).json({ error: "Failed to download vCard" });
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
        phone: "+1-555-123-4567",
        company: "Example Corp",
        position: "Software Engineer",
        website: "https://johndoe.com",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipcode: "10001",
        country: "USA"
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
