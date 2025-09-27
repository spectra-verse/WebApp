import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/actions/getUserData";
import SettingsLayout from "@/components/settings/SettingsLayout";
import UserProfile from "@/components/settings/UserProfile";
import DataExport from "@/components/settings/DataExport";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  let userData;
  try {
    userData = await getUserData();
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    redirect("/auth");
  }

  return (
    <SettingsLayout>
      <UserProfile user={userData} />
      <DataExport />
    </SettingsLayout>
  );
}