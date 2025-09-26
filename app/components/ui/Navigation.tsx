"use client";

import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";

type Session = typeof auth.$Infer.Session;

export default function Navigation({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => {
    return pathname === path;
  };

  async function handleSignout() {
    await authClient.signOut();
    router.push("/");
  }
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
            {session && (
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Home
              </Link>
            )}
            {session && (
              <Link
                href="/features"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/features")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Features
              </Link>
            )}
            {session && (
              <Link
                href="/features"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/features")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Solutions
              </Link>
            )}
            {session && (
              <Link
                href="/chat"
                className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                chat
              </Link>
            )}
            {session && (
              <button
                onClick={handleSignout}
                className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/explore")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign out
              </button>
            )}
            {!session && (
              <Link
                href="/auth"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
