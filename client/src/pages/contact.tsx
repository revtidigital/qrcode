import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { User, Phone, Mail, Building, Globe, MapPin, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateVCard } from "@/lib/vcard";

interface ContactData {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

export default function ContactPage() {
  const [match, params] = useRoute("/contact/:contactId");
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!match || !params?.contactId) return;

    const fetchContact = async () => {
      try {
        const response = await fetch(`/api/contacts/${params.contactId}`);
        if (!response.ok) {
          throw new Error('Contact not found');
        }
        const data = await response.json();
        setContact(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [match, params?.contactId]);

  const handleSaveToContacts = () => {
    if (!contact) return;

    const vCardData = generateVCard({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      website: contact.website,
      address: contact.address,
      city: contact.city,
      state: contact.state,
      zipcode: contact.zipcode,
      country: contact.country,
    });

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.name || 'contact'}.vcf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Contact saved",
      description: "Contact has been downloaded to your device",
    });
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  const getFullAddress = () => {
    const parts = [
      contact?.address,
      contact?.city,
      contact?.state,
      contact?.zipcode,
      contact?.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Not Found</h2>
            <p className="text-gray-600 mb-4">The contact you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-custom to-secondary-custom text-white p-6 pb-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{contact.name}</h1>
          {contact.position && (
            <p className="text-white/90 text-lg">{contact.position}</p>
          )}
          {contact.company && (
            <p className="text-white/80">{contact.company}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 -mt-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {contact.phone && (
                <Button
                  onClick={() => handleCall(contact.phone!)}
                  className="bg-primary-custom hover:bg-primary/90 h-16 flex flex-col gap-1"
                >
                  <Phone className="h-5 w-5" />
                  <span className="text-sm">Phone</span>
                </Button>
              )}
              {contact.website && (
                <Button
                  onClick={() => handleWebsite(contact.website!)}
                  className="bg-secondary-custom hover:bg-secondary/90 h-16 flex flex-col gap-1"
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-sm">Website</span>
                </Button>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              {contact.phone && (
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="h-5 w-5 text-primary-custom" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{contact.phone}</p>
                  </div>
                </div>
              )}

              {contact.email && (
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleEmail(contact.email!)}
                >
                  <Mail className="h-5 w-5 text-primary-custom" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{contact.email}</p>
                  </div>
                </div>
              )}

              {contact.company && (
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Building className="h-5 w-5 text-primary-custom" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{contact.company}</p>
                  </div>
                </div>
              )}

              {getFullAddress() && (
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <MapPin className="h-5 w-5 text-primary-custom" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{getFullAddress()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Save to Contacts Button */}
            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={handleSaveToContacts}
                className="w-full bg-success-custom hover:bg-success-custom/90 h-12"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Save to Contacts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="text-gray-500 hover:text-primary-custom"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to QR Generator
          </Button>
        </div>
      </div>
    </div>
  );
}