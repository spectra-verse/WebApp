"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Settings } from "lucide-react";
import { testClientOllamaConnection } from "@/lib/ollama/clientOllama";
import { UserSettings } from "@/lib/db/types";
import ModelList from "./ModelList";
import ModelDownload from "./ModelDownload";
import InstallCommandInline from "../InstallCommandInline";

interface OllamaSettingsProps {
  initialSettings: UserSettings;
}

export default function OllamaSettings({
  initialSettings,
}: OllamaSettingsProps) {
  const [ollamaUrl, setOllamaUrl] = useState(initialSettings.ollamaUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [modelRefreshTrigger, setModelRefreshTrigger] = useState(0);
  const [installedModels, setInstalledModels] = useState<string[]>([]);

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await testClientOllamaConnection(
          initialSettings.ollamaUrl,
        );
        setTestResult({
          success: result.success,
          message: result.success
            ? result.message!
            : result.error || "Connection failed",
        });
      } catch {
        setTestResult({
          success: false,
          message: "Failed to connect to Ollama server",
        });
      }
    }
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            readOnly
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
        <div>
          {testResult && (
            <>
              <div
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  testResult.success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {testResult.success ?? <CheckCircle className="w-4 h-4" />}
                <span>
                  {testResult.success && testResult.message}
                  {!testResult.success && (
                    <>
                      <br />
                      <span className="font-semibold mb-2 inline-block">
                        Failed to connect to Ollama server
                        <br />
                        {/* Run the setup script to install and configure it: */}
                        {/* <br /> */}
                        {/* <code> */}
                        {/*   curl -fsSL ./scripts/spectraverse-install.sh | bash */}
                        {/* </code> */}
                      </span>
                      <InstallCommandInline />
                    </>
                  )}
                </span>
              </div>
            </>
          )}
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
        </div>

        {testResult && (
          <div className="border-t pt-6">
            <ModelDownload
              onDownloadComplete={() =>
                setModelRefreshTrigger((prev) => prev + 1)
              }
              installedModels={installedModels}
            />
          </div>
        )}
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
