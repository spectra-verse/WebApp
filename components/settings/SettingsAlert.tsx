"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reason = searchParams.get("reason");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (reason) {
      setIsVisible(true);
    }
  }, [reason]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remove the reason parameter from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("reason");
    router.replace(
      `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  if (!isVisible || !reason) return null;

  const getAlertContent = () => {
    switch (reason) {
      case "no-connection":
        return {
          title: "Cannot Connect to Local Backend",
          message:
            "Your local database and/or Ollama is not running. Run the setup script to start it: ./scripts/spectraverse-install.sh",
        };
      case "no-models":
        return {
          title: "No Models Installed",
          message:
            "No models are installed in your Ollama instance. Please install at least one model using 'ollama pull <model-name>' in your terminal.",
        };
      case "no-database":
        return {
          title: "Cannot Connect to Local Backend",
          message:
            "Your local database and/or Ollama is not running. Run the setup script to start it: ./scripts/spectraverse-install.sh",
        };
      default:
        return {
          title: "Ollama Configuration Required",
          message: "Please configure your Ollama settings to continue.",
        };
    }
  };

  const { title, message } = getAlertContent();

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
            {title}
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-500">
            {message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-800 dark:hover:text-yellow-400 transition-colors flex-shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
