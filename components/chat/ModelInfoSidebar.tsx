"use client";

import { useModelDetails } from "@/hooks/useModelDetails";

interface ModelInfoSidebarProps {
  className?: string;
  modelName?: string;
  ollamaUrl?: string;
}

export default function ModelInfoSidebar({
  className = "",
  modelName,
  ollamaUrl,
}: ModelInfoSidebarProps) {
  const { modelDetails, isLoading, error } = useModelDetails(
    modelName,
    ollamaUrl,
  );

  // Helper to format model family
  const getModelFamily = () => {
    if (!modelDetails?.details) return "Unknown";
    const { family, families } = modelDetails.details;
    if (families && families.length > 0) {
      return families.join(", ");
    }
    return family || "Unknown";
  };

  // Helper to format parameter size
  const getParameterSize = () => {
    return modelDetails?.details?.parameter_size || "Unknown";
  };

  // Helper to format quantization level
  const getQuantization = () => {
    return modelDetails?.details?.quantization_level || "Not specified";
  };

  // Helper to format format type
  const getFormat = () => {
    return modelDetails?.details?.format || "Unknown";
  };

  return (
    <div className={`w-80 border-l bg-background p-6 space-y-6 ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Model Information
        </h3>

        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Loading model details...
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive">
            Unable to load model details
          </div>
        )}

        {!isLoading && !error && modelDetails && (
          <>
            {/* Source */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Source
              </label>
              <p className="text-sm text-foreground">Platform</p>
            </div>

            {/* Model Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Model Name
              </label>
              <p className="text-sm text-foreground font-mono bg-muted px-2 py-1 rounded">
                {modelName || "Unknown"}
              </p>
            </div>

            {/* Model Family */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Family
              </label>
              <p className="text-sm text-foreground">{getModelFamily()}</p>
            </div>

            {/* Parameter Size */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Parameter Size
              </label>
              <p className="text-sm text-foreground">{getParameterSize()}</p>
            </div>

            {/* Format */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Format
              </label>
              <p className="text-sm text-foreground">{getFormat()}</p>
            </div>

            {/* Quantization */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Quantization
              </label>
              <p className="text-sm text-foreground">{getQuantization()}</p>
            </div>

            {/* Capabilities */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Capabilities
              </label>
              <ul className="space-y-1">
                <li className="text-sm text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Text Generation
                </li>
                <li className="text-sm text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Streaming
                </li>
              </ul>
            </div>
          </>
        )}

        {!isLoading && !error && !modelDetails && (
          <div className="text-sm text-muted-foreground">
            Select a model to view details
          </div>
        )}
      </div>
    </div>
  );
}

