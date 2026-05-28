"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Database } from "lucide-react";
import { checkDatabaseConnection } from "@/lib/actions/checkDatabaseConnection";

import { getLibSQLUrl } from "@/lib/client-db";
import InstallCommandInline from "../InstallCommandInline";

export default function DatabaseStatus() {
  const [isTesting, setIsTesting] = useState(false);
  const [dbUrl, setDbUrl] = useState("http://localhost:8080");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await checkDatabaseConnection();
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: "Failed to test connection" });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    setDbUrl(getLibSQLUrl());
    handleTestConnection();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Database URL</p>
          <p className="text-sm font-mono">{dbUrl}</p>
        </div>

        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={isTesting}
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

        {testResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              testResult.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {testResult.success ?? <CheckCircle className="w-4 h-4" />}
            {testResult && (
              <>
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm`}
                >
                  {testResult.success ?? <CheckCircle className="w-4 h-4" />}
                  <span>
                    {testResult.success ? (
                      testResult.message
                    ) : (
                      <span className="mb-4 inline-block">
                        Failed to connect to the database
                      </span>
                    )}
                    {!testResult.success && <InstallCommandInline />}
                    {/* {!testResult.success && ( */}
                    {/*   <> */}
                    {/*     <br /> */}
                    {/*     { */}
                    {/*       <span className="font-semibold"> */}
                    {/*         Run the setup script to install and configure it: */}
                    {/*         <br /> */}
                    {/*         <code> */}
                    {/*           curl -fsSL ./scripts/spectraverse-install.sh | */}
                    {/*           bash */}
                    {/*         </code> */}
                    {/*       </span> */}
                    {/*     } */}
                    {/*   </> */}
                    {/* )} */}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
