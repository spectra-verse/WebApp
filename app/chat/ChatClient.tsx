"use client";

import { signOut } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";

export default function ChatClient() {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };
  return (
    <div>
      <button onClick={handleSignOut}>Sign out</button>
      <h1>Chat</h1>
    </div>
  );
}
