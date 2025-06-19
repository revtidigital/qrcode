import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { User, Phone, Mail, Building, Globe, MapPin, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateVCard } from "@/lib/vcard";
import logoPath from "@assets/icul-logo-horizontal-color-1_1750138201608.png";

interface ContactData {
  id: number;
  name: string;
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
      phone2: contact.phone2,
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
    <div className="min-h-screen bg-white">
      {/* Logo Section */}
      <div className="bg-white py-4 px-6 border-b border-gray-100">
        <div className="max-w-md mx-auto text-center">
          <img 
            src={logoPath} 
            alt="IC Universal Legal" 
            className="h-12 mx-auto object-contain"
          />
        </div>
      </div>

      {/* Header with enhanced gradient */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
        
        <div className="relative max-w-md mx-auto text-center px-6 py-12">
          <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ring-4 ring-white/20">
            <User className="h-14 w-14 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-sm">{contact.name}</h1>
          {contact.position && (
            <p className="text-white/95 text-lg font-medium mb-1">{contact.position}</p>
          )}
          {contact.company && (
            <p className="text-white/85 text-base">{contact.company}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 -mt-8 relative z-10">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Action Buttons */}
            <div className="p-6 pb-4">
              <div className="grid grid-cols-2 gap-4">
                {contact.phone && (
                  <Button
                    onClick={() => handleCall(contact.phone!)}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white h-16 flex flex-col gap-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="text-sm font-medium">Call</span>
                  </Button>
                )}
                {contact.website && (
                  <Button
                    onClick={() => handleWebsite(contact.website!)}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white h-16 flex flex-col gap-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-sm font-medium">Website</span>
                  </Button>
                )}
              </div>
              
              {/* Secondary phone number button if available */}
              {contact.phone2 && (
                <div className="mt-4">
                  <Button
                    onClick={() => handleCall(contact.phone2!)}
                    className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white h-12 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Call Secondary</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="px-6 pb-6">
              <div className="space-y-1">
                {contact.phone && (
                  <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleCall(contact.phone!)}>
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Phone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone {contact.phone2 ? '(Primary)' : ''}</p>
                      <p className="text-lg font-semibold text-gray-900">{contact.phone}</p>
                    </div>
                  </div>
                )}

                {contact.phone2 && (
                  <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleCall(contact.phone2!)}>
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                      <Phone className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone (Secondary)</p>
                      <p className="text-lg font-semibold text-gray-900">{contact.phone2}</p>
                    </div>
                  </div>
                )}

                {contact.email && (
                  <div 
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => handleEmail(contact.email!)}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-lg font-semibold text-gray-900 break-all">{contact.email}</p>
                    </div>
                  </div>
                )}

                {contact.company && (
                  <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</p>
                      <p className="text-lg font-semibold text-gray-900">{contact.company}</p>
                    </div>
                  </div>
                )}

                {getFullAddress() && (
                  <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <MapPin className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                      <p className="text-lg font-semibold text-gray-900 leading-relaxed">{getFullAddress()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save to Contacts Button */}
            <div className="p-6 pt-0">
              <Button
                onClick={handleSaveToContacts}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-14 shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
                size="lg"
              >
                <Download className="h-6 w-6 mr-3" />
                Save to Contacts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to QR Generator
          </Button>
        </div>
      </div>
    </div>
  );
}