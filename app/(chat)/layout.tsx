import Sidebar from "@/components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
