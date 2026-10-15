"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded border border-white/40 px-3 py-1 hover:bg-white/10"
      onClick={async () => {
        await api("/api/auth/logout?who=admin", { method: "POST" }).catch(() => {});
        router.replace("/admin/login");
      }}
    >
      Logout
    </button>
  );
}
