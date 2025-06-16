import { useState } from "react";
import { QrCode, User, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import FieldMapping from "@/components/FieldMapping";
import QRGeneration from "@/components/QRGeneration";
import QRPreviewGrid from "@/components/QRPreviewGrid";
import StepProgress from "@/components/StepProgress";

type Step = "upload" | "mapping" | "generation" | "preview";

interface UploadResult {
  batchId: string;
  headers: string[];
  preview: any[];
  totalContacts: number;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResult(result);
    setCurrentStep("mapping");
  };

  const handleMappingComplete = (mapping: Record<string, string>) => {
    setFieldMapping(mapping);
    setCurrentStep("generation");
  };

  const handleGenerationComplete = () => {
    setCurrentStep("preview");
  };

  const resetProcess = () => {
    setCurrentStep("upload");
    setUploadResult(null);
    setFieldMapping({});
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-custom rounded-lg flex items-center justify-center">
                  <QrCode className="text-white" size={16} />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-primary-custom">QR Bulk Generator</h1>
                <p className="text-sm text-gray-500">vCard QR Codes from CSV/Excel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button className="bg-primary-custom hover:bg-primary/90">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Progress */}
        <StepProgress currentStep={currentStep} />

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === "upload" && (
            <FileUpload onUploadComplete={handleUploadComplete} />
          )}

          {currentStep === "mapping" && uploadResult && (
            <FieldMapping
              headers={uploadResult.headers}
              preview={uploadResult.preview}
              onMappingComplete={handleMappingComplete}
              batchId={uploadResult.batchId}
            />
          )}

          {currentStep === "generation" && uploadResult && (
            <QRGeneration
              batchId={uploadResult.batchId}
              totalContacts={uploadResult.totalContacts}
              onGenerationComplete={handleGenerationComplete}
            />
          )}

          {currentStep === "preview" && uploadResult && (
            <QRPreviewGrid
              batchId={uploadResult.batchId}
              onReset={resetProcess}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <p className="text-sm text-gray-500">&copy; 2024 QR Bulk Generator. All rights reserved.</p>
              <a href="#" className="text-sm text-gray-500 hover:text-primary-custom">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-primary-custom">Terms of Service</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-custom">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 4.077a8.04 8.04 0 01-2.31.632 4.014 4.014 0 001.762-2.218 8.064 8.064 0 01-2.551.975A4.008 4.008 0 0013.846 2c-2.21 0-4 1.79-4 4 0 .314.036.62.105.916-3.325-.167-6.275-1.76-8.25-4.18a3.99 3.99 0 00-.541 2.01c0 1.386.705 2.608 1.777 3.32a3.96 3.96 0 01-1.81-.5v.05c0 1.937 1.378 3.549 3.204 3.916a4.006 4.006 0 01-1.804.069c.509 1.588 1.982 2.744 3.73 2.776A8.054 8.054 0 012 16.696a11.37 11.37 0 006.17 1.808c7.404 0 11.448-6.135 11.448-11.454 0-.174-.004-.347-.012-.52A8.18 8.18 0 0020 4.077z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
