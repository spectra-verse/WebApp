"use client";
import { useSidebar } from "@/components/providers/sidebar-provider";
import SidebarToggle from "./SidebarToggle";
export default function ShowToggleButton() {
  const { isCollapsed } = useSidebar();
  return !isCollapsed && <SidebarToggle />;
}
