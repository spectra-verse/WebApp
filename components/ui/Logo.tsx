"use client";
import Image from "next/image";
import { useSidebar } from "@/components/providers/sidebar-provider";
export default function Logo() {
  const { isCollapsed } = useSidebar();
  return (
    <>
      <Image src="/logo_1.png" width={30} height={30} alt="Spectraverse" />
      {!isCollapsed && (
        <span className="text-lg font-medium text-foreground">
          Spectraverse
        </span>
      )}
    </>
  );
}
