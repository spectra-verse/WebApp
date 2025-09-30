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
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, CheckCircle, XCircle } from "lucide-react";

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

interface DownloadProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export default function ModelDownload({
  onDownloadComplete,
  installedModels = [],
}: ModelDownloadProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadResult, setDownloadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDownload = async () => {
    if (!selectedModel) return;

    setIsDownloading(true);
    setDownloadResult(null);
    setDownloadProgress(null);

    try {
      const response = await fetch("/api/ollama/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modelName: selectedModel }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data: DownloadProgress = JSON.parse(line);
              setDownloadProgress(data);

              // Check for completion
              if (data.status === "success") {
                setDownloadResult({
                  success: true,
                  message: `Model "${selectedModel}" downloaded successfully`,
                });
                setSelectedModel("");
                onDownloadComplete?.();
              }
            } catch (e) {
              console.error("Error parsing JSON line:", e, line);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setDownloadResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to download model",
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const isModelInstalled = (modelValue: string) => {
    return installedModels.some((installed) => installed === modelValue);
  };

  const getProgressPercentage = (): number => {
    if (!downloadProgress?.total || !downloadProgress?.completed) return 0;
    return (downloadProgress.completed / downloadProgress.total) * 100;
  };

  const renderProgressInfo = () => {
    if (!downloadProgress) return null;

    const { status, total, completed } = downloadProgress;
    const progressPercent = getProgressPercentage();

    // Determine if we should show progress bar or spinner
    const showProgressBar = total && completed && progressPercent > 0;

    return (
      <div className="space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-blue-900 dark:text-blue-100">
            {status}
          </span>
          {showProgressBar && (
            <span className="text-blue-700 dark:text-blue-300">
              {Math.round(progressPercent)}%
            </span>
          )}
        </div>

        {showProgressBar ? (
          <>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
              <span>{formatBytes(completed!)}</span>
              <span>{formatBytes(total!)}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {status.includes("pulling")
                ? "Preparing download..."
                : status.includes("verifying")
                  ? "Verifying download..."
                  : "Processing..."}
            </span>
          </div>
        )}
      </div>
    );
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
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={isDownloading}
        >
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
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
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

      {isDownloading && renderProgressInfo()}

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