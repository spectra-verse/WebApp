"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import { downloadOllamaModel } from "@/lib/actions/downloadOllamaModel";

const CURATED_MODELS = [
  { value: "gemma2:2b", label: "Gemma 2 (2B)" },
  { value: "qwen2.5:0.5b", label: "Qwen 2.5 (0.5B)" },
  { value: "tinyllama:latest", label: "TinyLlama (Latest)" },
  { value: "orca-mini:latest", label: "Orca Mini (Latest)" },
];

interface ModelDownloadProps {
  onDownloadComplete?: () => void;
  installedModels?: string[];
}

export default function ModelDownload({
  onDownloadComplete,
  installedModels = [],
}: ModelDownloadProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleDownload = async () => {
    if (!selectedModel) return;

    setIsDownloading(true);
    setDownloadResult(null);

    try {
      const result = await downloadOllamaModel(selectedModel);

      setDownloadResult({
        success: result.success,
        message: result.success
          ? result.message!
          : result.error || "Download failed",
      });

      if (result.success) {
        // Reset selection and trigger refresh
        setSelectedModel("");
        onDownloadComplete?.();
      }
    } catch (error) {
      console.error(error);
      setDownloadResult({
        success: false,
        message: "Failed to download model",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const isModelInstalled = (modelValue: string) => {
    return installedModels.some((installed) => installed === modelValue);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Download New Models</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a model from the curated list to download and install
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select a model to download" />
          </SelectTrigger>
          <SelectContent>
            {CURATED_MODELS.map((model) => {
              const installed = isModelInstalled(model.value);
              return (
                <SelectItem
                  key={model.value}
                  value={model.value}
                  disabled={installed}
                >
                  {model.label}
                  {installed && (
                    <span className="ml-2 text-xs text-green-600">
                      (Installed)
                    </span>
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Button
          onClick={handleDownload}
          disabled={!selectedModel || isDownloading}
          className="w-full sm:w-auto"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </div>

      {isDownloading && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>
            Downloading model... This may take several minutes depending on the
            model size.
          </span>
        </div>
      )}

      {downloadResult && !isDownloading && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            downloadResult.success
              ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {downloadResult.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{downloadResult.message}</span>
        </div>
      )}
    </div>
  );
}