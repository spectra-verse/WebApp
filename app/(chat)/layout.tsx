import Sidebar from "@/components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import UserMenu from "@/components/ui/UserMenu";
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
          <main className="flex-1 overflow-hidden relative">
            {/* User menu in top right corner */}
            <div className="absolute top-4 right-6 z-10">
              {session?.user && (
                <UserMenu
                  user={{
                    name: session.user.name,
                    email: session.user.email
                  }}
                />
              )}
            </div>
            {/* <Navigation session={session} /> */}
            {children}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
