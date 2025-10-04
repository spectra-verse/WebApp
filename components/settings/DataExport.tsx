"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Trash2 } from "lucide-react";
import { exportUserData } from "@/lib/actions/exportUserData";
import { deleteAllConversations } from "@/lib/actions/deleteAllConversations";
import DeleteChatHistoryDialog from "./DeleteChatHistoryDialog";

export default function DataExport() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteAllConversations();
      if (result.success) {
        alert(result.message);
        // Redirect to chat page after deletion
        router.push("/chat");
        router.refresh();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete chat history. Please try again.");
    }
  };

  return (
    <>
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

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete all your chat history, including all conversations and messages.
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Chat History
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteChatHistoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}