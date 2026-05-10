"use client";

import { useEffect, useState } from "react";
import { getUserData } from "@/lib/actions/getUserData";
import { getUserSettings } from "@/lib/actions/getUserSettings";
import SettingsLayout from "@/components/settings/SettingsLayout";
import UserProfile from "@/components/settings/UserProfile";
import DataExport from "@/components/settings/DataExport";
import OllamaSettings from "@/components/settings/OllamaSettings";
import DatabaseStatus from "@/components/settings/DatabaseStatus";

export default function SettingsPage() {
  const [userData, setUserData] = useState<Awaited<ReturnType<typeof getUserData>> | null>(null);
  const [userSettings, setUserSettings] = useState<Awaited<ReturnType<typeof getUserSettings>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [data, settings] = await Promise.all([
        getUserData(),
        getUserSettings(),
      ]);
      setUserData(data);
      setUserSettings(settings);
      setLoading(false);
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
      <UserProfile user={userData!} />
      <OllamaSettings initialSettings={userSettings!} />
      <DatabaseStatus />
      <DataExport />
    </SettingsLayout>
  );
}
