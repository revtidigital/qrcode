import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  phone2: text("phone2"),
  company: text("company"),
  position: text("position"),
  website: text("website"),
  qrCodeUrl: text("qr_code_url"),
  vCardData: text("vcard_data"),
  batchId: text("batch_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  fileName: text("file_name").notNull(),
  totalContacts: integer("total_contacts").notNull(),
  processedContacts: integer("processed_contacts").default(0),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  fieldMapping: jsonb("field_mapping"),
  rawData: text("raw_data"), // Store complete uploaded data as JSON string
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  createdAt: true,
});

export const fieldMappingSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  website: z.string().optional(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Batch = typeof batches.$inferSelect;
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type FieldMapping = z.infer<typeof fieldMappingSchema>;
