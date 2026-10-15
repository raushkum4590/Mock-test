import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { LiveMonitor } from "@/components/admin/live-monitor";

export const metadata = { title: "Monitor" };

export default async function MonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage("monitoring.view");
  const { id } = await params;
  return (
    <>
      <Link href="/admin/monitoring" className="text-sm text-primary underline">
        ← Live monitoring
      </Link>
      <LiveMonitor scheduleId={id} canHold={hasPermission(admin.role, "schedules.hold")} canEnd={hasPermission(admin.role, "schedules.end")} />
    </>
  );
}
