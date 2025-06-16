import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QRGenerationProps {
  batchId: string;
  totalContacts: number;
  onGenerationComplete: () => void;
}

export default function QRGeneration({ batchId, totalContacts, onGenerationComplete }: QRGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const { data: batchData, refetch } = useQuery({
    queryKey: [`/api/batches/${batchId}`],
    refetchInterval: isGenerating ? 1000 : false,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/batches/${batchId}/generate`);
      return response.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      setProgress(100);
      toast({
        title: "QR codes generated successfully",
        description: `Generated ${data.processedCount} QR codes`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/batches/${batchId}`] });
      setTimeout(() => {
        onGenerationComplete();
      }, 1000);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate QR codes",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    generateMutation.mutate();
  };

  // Update progress based on batch data
  useEffect(() => {
    if (batchData?.batch) {
      const batch = batchData.batch;
      if (batch.status === "generating" || batch.status === "completed") {
        const newProgress = Math.min((batch.processedContacts / totalContacts) * 100, 100);
        setProgress(newProgress);
        
        if (batch.status === "completed") {
          setIsGenerating(false);
        }
      }
    }
  }, [batchData, totalContacts]);

  const getStatusInfo = () => {
    if (!batchData?.batch) return { icon: Clock, text: "Ready to generate", color: "text-gray-500" };
    
    const status = batchData.batch.status;
    switch (status) {
      case "generating":
        return { icon: Clock, text: "Generating...", color: "text-yellow-500" };
      case "completed":
        return { icon: CheckCircle, text: "Completed", color: "text-green-500" };
      case "failed":
        return { icon: AlertCircle, text: "Failed", color: "text-red-500" };
      default:
        return { icon: Clock, text: "Ready to generate", color: "text-gray-500" };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-primary-custom">Generate QR Codes</h3>
            <p className="text-gray-600">Preview and generate vCard QR codes from your data</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {batchData?.batch?.processedContacts || 0} of {totalContacts} processed
            </span>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || batchData?.batch?.status === "completed"}
              className="bg-primary-custom hover:bg-primary/90"
            >
              <Play className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate All"}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <StatusIcon className={`h-4 w-4 mr-2 ${statusInfo.color}`} />
              <span className="text-sm font-medium text-primary-custom">{statusInfo.text}</span>
            </div>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Contacts Preview */}
        {batchData?.contacts && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batchData.contacts.slice(0, 10).map((contact: any) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-custom">
                      {contact.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.company || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.qrCodeUrl ? (
                        <img 
                          src={contact.qrCodeUrl} 
                          alt="QR Code" 
                          className="w-12 h-12 border rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          {isGenerating ? (
                            <div className="animate-spin w-4 h-4 border-2 border-primary-custom border-t-transparent rounded-full" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.qrCodeUrl ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Generated
                        </span>
                      ) : isGenerating ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
