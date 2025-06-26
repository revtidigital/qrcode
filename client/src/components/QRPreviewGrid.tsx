import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share, Eye, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface QRPreviewGridProps {
  batchId: string;
  onReset: () => void;
}

export default function QRPreviewGrid({ batchId, onReset }: QRPreviewGridProps) {
  const { toast } = useToast();

  const { data: batchData, isLoading } = useQuery({
    queryKey: [`/api/batches/${batchId}`],
  });

  const handleDownloadAll = async () => {
    try {
      const response = await fetch(`/api/batches/${batchId}/download`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-codes-${batchId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "Your QR codes are being downloaded as a ZIP file",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download QR codes",
        variant: "destructive",
      });
    }
  };

  const handleIndividualDownload = async (contactId: number, contactName: string) => {
    try {
      const response = await fetch(`/api/qr/${contactId}/download`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${contactName || contactId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const handleShare = (contact: any) => {
    if (navigator.share) {
      navigator.share({
        title: `QR Code for ${contact.name}`,
        text: `vCard QR code for ${contact.name}`,
        url: contact.qrCodeUrl,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(contact.qrCodeUrl);
      toast({
        title: "QR code URL copied",
        description: "The QR code URL has been copied to your clipboard",
      });
    }
  };

  const handlePreview = (contact: any) => {
    // Open QR code in new window
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>QR Code - ${contact.name}</title></head>
          <body style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5;">
            <div style="text-align: center; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="margin-bottom: 1rem; color: #333;">${contact.name}</h2>
              <img src="${contact.qrCodeUrl}" alt="QR Code" style="max-width: 300px; height: auto;" />
              <p style="margin-top: 1rem; color: #666;">${contact.company || ''}</p>
            </div>
          </body>
        </html>
      `);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <Skeleton className="w-20 h-20 mx-auto mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const contacts = batchData?.contacts?.filter((contact: any) => contact.qrCodeUrl) || [];

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-primary-custom">Generated QR Codes</h3>
              <p className="text-gray-600">Preview and download your vCard QR codes</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={onReset}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              <Button
                onClick={handleDownloadAll}
                className="bg-secondary-custom hover:bg-secondary/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No QR codes generated yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {contacts.map((contact: any) => (
                <div
                  key={contact.id}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 mx-auto mb-3 bg-black rounded border p-1">
                    <img
                      src={contact.qrCodeUrl}
                      alt={`QR Code for ${contact.name}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-sm text-primary-custom truncate">
                    {contact.name || 'Unnamed Contact'}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {contact.company || ''}
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <button
                      onClick={() => handleIndividualDownload(contact.id, contact.name)}
                      className="text-primary-custom hover:text-primary/70 transition-colors"
                      title="Download"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleShare(contact)}
                      className="text-primary-custom hover:text-primary/70 transition-colors"
                      title="Share"
                    >
                      <Share className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handlePreview(contact)}
                      className="text-primary-custom hover:text-primary/70 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary-custom mb-4">Export Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-custom hover:bg-primary/5 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Download className="text-primary-custom h-5 w-5" />
              </div>
              <h4 className="font-semibold text-primary-custom mb-2">Download ZIP</h4>
              <p className="text-sm text-gray-600 mb-4">Download all QR codes as PNG images in a ZIP file</p>
              <Button 
                onClick={handleDownloadAll}
                className="w-full bg-primary-custom hover:bg-primary/90"
              >
                Download ZIP
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-secondary-custom hover:bg-secondary/5 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
                <Share className="text-secondary-custom h-5 w-5" />
              </div>
              <h4 className="font-semibold text-primary-custom mb-2">Get URLs</h4>
              <p className="text-sm text-gray-600 mb-4">Generate shareable URLs for each QR code</p>
              <Button 
                onClick={() => {
                  const urls = contacts.map((c: any) => `${c.name}: ${c.qrCodeUrl}`).join('\n');
                  navigator.clipboard.writeText(urls);
                  toast({
                    title: "URLs copied",
                    description: "All QR code URLs have been copied to clipboard",
                  });
                }}
                className="w-full bg-secondary-custom hover:bg-secondary/90"
              >
                Generate URLs
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-accent-custom hover:bg-accent/5 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                <Download className="text-accent-custom h-5 w-5" />
              </div>
              <h4 className="font-semibold text-primary-custom mb-2">Export CSV</h4>
              <p className="text-sm text-gray-600 mb-4">Export contact data with QR code URLs in CSV format</p>
              <Button 
                onClick={() => {
                  const csvData = contacts.map((c: any) => ({
                    name: c.name,
                    email: c.email,
                    phone: c.phone,
                    company: c.company,
                    qr_url: c.qrCodeUrl
                  }));
                  // This would typically generate and download a CSV
                  toast({
                    title: "CSV export",
                    description: "CSV export functionality would be implemented here",
                  });
                }}
                className="w-full bg-accent-custom hover:bg-accent/90"
              >
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
