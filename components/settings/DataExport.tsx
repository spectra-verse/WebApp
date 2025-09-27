"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportUserData } from "@/lib/actions/exportUserData";

export default function DataExport() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await exportUserData();

      if (result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Download all your data including conversations, messages, and settings.
          This will generate a SQLite database file containing all your information.
        </p>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full sm:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing Export...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download All Data
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Note: This feature is currently in development. The download functionality will be available soon.
        </p>
      </CardContent>
    </Card>
  );
}