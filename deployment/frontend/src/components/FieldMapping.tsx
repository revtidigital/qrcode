import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, CheckCircle, User, Mail, Phone, Building, Briefcase, Globe } from "lucide-react";

interface FieldMappingProps {
  headers: string[];
  preview: any[];
  batchId: string;
  onMappingComplete: (mapping: Record<string, string>) => void;
}

const vCardFields = [
  { value: "name", label: "Name", icon: User, description: "Contact's full name", required: true },
  { value: "email", label: "Email", icon: Mail, description: "Email address", required: false },
  { value: "phone", label: "Primary Phone", icon: Phone, description: "Main phone number", required: false },
  { value: "phone2", label: "Secondary Phone", icon: Phone, description: "Additional phone number", required: false },
  { value: "company", label: "Organization", icon: Building, description: "Company or organization", required: false },
  { value: "position", label: "Job Title", icon: Briefcase, description: "Position or role", required: false },
  { value: "website", label: "Website", icon: Globe, description: "Website URL", required: false },
];

export default function FieldMapping({ headers, preview, batchId, onMappingComplete }: FieldMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Auto-suggest mappings based on header names
  useEffect(() => {
    const autoMapping: Record<string, string> = {};
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().trim();
      
      if (lowerHeader.includes('name') || lowerHeader.includes('full')) {
        autoMapping.name = header;
      } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
        autoMapping.email = header;
      } else if (lowerHeader.includes('phone') && !lowerHeader.includes('2') && !lowerHeader.includes('second')) {
        autoMapping.phone = header;
      } else if (lowerHeader.includes('phone') && (lowerHeader.includes('2') || lowerHeader.includes('second'))) {
        autoMapping.phone2 = header;
      } else if (lowerHeader.includes('company') || lowerHeader.includes('organization') || lowerHeader.includes('org')) {
        autoMapping.company = header;
      } else if (lowerHeader.includes('position') || lowerHeader.includes('title') || lowerHeader.includes('job')) {
        autoMapping.position = header;
      } else if (lowerHeader.includes('website') || lowerHeader.includes('url') || lowerHeader.includes('web')) {
        autoMapping.website = header;
      }
    });
    
    setMapping(autoMapping);
  }, [headers]);

  const setMappingMutation = useMutation({
    mutationFn: async (data: { mapping: Record<string, string> }) => {
      const response = await apiRequest('POST', `/api/batches/${batchId}/mapping`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field mapping saved",
        description: "Your field mapping has been saved successfully",
      });
      onMappingComplete(mapping);
    },
    onError: (error) => {
      toast({
        title: "Mapping failed",
        description: error instanceof Error ? error.message : "Failed to save field mapping",
        variant: "destructive",
      });
    },
  });

  const handleMappingChange = (vCardField: string, csvField: string) => {
    setMapping(prev => ({
      ...prev,
      [vCardField]: csvField === "none" ? "" : csvField
    }));
  };

  const handleContinue = () => {
    // Send only the mapping - server will retrieve full data from storage
    setMappingMutation.mutate({
      mapping
    });
  };

  const mappedFields = Object.keys(mapping).filter(key => mapping[key]);
  const hasRequiredMapping = mapping.name; // At least name should be mapped

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Field Mapping
          </CardTitle>
          <p className="text-gray-600">Connect your CSV columns to contact fields. We've suggested some matches below.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Mapping Interface */}
          <div className="space-y-4">
            {vCardFields.map((field) => {
              const Icon = field.icon;
              const isMapped = mapping[field.value];
              
              return (
                <div key={field.value} className="flex items-center gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={`h-5 w-5 ${isMapped ? 'text-green-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.label}</span>
                        {field.required && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                        {isMapped && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{field.description}</p>
                    </div>
                  </div>
                  
                  <div className="w-64">
                    <Select
                      value={mapping[field.value] || "none"}
                      onValueChange={(value) => handleMappingChange(field.value, value)}
                    >
                      <SelectTrigger className={isMapped ? "border-green-300 bg-green-50" : ""}>
                        <SelectValue placeholder="Select CSV column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No mapping</SelectItem>
                        {headers.filter(header => header && header.trim() !== '').map((header) => (
                          <SelectItem key={header} value={header}>
                            <span className="font-mono text-sm">{header}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mapping Status */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="font-medium text-blue-900">
                {mappedFields.length} of {vCardFields.length} fields mapped
              </p>
              <p className="text-sm text-blue-700">
                {hasRequiredMapping ? 
                  "Ready to generate QR codes" : 
                  "Please map at least the Name field to continue"
                }
              </p>
            </div>
            <div className="flex gap-1">
              {vCardFields.map((field) => (
                <div
                  key={field.value}
                  className={`w-3 h-3 rounded-full ${
                    mapping[field.value] ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
        
      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <p className="text-gray-600">Sample of your CSV data</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.filter(header => header && header.trim() !== '').slice(0, 5).map((header) => (
                      <th key={header} className="px-4 py-2 text-left font-medium text-gray-500">
                        <span className="font-mono">{header}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.slice(0, 3).map((row, index) => (
                    <tr key={index}>
                      {headers.filter(header => header && header.trim() !== '').slice(0, 5).map((header) => (
                        <td key={header} className="px-4 py-2 text-gray-900">
                          {row[header]?.toString().substring(0, 30)}
                          {row[header]?.toString().length > 30 ? '...' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
        
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={setMappingMutation.isPending || !hasRequiredMapping}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          size="lg"
        >
          {setMappingMutation.isPending ? "Processing..." : "Generate QR Codes"}
        </Button>
      </div>
    </div>
  );
}
