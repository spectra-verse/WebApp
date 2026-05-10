import { Suspense } from "react";
import NewChat from "@/components/chat/NewChat";
import { getUserSettings } from "@/lib/actions/getUserSettings";

export default async function ChatPage() {
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
