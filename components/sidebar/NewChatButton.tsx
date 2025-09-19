"use client";

import Link from "next/link";

export default function NewChatButton() {
  return (
    <Link className="bg-slate-600 p-2 rounded text-sm text-white mb-4" href="/">
      Start a new conversation
    </Link>
  );
}
