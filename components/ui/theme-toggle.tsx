"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-9 h-9 px-0"
        disabled
      >
        <Sun className="h-4 w-4 transition-all opacity-0" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-9 h-9 px-0"
    >
      {theme === "light" && (
        <Sun className="h-4 w-4 transition-all" />
      )}
      {theme === "dark" && (
        <Moon className="h-4 w-4 transition-all" />
      )}
      {theme === "system" && (
        <Monitor className="h-4 w-4 transition-all" />
      )}
      <span className="sr-only">
        {theme === "light" ? "Switch to dark theme" :
         theme === "dark" ? "Switch to system theme" :
         "Switch to light theme"}
      </span>
    </Button>
  );
}

