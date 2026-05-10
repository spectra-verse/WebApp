"use client";

import { useEffect, useState } from "react";
import NewChat from "@/components/chat/NewChat";
import { getUserSettings } from "@/lib/actions/getUserSettings";

export default function ChatPage() {
  const [ollamaUrl, setOllamaUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const settings = await getUserSettings();
      setOllamaUrl(settings.ollamaUrl);
    }
    load();
  }, []);

  if (ollamaUrl === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <NewChat ollamaUrl={ollamaUrl} />;
}
