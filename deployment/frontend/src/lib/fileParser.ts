import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParseResult {
  data: any[];
  headers: string[];
  errors?: string[];
}

export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data,
          headers: results.meta.fields || [],
          errors: results.errors.map(err => err.message)
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

export async function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        
        resolve({
          data: jsonData,
          headers,
        });
      } catch (error) {
        reject(new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}

export function validateContactData(data: any[], mapping: Record<string, string>): string[] {
  const errors: string[] = [];
  
  data.forEach((row, index) => {
    // Check if at least name or email is present
    const name = mapping.name ? row[mapping.name] : null;
    const email = mapping.email ? row[mapping.email] : null;
    
    if (!name && !email) {
      errors.push(`Row ${index + 1}: Missing both name and email`);
    }
    
    // Validate email format if present
    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${index + 1}: Invalid email format: ${email}`);
      }
    }
    
    // Validate phone format if present
    const phone = mapping.phone ? row[mapping.phone] : null;
    if (phone && typeof phone === 'string') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        // Don't mark as error, just a warning
        // errors.push(`Row ${index + 1}: Invalid phone format: ${phone}`);
      }
    }
  });
  
  return errors;
}
