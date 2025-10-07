"use client";

import SettingsIcon from "@/components/ui/SettingsIcon";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { User } from "lucide-react";
import SidebarToggle from "./SidebarToggle";
import UserAvatar from "../ui/UserAvatar";

interface SidebarFooterProps {
  user?: {
    name?: string;
    email?: string;
  };
}

export default function SidebarFooter({ user }: SidebarFooterProps) {
  const { isCollapsed } = useSidebar();
  if (isCollapsed) {
    return (
      <div className="flex-shrink-0 p-4 bg-sidebar">
        <div className="flex flex-col items-center gap-2">
          <SidebarToggle />
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0).toUpperCase() || (
              <User className="w-4 h-4" />
            )}
          </div>
          <button
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 text-sidebar-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 p-4 border-t bg-sidebar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.email ? (
              <UserAvatar email={user.email} />
            ) : (
              user?.name?.charAt(0).toUpperCase() || (
                <User className="w-4 h-4" />
              )
            )}
          </div>
          <span className="text-sm font-medium text-sidebar-foreground truncate">
            {user?.name}
          </span>
        </div>
        <button className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors">
          <SettingsIcon className="w-4 h-4 text-sidebar-foreground" />
        </button>
      </div>
    </div>
  );
}
