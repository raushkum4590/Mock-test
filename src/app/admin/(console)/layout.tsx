import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { hasPermission, ROLES, type Permission } from "@/lib/permissions";
import { BRAND } from "@/lib/i18n/site";
import { LogoutButton } from "@/components/admin/logout-button";

const NAV: { href: string; label: string; permission?: Permission }[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/exams", label: "Exams", permission: "exams.manage" },
  { href: "/admin/questions", label: "Question bank", permission: "questions.manage" },
  { href: "/admin/catalog", label: "Online catalogue", permission: "exams.manage" },
  { href: "/admin/students", label: "Students (online)", permission: "students.manage" },
  { href: "/admin/test-requests", label: "Test schedule requests", permission: "students.manage" },
  { href: "/admin/candidates", label: "Candidates", permission: "candidates.manage" },
  { href: "/admin/centres", label: "Exam centres", permission: "candidates.manage" },
  { href: "/admin/schedules", label: "Schedules", permission: "monitoring.view" },
  { href: "/admin/monitoring", label: "Live monitoring", permission: "monitoring.view" },
  { href: "/admin/results", label: "Results", permission: "results.view" },
  { href: "/admin/settings", label: "Users, audit & backup", permission: "audit.view" },
];

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  // Navigation is filtered for convenience only; every page and API
  // re-checks permissions on the server.
  const items = NAV.filter((n) => !n.permission || hasPermission(admin.role, n.permission));
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print flex items-center justify-between bg-primary px-6 py-3 text-white">
        <Link href="/admin/dashboard" className="font-semibold">
          {BRAND} — Admin
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span>
            {admin.fullName} <span className="opacity-80">({ROLES[admin.role].name})</span>
          </span>
          <LogoutButton />
        </div>
      </header>
      <div className="flex flex-1">
        <nav className="no-print w-56 shrink-0 border-r border-border bg-surface p-3" aria-label="Admin">
          <ul className="space-y-1 text-sm">
            {items.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block rounded px-3 py-2 hover:bg-slate-100">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1 space-y-4 p-6">{children}</main>
      </div>
    </div>
  );
}
