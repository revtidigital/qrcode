import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParseResult {
  data: any[];
  headers: string[];
  errors?: string[];
}

export async function parseCSV(file: Express.Multer.File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const csvString = file.buffer.toString('utf8');
    
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        const errors: string[] = [];
        
        if (results.errors.length > 0) {
          results.errors.forEach(error => {
            errors.push(`Row ${error.row}: ${error.message}`);
          });
        }

        resolve({
          data: results.data,
          headers: results.meta.fields || [],
          errors: errors.length > 0 ? errors : undefined
        });
      },
      error: (error) => {
        resolve({
          data: [],
          headers: [],
          errors: [error.message]
        });
      }
    });
  });
}

export async function parseExcel(file: Express.Multer.File): Promise<ParseResult> {
  try {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) {
      return {
        data: [],
        headers: [],
        errors: ['Empty spreadsheet']
      };
    }

    const headers = (jsonData[0] as string[]).map(h => String(h).trim());
    const data = jsonData.slice(1).map((row: any) => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return {
      data,
      headers,
    };
  } catch (error) {
    return {
      data: [],
      headers: [],
      errors: [error instanceof Error ? error.message : 'Failed to parse Excel file']
    };
  }
}

export async function parseFile(file: Express.Multer.File): Promise<ParseResult> {
  const fileName = file.originalname.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return parseCSV(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file);
  } else {
    return {
      data: [],
      headers: [],
      errors: ['Unsupported file format. Please upload a CSV or Excel file.']
    };
  }
}

export function validateContactData(data: any[], mapping: Record<string, string>): string[] {
  const errors: string[] = [];
  
  data.forEach((row, index) => {
    const rowNum = index + 1;
    
    // Check if name is provided
    if (mapping.name && !row[mapping.name]?.trim()) {
      errors.push(`Row ${rowNum}: Name is required`);
    }
    
    // Validate email format if provided
    if (mapping.email && row[mapping.email]) {
      const email = row[mapping.email].trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        errors.push(`Row ${rowNum}: Invalid email format`);
      }
    }
    
    // Check if at least one contact method is provided
    const hasPhone = mapping.phone && row[mapping.phone]?.trim();
    const hasPhone2 = mapping.phone2 && row[mapping.phone2]?.trim();
    const hasEmail = mapping.email && row[mapping.email]?.trim();
    const hasWebsite = mapping.website && row[mapping.website]?.trim();
    
    if (!hasPhone && !hasPhone2 && !hasEmail && !hasWebsite) {
      errors.push(`Row ${rowNum}: At least one contact method (phone, email, or website) is required`);
    }
  });
  
  return errors;
}