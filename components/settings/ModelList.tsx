"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, AlertCircle } from "lucide-react";
import { OllamaModel } from "@/lib/ollama/client";
import { getOllamaModels } from "@/lib/actions/getOllamaModels";
import { deleteOllamaModel } from "@/lib/actions/deleteOllamaModel";
import ModelCard from "./ModelCard";
import DeleteModelDialog from "./DeleteModelDialog";

interface ModelListProps {
  refreshTrigger?: number;
  onRefreshComplete?: () => void;
  onModelsLoaded?: (models: OllamaModel[]) => void;
}

export default function ModelList({
  refreshTrigger,
  onRefreshComplete,
  onModelsLoaded,
}: ModelListProps) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    model: OllamaModel | null;
  }>({ isOpen: false, model: null });

  const loadModels = useCallback(
    async (showRefreshLoader = false) => {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await getOllamaModels();

        if (result.success) {
          setModels(result.models);
          onModelsLoaded?.(result.models);
        } else {
          setError(result.error || "Failed to load models");
          setModels([]);
          onModelsLoaded?.([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to connect to Ollama server");
        setModels([]);
        onModelsLoaded?.([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        onRefreshComplete?.();
      }
    },
    [onRefreshComplete, onModelsLoaded],
  );

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadModels(true);
    }
  }, [refreshTrigger, loadModels]);

  const handleRefresh = () => {
    loadModels(true);
  };

  const handleDeleteModel = async (modelName: string) => {
    try {
      const result = await deleteOllamaModel(modelName);

      if (result.success) {
        // Remove the model from the list
        setModels((prev) => prev.filter((model) => model.name !== modelName));
      } else {
        setError(result.error || "Failed to delete model");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete model");
    }
  };

  const openDeleteDialog = (model: OllamaModel) => {
    setDeleteDialog({ isOpen: true, model });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, model: null });
  };

  const confirmDelete = async (modelName: string) => {
    await handleDeleteModel(modelName);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Installed Models</h3>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Installed Models</h3>
          <p className="text-sm text-muted-foreground">
            {models.length} model{models.length !== 1 ? "s" : ""} installed
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {models.length === 0 && !error ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No models installed
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No models found on your Ollama server. You can download models using
            the Ollama CLI.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
            ollama pull llama3:8b
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <ModelCard
              key={`${model.name}-${model.digest}`}
              model={model}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      {deleteDialog.model && (
        <DeleteModelDialog
          model={deleteDialog.model}
          isOpen={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

