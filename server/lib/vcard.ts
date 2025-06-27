export interface VCardContact {
  name?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  company?: string;
  position?: string;
  website?: string;
}

export function generateVCard(contact: VCardContact): string {
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
  
  if (contact.name) {
    // For Android compatibility, put entire name in first name field
    vcard += `FN:${contact.name}\n`;
    vcard += `N:${contact.name};;;;\n`;
  }
  
  if (contact.company) {
    vcard += `ORG:${contact.company}\n`;
  }
  
  if (contact.position) {
    vcard += `TITLE:${contact.position}\n`;
  }
  
  if (contact.phone) {
    const formattedPhone = contact.phone.startsWith('0') ? contact.phone : `0${contact.phone}`;
    vcard += `TEL;TYPE=CELL:${formattedPhone}\n`;
  }
  
  if (contact.phone2) {
    const formattedPhone2 = contact.phone2.startsWith('0') ? contact.phone2 : `0${contact.phone2}`;
    vcard += `TEL;TYPE=WORK:${formattedPhone2}\n`;
  }
  
  if (contact.email) {
    vcard += `EMAIL:${contact.email}\n`;
  }
  
  if (contact.website) {
    const url = contact.website.startsWith('http') ? contact.website : `https://${contact.website}`;
    vcard += `URL:${url}\n`;
  }
  
  vcard += 'END:VCARD';
  
  return vcard;
}

export function parseVCard(vcardString: string): VCardContact {
  const lines = vcardString.split('\n');
  const contact: VCardContact = {};
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':');
    
    if (key === 'FN') {
      contact.name = value;
    } else if (key === 'ORG') {
      contact.company = value;
    } else if (key === 'TITLE') {
      contact.position = value;
    } else if (key.startsWith('TEL')) {
      if (key.includes('CELL') || !contact.phone) {
        contact.phone = value;
      } else {
        contact.phone2 = value;
      }
    } else if (key === 'EMAIL') {
      contact.email = value;
    } else if (key === 'URL') {
      contact.website = value;
    }
  }
  
  return contact;
}