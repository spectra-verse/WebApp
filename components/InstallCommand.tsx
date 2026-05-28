"use client";

import { useState } from "react";
import { Clipboard, Check, Zap, Box, Terminal, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

type Tab = "macos" | "macos-native" | "windows";

const COMMANDS: Record<Tab, string> = {
  macos:
    "curl -fsSL https://cdn.jsdelivr.net/gh/spectra-verse/WebApp@main/scripts/spectraverse-install.sh | bash",
  "macos-native":
    "curl -fsSL https://cdn.jsdelivr.net/gh/spectra-verse/WebApp@main/scripts/spectraverse-install-mac-native.sh | bash",
  windows:
    "https://cdn.jsdelivr.net/gh/spectra-verse/WebApp@main/scripts/spectraverse-install.ps1",
};

const STEP_TWO_DESC: Record<Tab, string> = {
  macos: "Installs Ollama, pulls the Gemma 4 model, and starts the local database — all in Docker.",
  "macos-native":
    "Installs Ollama natively via Homebrew for Metal GPU acceleration, and starts the local database in Docker.",
  windows:
    "Installs Ollama, pulls the Gemma 4 model, and starts the local database — all in Docker.",
};

export default function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("macos-native");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COMMANDS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl text-left">
      <div className="rounded-xl border-2 border-t-4 border-amber-500/60 border-t-amber-500 bg-background shadow-lg">

        {/* Header */}
        <div className="border-b border-border px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <span className="text-sm font-semibold">Getting Started</span>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Required
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Requires a one-time local backend setup — takes about 2 minutes.
          </p>
        </div>

        <div className="divide-y divide-border">

          {/* Step 1 */}
          <div className="flex gap-4 p-5">
            <div className="flex flex-col items-center gap-1">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                1
              </span>
              <span className="w-px flex-1 bg-border" />
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Box className="size-4 text-amber-500" />
                <span className="font-semibold text-sm">Install Docker Desktop</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Ollama and the local database run inside Docker containers.
                Install Docker Desktop and make sure it&apos;s running before continuing.
              </p>
              <a
                href="https://www.docker.com/get-started/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Download Docker <ArrowRight className="size-3" />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-5 min-w-0">
            <div className="flex flex-col items-center gap-1">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                2
              </span>
              <span className="w-px flex-1 bg-border" />
            </div>
            <div className="min-w-0 w-full pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="size-4 text-amber-500" />
                <span className="font-semibold text-sm">Run the setup script</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {STEP_TWO_DESC[activeTab]}
              </p>

              {/* Terminal block */}
              <div className="overflow-hidden rounded-lg bg-zinc-900 dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-500/70" />
                    <span className="size-2.5 rounded-full bg-yellow-500/70" />
                    <span className="size-2.5 rounded-full bg-green-500/70" />
                    <span className="ml-2 text-xs text-zinc-500">terminal</span>
                  </div>
                  <div className="flex gap-1 rounded-md bg-zinc-800 p-0.5">
                    <button
                      onClick={() => setActiveTab("macos-native")}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeTab === "macos-native"
                          ? "bg-zinc-600 text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      macOS (Native)
                    </button>
                    <button
                      onClick={() => setActiveTab("macos")}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeTab === "macos"
                          ? "bg-zinc-600 text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      macOS / Linux
                    </button>
                    <button
                      onClick={() => setActiveTab("windows")}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeTab === "windows"
                          ? "bg-zinc-600 text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Windows
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="select-none font-mono text-sm text-green-400">$</span>
                  <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-zinc-100 pb-2">
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
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 p-5">
            <div className="flex flex-col items-center">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                3
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="size-4 text-amber-500" />
                <span className="font-semibold text-sm">Open Spectraverse</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Once the script finishes, you&apos;re ready to go. No account needed.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                Go to Chat <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
