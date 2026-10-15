import { csvResponse, toCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/time/zone";
import { requireAdmin, route } from "@/server/http";
import { getAttendance } from "@/server/services/centre-service";

/** GET — centre-wise attendance for one sitting as CSV. */
export const GET = route<{ id: string }>(async (req, { params }) => {
  await requireAdmin(req, "monitoring.view");
  const { id } = await params;
  const { title, rows } = await getAttendance(id);
  const csv = toCsv(
    ["centre_code", "centre_name", "roll_number", "full_name", "workstation", "status", "started_at", "submitted_at", "submit_reason"],
    rows.map((r) => ({
      centre_code: r.centreCode ?? "",
      centre_name: r.centreName ?? "",
      roll_number: r.rollNumber,
      full_name: r.fullName,
      workstation: r.workstationCode ?? "",
      status: r.status,
      started_at: r.startedAt ? formatDateTime(r.startedAt) : "",
      submitted_at: r.submittedAt ? formatDateTime(r.submittedAt) : "",
      submit_reason: r.submitReason ?? "",
    })),
  );
  const safe = title.replace(/[^A-Za-z0-9-]+/g, "_").slice(0, 60);
  return csvResponse(`attendance_${safe}.csv`, csv);
});
