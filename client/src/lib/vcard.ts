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
  const lines = ['BEGIN:VCARD', 'VERSION:2.1'];
  
  // Name is required - put entire name in first name field for both iOS and Android
  if (contact.name) {
    const cleanFullName = contact.name.trim().replace(/[;,\\]/g, ' ').trim();
    // Put entire name in first name field, leave last name empty
    lines.push(`N:;${cleanFullName};;;`);
    lines.push(`FN:${cleanFullName}`);
    // Add Android-specific name field
    lines.push(`X-ANDROID-CUSTOM:vnd.android.cursor.item/name;${cleanFullName};1;;;;;;;;;;;;;`);
  }
  
  // Email with Android compatibility
  if (contact.email) {
    lines.push(`EMAIL;INTERNET:${contact.email}`);
  }
  
  // Phone numbers with automatic '0' prefix and Android compatibility
  if (contact.phone) {
    const formattedPhone = contact.phone.startsWith('0') ? contact.phone : `0${contact.phone}`;
    lines.push(`TEL;CELL:${formattedPhone}`);
  }
  if (contact.phone2) {
    const formattedPhone2 = contact.phone2.startsWith('0') ? contact.phone2 : `0${contact.phone2}`;
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
  
  // Website
  if (contact.website) {
    lines.push(`URL:${contact.website}`);
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

    }
  }

  return contact;
}
