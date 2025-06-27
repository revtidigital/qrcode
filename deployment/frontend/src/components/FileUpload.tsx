import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileText, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onUploadComplete: (result: {
    batchId: string;
    headers: string[];
    preview: any[];
    totalContacts: number;
  }) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest('POST', '/api/upload', formData);
      const result = await response.json();

      onUploadComplete(result);
      
      toast({
        title: "File uploaded successfully",
        description: `${result.totalContacts} contacts found in ${file.name}`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/template/download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vcard-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CloudUpload className="text-primary-custom h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold text-primary-custom mb-2">Upload Your Contact File</h2>
            <p className="text-gray-600 mb-6">Drag and drop your CSV or Excel file here, or click to browse</p>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 transition-colors cursor-pointer ${
                isDragActive
                  ? "border-primary-custom bg-primary/5"
                  : "border-gray-300 hover:border-primary-custom hover:bg-primary/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-primary-custom mb-2">
                  {isDragActive ? "Drop your file here" : "Drop your file here"}
                </p>
                <p className="text-gray-500 mb-4">Supports CSV, XLSX, XLS files up to 10MB</p>
                <Button 
                  type="button"
                  disabled={isUploading}
                  className="bg-primary-custom hover:bg-primary/90"
                >
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success-custom mr-2" />
                CSV Format
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success-custom mr-2" />
                Excel (.xlsx, .xls)
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success-custom mr-2" />
                Up to 10MB
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Download */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary-custom mb-2">Need a template?</h3>
              <p className="text-gray-600 mb-4">Download our sample CSV template with the correct column headers</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Name</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Email</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Primary Phone</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Secondary Phone</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Company</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Position</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Website</span>
              </div>
            </div>
            <Button 
              onClick={downloadTemplate}
              className="bg-secondary-custom hover:bg-secondary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
