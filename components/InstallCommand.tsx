"use client";

import { useState } from "react";
import { Clipboard, Check, AlertTriangle, Zap } from "lucide-react";

type Tab = "macos" | "windows";

const COMMANDS: Record<Tab, string> = {
  macos: "curl -fsSL https://cdn.jsdelivr.net/gh/spectra-verse/WebApp@main/scripts/spectraverse-install.sh | bash",
  windows: "# TODO: add Windows install command",
};

const prerequisites = [
  { label: "Docker Desktop", note: "with daemon running" },
];

export default function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("macos");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COMMANDS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl text-left">
      <div className="rounded-xl border-2 border-t-4 border-amber-500/60 border-t-amber-500 bg-background shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <span className="text-sm font-semibold">Quick Setup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                onClick={() => setActiveTab("macos")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === "macos"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                macOS / Linux
              </button>
              <button
                onClick={() => setActiveTab("windows")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === "windows"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Windows
              </button>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Required
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Prerequisites */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3.5" />
              Before you begin
            </div>
            <ul className="space-y-1">
              {prerequisites.map(({ label, note }) => (
                <li key={label} className="flex items-center gap-2 text-sm">
                  <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span className="font-medium">{label}</span>
                  {note && (
                    <span className="text-muted-foreground">— {note}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Terminal command block */}
          <div className="overflow-hidden rounded-lg bg-zinc-900 dark:bg-zinc-950">
            <div className="flex items-center gap-1.5 border-b border-zinc-700 px-4 py-2">
              <span className="size-2.5 rounded-full bg-red-500/70" />
              <span className="size-2.5 rounded-full bg-yellow-500/70" />
              <span className="size-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-zinc-500">terminal</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="select-none font-mono text-sm text-green-400">$</span>
              <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-zinc-100">
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

          <p className="text-xs text-muted-foreground">
            Sets up Ollama and the local database in Docker. Takes ~2 minutes on first run.
          </p>
        </div>
      </div>
    </div>
  );
}
