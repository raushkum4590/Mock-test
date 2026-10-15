import { requireAdminPage } from "@/lib/auth/session";
import { hasPermission, ROLES, isRoleCode } from "@/lib/permissions";
import { formatDateTime } from "@/lib/time/zone";
import { listAuditLogs } from "@/server/services/audit-service";
import { listAdminUsers } from "@/server/services/auth-service";
import { ActionButton } from "@/components/admin/action-button";
import { UserForm } from "@/components/admin/forms";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Users, audit & backup" };

export default async function SettingsPage() {
  const admin = await requireAdminPage("audit.view");
  const canUsers = hasPermission(admin.role, "users.manage");
  const canBackup = hasPermission(admin.role, "backup.manage");
  const [users, logs] = await Promise.all([canUsers ? listAdminUsers() : [], listAuditLogs({ limit: 150 })]);
  return (
    <>
      <h1 className="text-xl font-semibold">Users, audit & backup</h1>
      {canUsers && (
        <Card title="Administrative users">
          <Table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-mono">{u.username}</td>
                  <td>{u.fullName}</td>
                  <td>{isRoleCode(u.roleCode) ? ROLES[u.roleCode].name : u.roleCode}</td>
                  <td>{u.isActive ? <Badge tone="READY">Active</Badge> : <Badge tone="CANCELLED">Inactive</Badge>}</td>
                  <td>{formatDateTime(u.lastLoginAt)}</td>
                  <td>
                    {u.id !== admin.userId && (
                      <ActionButton url={`/api/admin/users/${u.id}`} method="PATCH" body={{ isActive: !u.isActive }} variant="ghost">
                        {u.isActive ? "Deactivate" : "Activate"}
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-4">
            <UserForm />
          </div>
        </Card>
      )}
      {canBackup && (
        <Card title="Backup">
          <p className="text-sm">
            <a className="text-primary underline" href="/api/admin/backup">
              Download a full JSON backup
            </a>{" "}
            (contains password hashes and answer keys — store it securely). Scheduled backups and restores are run on the server:{" "}
            <code>npm run backup</code>, <code>npm run restore -- &lt;file&gt; --replace --yes</code>. See docs/backup-restore.md.
          </p>
        </Card>
      )}
      <Card title="Audit log (latest 150)">
        <Table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                <td>
                  {l.actorType} {l.actorLabel && <span className="font-mono text-xs">{l.actorLabel}</span>}
                </td>
                <td className="font-mono text-xs">{l.action}</td>
                <td className="font-mono text-xs">{l.entityType ? `${l.entityType}:${l.entityId?.slice(0, 8)}` : ""}</td>
                <td className="max-w-sm truncate font-mono text-xs">{l.details ? JSON.stringify(l.details) : ""}</td>
                <td className="font-mono text-xs">{l.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
