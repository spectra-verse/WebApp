"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { OllamaModel } from "@/lib/ollama/client";
import { formatBytes } from "@/lib/utils/modelUtils";

interface DeleteModelDialogProps {
  model: OllamaModel;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (modelName: string) => Promise<void>;
}

export default function DeleteModelDialog({
  model,
  isOpen,
  onClose,
  onConfirm,
}: DeleteModelDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(model.name);
      onClose();
    } catch (error) {
      console.log(error);
      // Error handling will be done by parent component
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Model
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Are you sure you want to delete the following model?
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Model:
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-mono">
                {model.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Size:
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {formatBytes(model.size)}
              </span>
            </div>

            {model.details?.parameter_size && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Parameters:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {model.details.parameter_size}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Model"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

