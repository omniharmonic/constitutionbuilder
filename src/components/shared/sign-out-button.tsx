"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <button
      type="button"
      className="text-sm text-stone-400 hover:text-tension"
      onClick={handleSignOut}
    >
      Sign Out
    </button>
  );
}
