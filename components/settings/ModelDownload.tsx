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

import curated from "@/lib/models/curated-models.json";

type CuratedModel = {
  value: string;
  label: string;
  provider: string;
  category: string;
  sizeGB: number;
  capabilities: string[];
};

const CURATED_MODELS: CuratedModel[] = curated.models;

type InstallMode = "native" | "docker";

const PULL_COMMANDS: Record<InstallMode, (model: string) => string> = {
  native: (model) => `ollama pull ${model}`,
  docker: (model) => `docker exec ollama ollama pull ${model}`,
};

interface ModelDownloadProps {
  onDownloadComplete?: () => void;
  installedModels?: string[];
}

export default function ModelDownload({
  installedModels = [],
}: ModelDownloadProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [installMode, setInstallMode] = useState<InstallMode>("native");

  const command = PULL_COMMANDS[installMode](selectedModel);
  const selected = CURATED_MODELS.find((m) => m.value === selectedModel);

  // Ollama reports installed models with a tag (e.g. "gemma4:latest"), so
  // treat "gemma4" and "gemma4:latest" as the same model.
  const normalize = (name: string) =>
    name.includes(":") ? name : `${name}:latest`;
  const isModelInstalled = (modelValue: string) =>
    installedModels.some(
      (installed) => normalize(installed) === normalize(modelValue),
    );

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
        <SelectTrigger className="w-full sm:w-96">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {CURATED_MODELS.map((model) => {
            const installed = isModelInstalled(model.value);
            return (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
                <span className="ml-2 text-xs text-muted-foreground">
                  {model.category} · {model.sizeGB} GB
                </span>
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
              {selected && (
                <p className="text-sm text-muted-foreground">
                  {selected.provider} · ~{selected.sizeGB} GB download
                  {selected.capabilities.length > 0 &&
                    ` · ${selected.capabilities.join(", ")}`}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Terminal className="w-4 h-4" />
                <span>Run this command in your terminal</span>
                <div className="ml-auto flex gap-1">
                  {(["native", "docker"] as InstallMode[]).map((mode) => (
                    <Button
                      key={mode}
                      variant={installMode === mode ? "secondary" : "ghost"}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setInstallMode(mode)}
                    >
                      {mode === "native" ? "Native Ollama" : "Docker"}
                    </Button>
                  ))}
                </div>
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
