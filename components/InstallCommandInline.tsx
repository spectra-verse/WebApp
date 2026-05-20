"use client";

import { useState } from "react";
import { Clipboard, Check } from "lucide-react";

const INSTALL_COMMAND =
  "curl -fsSL https://cdn.jsdelivr.net/gh/spectra-verse/WebApp@main/scripts/spectraverse-install.sh | bash";

export default function InstallCommandInline() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-zinc-900 dark:bg-zinc-950 max-w-2xl">
      <span className="px-3 mt-1 inline-block text-orange-600 font-semibold">
        Quick setup
      </span>
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="select-none font-mono text-sm text-green-400">$</span>
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-zinc-100 py-3">
          {INSTALL_COMMAND}
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
