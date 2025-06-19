export interface VCardContact {
  name?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  company?: string;
  position?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

export function generateVCard(contact: VCardContact): string {
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
  
  // Address
  if (contact.address || contact.city || contact.state || contact.zipcode || contact.country) {
    const addrParts = [
      '', // PO Box
      '', // Extended Address
      contact.address || '',
      contact.city || '',
      contact.state || '',
      contact.zipcode || '',
      contact.country || ''
    ];
    lines.push(`ADR;TYPE=WORK:${addrParts.join(';')}`);
  }
  
  lines.push('END:VCARD');
  
  return lines.join('\r\n');
}

export function parseVCard(vcardString: string): VCardContact {
  const lines = vcardString.split('\n');
  const contact: VCardContact = {};

  for (const line of lines) {
    const [key, value] = line.split(':');
    if (!value) continue;

    switch (key) {
      case 'FN':
        contact.name = value;
        break;
      case 'EMAIL':
        contact.email = value;
        break;
      case 'TEL':
        contact.phone = value;
        break;
      case 'ORG':
        contact.company = value;
        break;
      case 'TITLE':
        contact.position = value;
        break;
      case 'URL':
        contact.website = value;
        break;
      case 'ADR':
        // Parse address format: ;;street;city;state;zip;country
        const addressParts = value.split(';');
        if (addressParts.length >= 7) {
          contact.address = addressParts[2];
          contact.city = addressParts[3];
          contact.state = addressParts[4];
          contact.zipcode = addressParts[5];
          contact.country = addressParts[6];
        }
        break;
    }
  }

  return contact;
}
