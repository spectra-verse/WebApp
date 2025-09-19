"use client";
import { FilePenLine } from "lucide-react";


import Link from "next/link";

export default function NewChatButton() {
  return (
    <Link className="bg-slate-600 p-2 rounded text-sm flex gap-4 text-white mb-4" href="/">
      <FilePenLine />
      Start a new conversation
    </Link>
  );
}
