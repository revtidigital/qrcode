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
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    contact.name ? `FN:${contact.name}` : '',
    contact.email ? `EMAIL:${contact.email}` : '',
    contact.phone ? `TEL;TYPE=CELL:${contact.phone}` : '',
    contact.phone2 ? `TEL;TYPE=WORK:${contact.phone2}` : '',
    contact.company ? `ORG:${contact.company}` : '',
    contact.position ? `TITLE:${contact.position}` : '',
    contact.website ? `URL:${contact.website}` : '',
    contact.address ? `ADR:;;${contact.address};${contact.city || ''};${contact.state || ''};${contact.zipcode || ''};${contact.country || ''}` : '',
    'END:VCARD'
  ].filter(line => line && !line.endsWith(':')).join('\n');
  
  return vcard;
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
