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
import { Check, Copy, Terminal } from "lucide-react";

const CURATED_MODELS = [
  { value: "gemma4", label: "Gemma 4" },
  { value: "llama4", label: "Llama 4" },
  { value: "qwen2.5", label: "Qwen 2.5" },
  { value: "deepseek-r1:latest", label: "DeepSeek R1" },
  { value: "deepseek-coder-v2", label: "DeepSeek Coder V2" },
  { value: "phi3", label: "Phi-3" },
];

interface ModelDownloadProps {
  onDownloadComplete?: () => void;
  installedModels?: string[];
}

export default function ModelDownload({
  installedModels = [],
}: ModelDownloadProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const command = `docker exec ollama ollama pull ${selectedModel}`;

  const isModelInstalled = (modelValue: string) =>
    installedModels.some((installed) => installed === modelValue);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInstalled = selectedModel ? isModelInstalled(selectedModel) : false;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Install New Models</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a model, then run the command in your terminal
        </p>
      </div>

      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {CURATED_MODELS.map((model) => {
            const installed = isModelInstalled(model.value);
            return (
              <SelectItem key={model.value} value={model.value}>
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

      {selectedModel && (
        <div className="space-y-2">
          {isInstalled ? (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <Check className="w-4 h-4" />
              <span>Already installed</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Terminal className="w-4 h-4" />
                <span>Run this command in your terminal</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                <span className="flex-1 select-all">{command}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 shrink-0 p-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
