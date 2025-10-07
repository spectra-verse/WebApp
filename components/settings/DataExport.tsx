"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Trash2 } from "lucide-react";
import { deleteAllConversations } from "@/lib/actions/deleteAllConversations";
import DeleteChatHistoryDialog from "./DeleteChatHistoryDialog";

interface Conversation {
  id: string;
  userId: string;
  name: string;
  model?: string;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  conversationId: string;
  userId: string;
  role: string;
}

export default function DataExport() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const generateCSV = (conversations: Conversation[], messages: Message[]) => {
    // CSV headers
    const headers = ["type", "id", "name", "conversationId", "content", "role", "model", "createdAt"];
    const rows = [headers.join(",")];

    // Add conversation rows
    conversations.forEach((conv) => {
      const row = [
        "conversation",
        conv.id,
        `"${conv.name.replace(/"/g, '""')}"`, // Escape quotes in name
        "",
        "",
        "",
        conv.model || "",
        conv.createdAt,
      ];
      rows.push(row.join(","));
    });

    // Add message rows
    messages.forEach((msg) => {
      const row = [
        "message",
        msg.id,
        "",
        msg.conversationId,
        `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes in content
        msg.role,
        "",
        msg.createdAt,
      ];
      rows.push(row.join(","));
    });

    return rows.join("\n");
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch user data from API
      const response = await fetch("/api/user-data");

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Generate CSV
      const csvContent = generateCSV(data.conversations, data.messages);

      // Download CSV
      const timestamp = new Date().toISOString().split("T")[0];
      downloadCSV(csvContent, `user-data-${timestamp}.csv`);

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
            Download all your data including conversations and messages in CSV
            format. This will generate a CSV file containing all your information.
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

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete all your chat history, including all
              conversations and messages.
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

