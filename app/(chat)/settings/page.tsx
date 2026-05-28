"use client";

import { useEffect, useState } from "react";
import { getUserSettings } from "@/lib/actions/getUserSettings";
import SettingsLayout from "@/components/settings/SettingsLayout";
import OllamaSettings from "@/components/settings/OllamaSettings";
import DatabaseStatus from "@/components/settings/DatabaseStatus";

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<Awaited<
    ReturnType<typeof getUserSettings>
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        setUserSettings(settings);
      } catch {
        setUserSettings({
          id: "",
          userId: "",
          ollamaUrl: "http://localhost:11434/v1",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <SettingsLayout>
      <DatabaseStatus />
      <OllamaSettings initialSettings={userSettings!} />
    </SettingsLayout>
  );
}
