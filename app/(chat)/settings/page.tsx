import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/actions/getUserData";
import { getUserSettings } from "@/lib/actions/getUserSettings";
import SettingsLayout from "@/components/settings/SettingsLayout";
import UserProfile from "@/components/settings/UserProfile";
import DataExport from "@/components/settings/DataExport";
import OllamaSettings from "@/components/settings/OllamaSettings";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  let userData;
  let userSettings;
  try {
    userData = await getUserData();
    userSettings = await getUserSettings();
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    redirect("/auth");
  }

  return (
    <SettingsLayout>
      <UserProfile user={userData} />
      <OllamaSettings initialSettings={userSettings} />
      <DataExport />
    </SettingsLayout>
  );
}