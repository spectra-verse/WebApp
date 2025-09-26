import Sidebar from "@/components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import Navigation from "@/app/components/ui/Navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <>
      <SidebarProvider>
        {/* <div className="flex h-[calc(100vh-4rem)]"> */}
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            {/* <Navigation session={session} /> */}
            {children}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
