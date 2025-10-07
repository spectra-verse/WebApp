"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Settings } from "lucide-react";
import { updateUserSettings } from "@/lib/actions/updateUserSettings";
import { testClientOllamaConnection } from "@/lib/ollama/clientOllama";
import { UserSettings } from "@/lib/db/types";
import ModelList from "./ModelList";
import ModelDownload from "./ModelDownload";

interface OllamaSettingsProps {
  initialSettings: UserSettings;
}

export default function OllamaSettings({
  initialSettings,
}: OllamaSettingsProps) {
  const [ollamaUrl, setOllamaUrl] = useState(initialSettings.ollamaUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [modelRefreshTrigger, setModelRefreshTrigger] = useState(0);
  const [installedModels, setInstalledModels] = useState<string[]>([]);

  useEffect(() => {
    setHasChanges(ollamaUrl !== initialSettings.ollamaUrl);
  }, [ollamaUrl, initialSettings.ollamaUrl]);

  const handleUrlChange = (value: string) => {
    setOllamaUrl(value);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!ollamaUrl.trim()) {
      setTestResult({
        success: false,
        message: "Please enter a valid URL",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testClientOllamaConnection(ollamaUrl);
      setTestResult({
        success: result.success,
        message: result.success
          ? result.message!
          : result.error || "Connection failed",
      });

      // Refresh models if connection is successful
      if (result.success) {
        setModelRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
      setTestResult({
        success: false,
        message: "Failed to test connection",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      await updateUserSettings(ollamaUrl);
      setTestResult({
        success: true,
        message: "Settings saved successfully",
      });
      setHasChanges(false);

      // Refresh models after saving new URL
      setModelRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      setTestResult({
        success: false,
        message: "Failed to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setOllamaUrl(initialSettings.ollamaUrl);
    setTestResult(null);
    setHasChanges(false);
  };

  const handleModelsLoaded = useCallback((models: { name: string }[]) => {
    setInstalledModels(models.map((m) => m.name));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Ollama Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ollama-url">Ollama Server URL</Label>
          <Input
            id="ollama-url"
            type="url"
            value={ollamaUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="http://localhost:11434/v1"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Enter the URL of your Ollama server. Include the full URL with
            protocol (http/https).
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">
            🔧 CORS Configuration Required
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-200">
            For browser-based connections, Ollama needs CORS enabled (Easiest
            option is run ollama as docker container). Set the environment
            variable: <strong>OLLAMA_ORIGINS=*</strong>
          </p>
          <code className="block bg-blue-100 dark:bg-blue-900 p-2 rounded text-xs font-mono text-blue-900 dark:text-blue-100">
            <strong>Docker:</strong>
            <br />
            <span className="text-xs text-gray-600">
              docker run -d -v ollama:/root/.ollama -p 11434:11434 -e
              OLLAMA_ORIGINS=&quot;*&quot; --name ollama
            </span>
            ollama/ollama
          </code>

          <code className="block bg-blue-100 dark:bg-blue-900 p-2 rounded text-xs font-mono text-blue-900 dark:text-blue-100">
            <strong>
              Mac OS / Linux: Set the OLLAMA_ORIGINS environment variable
            </strong>
            <br />
            <span className="text-xs text-gray-600 mt-4">
              export OLLAMA_ORIGINS=&quot;*&quot;
            </span>
          </code>

          <code className="block bg-blue-100 dark:bg-blue-900 p-2 rounded text-xs font-mono text-blue-900 dark:text-blue-100">
            <strong>For Windows (using PowerShell):</strong>
            <br />
            <span className="text-xs text-gray-600">
              $env:OLLAMA_ORIGINS=&quot;*&quot;
            </span>
          </code>
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Then restart Ollama. For production, replace * with your app&apos;s
            domain (e.g., https://spectraverse.net).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting || !ollamaUrl.trim()}
            className="w-full sm:w-auto"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          <div className="flex gap-2 flex-1">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 sm:flex-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>

            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {testResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              testResult.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="border-t pt-6">
          <ModelDownload
            onDownloadComplete={() =>
              setModelRefreshTrigger((prev) => prev + 1)
            }
            installedModels={installedModels}
          />
        </div>

        <div className="border-t pt-6">
          <ModelList
            refreshTrigger={modelRefreshTrigger}
            onRefreshComplete={() => setModelRefreshTrigger(0)}
            onModelsLoaded={handleModelsLoaded}
            ollamaUrl={ollamaUrl}
          />
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p className="font-medium">Default URL: http://localhost:11434/v1</p>
          <p>
            Make sure Ollama is running and accessible at the specified URL.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
