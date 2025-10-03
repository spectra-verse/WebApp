import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import NewChat from "@/components/chat/NewChat";
import { getUserSettings } from "@/lib/actions/getUserSettings";

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth");
  }

  const settings = await getUserSettings();

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <NewChat ollamaUrl={settings.ollamaUrl} />
    </Suspense>
  );
}
