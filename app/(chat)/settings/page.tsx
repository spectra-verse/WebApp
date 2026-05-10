import { getUserData } from "@/lib/actions/getUserData";
import { getUserSettings } from "@/lib/actions/getUserSettings";
import SettingsLayout from "@/components/settings/SettingsLayout";
import UserProfile from "@/components/settings/UserProfile";
import DataExport from "@/components/settings/DataExport";
import OllamaSettings from "@/components/settings/OllamaSettings";
import DatabaseStatus from "@/components/settings/DatabaseStatus";

export default async function SettingsPage() {
  const userData = await getUserData();
  const userSettings = await getUserSettings();

  return (
    <SettingsLayout>
      <UserProfile user={userData} />
      <OllamaSettings initialSettings={userSettings} />
      <DatabaseStatus />
      <DataExport />
    </SettingsLayout>
  );
}
