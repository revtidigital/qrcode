import { contacts, batches, type Contact, type InsertContact, type Batch, type InsertBatch } from "@shared/schema";

export interface IStorage {
  // Batch operations
  createBatch(batch: InsertBatch): Promise<Batch>;
  getBatch(batchId: string): Promise<Batch | undefined>;
  updateBatch(batchId: string, updates: Partial<Batch>): Promise<Batch | undefined>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContactsByBatch(batchId: string): Promise<Contact[]>;
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined>;
  deleteContactsByBatch(batchId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private contacts: Map<number, Contact>;
  private batches: Map<string, Batch>;
  private currentContactId: number;
  private currentBatchId: number;

  constructor() {
    this.contacts = new Map();
    this.batches = new Map();
    this.currentContactId = 1;
    this.currentBatchId = 1;
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const id = this.currentBatchId++;
    const batch: Batch = { 
      ...insertBatch, 
      id,
      processedContacts: insertBatch.processedContacts || 0,
      status: insertBatch.status || "pending",
      fieldMapping: insertBatch.fieldMapping || null,
      createdAt: new Date()
    };
    this.batches.set(insertBatch.batchId, batch);
    return batch;
  }

  async getBatch(batchId: string): Promise<Batch | undefined> {
    return this.batches.get(batchId);
  }

  async updateBatch(batchId: string, updates: Partial<Batch>): Promise<Batch | undefined> {
    const batch = this.batches.get(batchId);
    if (!batch) return undefined;
    
    const updatedBatch = { ...batch, ...updates };
    this.batches.set(batchId, updatedBatch);
    return updatedBatch;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id,
      name: insertContact.name || "",
      email: insertContact.email || null,
      phone: insertContact.phone || null,
      company: insertContact.company || null,
      position: insertContact.position || null,
      website: insertContact.website || null,
      address: insertContact.address || null,
      city: insertContact.city || null,
      state: insertContact.state || null,
      zipcode: insertContact.zipcode || null,
      country: insertContact.country || null,
      qrCodeUrl: insertContact.qrCodeUrl || null,
      vCardData: insertContact.vCardData || null,
      createdAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContactsByBatch(batchId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      (contact) => contact.batchId === batchId
    );
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, ...updates };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContactsByBatch(batchId: string): Promise<void> {
    for (const [id, contact] of this.contacts.entries()) {
      if (contact.batchId === batchId) {
        this.contacts.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
