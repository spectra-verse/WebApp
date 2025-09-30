"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Settings } from "lucide-react";
import { updateUserSettings } from "@/lib/actions/updateUserSettings";
import { testOllamaConnection } from "@/lib/actions/testOllamaConnection";
import { UserSettings } from "@/lib/db/types";
import ModelList from "./ModelList";

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
      const result = await testOllamaConnection(ollamaUrl);
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
          <ModelList
            refreshTrigger={modelRefreshTrigger}
            onRefreshComplete={() => setModelRefreshTrigger(0)}
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

