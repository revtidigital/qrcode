import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FieldMappingProps {
  headers: string[];
  preview: any[];
  batchId: string;
  onMappingComplete: (mapping: Record<string, string>) => void;
}

const vCardFields = [
  { value: "name", label: "Name (FN)" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone (Primary)" },
  { value: "phone2", label: "Phone (Secondary)" },
  { value: "company", label: "Organization" },
  { value: "position", label: "Title/Position" },
  { value: "website", label: "Website/URL" },
];

export default function FieldMapping({ headers, preview, batchId, onMappingComplete }: FieldMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const setMappingMutation = useMutation({
    mutationFn: async (data: { mapping: Record<string, string>; data: any[] }) => {
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
    // Get the full data array (not just preview)
    // For now, we'll use preview data but in a real app, you'd want to store the full data
    setMappingMutation.mutate({
      mapping,
      data: preview // This should be the full dataset
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-primary-custom mb-4">Map Your Fields</h3>
        <p className="text-gray-600 mb-6">Match your CSV columns to vCard fields</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary-custom mb-3">Your CSV Columns</h4>
            <div className="space-y-2">
              {headers.filter(header => header && header.trim() !== '').map((header) => (
                <div key={header} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="font-mono text-sm">{header}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-primary-custom mb-3">vCard Fields</h4>
            <div className="space-y-2">
              {vCardFields.map((field) => (
                <Select
                  key={field.value}
                  value={mapping[field.value] || "none"}
                  onValueChange={(value) => handleMappingChange(field.value, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Map to ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No mapping</SelectItem>
                    {headers.filter(header => header && header.trim() !== '').map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>
        </div>
        
        {/* Preview */}
        {preview.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-primary-custom mb-3">Data Preview</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.filter(header => header && header.trim() !== '').slice(0, 5).map((header) => (
                      <th key={header} className="px-4 py-2 text-left font-medium text-gray-500">
                        {header}
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
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={setMappingMutation.isPending || Object.keys(mapping).length === 0}
            className="bg-primary-custom hover:bg-primary/90"
          >
            {setMappingMutation.isPending ? "Processing..." : "Continue to Generation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
