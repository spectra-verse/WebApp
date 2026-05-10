"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";

export default function Navigation() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="backdrop-blur-sm sticky top-0 z-50 shadow-sm bg-background/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-1">
          <Image src="/logo_1.png" width={30} height={30} alt="Spectraverse" />
          <span className="text-lg font-medium text-foreground">
            Spectraverse
          </span>
        </Link>
        <div className="flex justify-end items-center h-16">
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/") ? "text-foreground bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/chat"
              className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Chat
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
