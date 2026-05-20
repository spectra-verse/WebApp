"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewChat from "@/components/chat/NewChat";
import { getUserSettings } from "@/lib/actions/getUserSettings";

export default function ChatPage() {
  const [ollamaUrl, setOllamaUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        setOllamaUrl(settings.ollamaUrl);
      } catch {
        router.push("/settings?reason=no-database");
      }
    }
    load();
  }, [router]);

  if (ollamaUrl === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <NewChat ollamaUrl={ollamaUrl} />;
}
