"use client";

import { useState } from "react";
import { Clipboard, Check } from "lucide-react";

type Tab = "macos" | "windows";

const COMMANDS: Record<Tab, string> = {
  macos:
    "curl -fsSL https://cdn.jsdelivr.net/gh/spectra-verse/WebApp@main/scripts/spectraverse-install.sh | bash",
  windows:
    "https://cdn.jsdelivr.net/gh/spectra-verse/WebApp@main/scripts/spectraverse-install.ps1",
};

export default function InstallCommandInline() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("macos");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COMMANDS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-zinc-900 dark:bg-zinc-950 max-w-2xl">
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-orange-600 font-semibold text-sm">
          Quick setup
        </span>
        <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
          <button
            onClick={() => setActiveTab("macos")}
            className={`rounded-md px-3 py-0.5 text-xs font-medium transition-colors ${
              activeTab === "macos"
                ? "bg-zinc-600 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            macOS / Linux
          </button>
          <button
            onClick={() => setActiveTab("windows")}
            className={`rounded-md px-3 py-0.5 text-xs font-medium transition-colors ${
              activeTab === "windows"
                ? "bg-zinc-600 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Windows
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="select-none font-mono text-sm text-green-400">$</span>
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-zinc-100 py-3">
          {COMMANDS[activeTab]}
        </code>
        <button
          onClick={handleCopy}
          className="ml-2 shrink-0 rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
          aria-label="Copy install command"
        >
          {copied ? (
            <Check className="size-4 text-green-400" />
          ) : (
            <Clipboard className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
