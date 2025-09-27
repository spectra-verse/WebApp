"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Info } from "lucide-react";
import { OllamaModel } from "@/lib/ollama/client";
import { formatBytes, formatRelativeTime, getModelDisplayName } from "@/lib/utils/modelUtils";

interface ModelCardProps {
  model: OllamaModel;
  onDelete: (model: OllamaModel) => void;
}

export default function ModelCard({ model, onDelete }: ModelCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {getModelDisplayName(model.name)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
            {model.name}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(model)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 ml-2 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Size:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatBytes(model.size)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Modified:</span>
          <span className="text-gray-900 dark:text-white">
            {formatRelativeTime(model.modified_at)}
          </span>
        </div>

        {model.details?.parameter_size && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Parameters:</span>
            <span className="text-gray-900 dark:text-white">
              {model.details.parameter_size}
            </span>
          </div>
        )}

        {model.details?.quantization_level && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Quantization:</span>
            <span className="text-gray-900 dark:text-white">
              {model.details.quantization_level}
            </span>
          </div>
        )}
      </div>

      {(model.details?.format || model.details?.family) && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Info className="w-3 h-3" />
            <span>
              {model.details.format && `Format: ${model.details.format}`}
              {model.details.format && model.details.family && " • "}
              {model.details.family && `Family: ${model.details.family}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}