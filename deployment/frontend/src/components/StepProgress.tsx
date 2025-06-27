import { CheckCircle } from "lucide-react";

interface StepProgressProps {
  currentStep: "upload" | "mapping" | "generation" | "preview";
}

const steps = [
  { id: "upload", label: "Upload File", number: 1 },
  { id: "mapping", label: "Map Fields", number: 2 },
  { id: "generation", label: "Generate QR Codes", number: 3 },
  { id: "preview", label: "Download", number: 4 },
];

export default function StepProgress({ currentStep }: StepProgressProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= currentStepIndex
                    ? "bg-primary-custom text-white"
                    : "bg-gray-300 text-gray-500"
                }`}>
                  {index < currentStepIndex ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStepIndex
                    ? "text-primary-custom"
                    : "text-gray-500"
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px ml-4 ${
                  index < currentStepIndex
                    ? "bg-primary-custom"
                    : "bg-gray-300"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
