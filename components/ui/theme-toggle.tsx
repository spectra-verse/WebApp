"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

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

