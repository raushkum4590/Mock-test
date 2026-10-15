/**
 * Create an administrator from the server console (no master password, no
 * web exposure):
 *
 *   npm run admin:create -- --username admin --name "Centre Admin" [--role SUPER_ADMIN]
 *
 * Reset a forgotten password of an existing administrator (also reactivates
 * the account and signs out its sessions):
 *
 *   npm run admin:create -- --username admin --reset
 *
 * The password is read from the ADMIN_PASSWORD environment variable if set,
 * otherwise a strong random password is generated and printed once.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import { closeDb, getDb } from "@/lib/db/client";
import { generatePassword, hashPassword, MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { isRoleCode } from "@/lib/permissions";
import { audit, SYSTEM_ACTOR } from "@/server/services/audit-service";
import { createAdminUser, ensureRoles } from "@/server/services/auth-service";
import { revokeUserSessions } from "@/server/services/session-service";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function resetPassword(username: string, password: string) {
  const db = getDb();
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
  if (!user) throw new Error(`No administrator named "${username}".`);
  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash, isActive: true }).where(eq(users.id, user.id));
    await revokeUserSessions(tx, user.id);
    await audit(tx, { ...SYSTEM_ACTOR, label: "cli" }, "user.password_reset", { type: "user", id: user.id }, { username });
  });
}

async function main() {
  const username = arg("username");
  const reset = process.argv.includes("--reset");
  const fullName = arg("name") ?? username;
  const role = arg("role") ?? "SUPER_ADMIN";
  if (!username || !fullName) {
    throw new Error('Usage: npm run admin:create -- --username admin --name "Full Name" [--role SUPER_ADMIN]   or   --username admin --reset');
  }
  const provided = process.env.ADMIN_PASSWORD;
  if (provided && provided.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`);
  }
  const password = provided ?? generatePassword(16);
  if (reset) {
    await resetPassword(username, password);
    console.log(`Password reset for "${username}".`);
  } else {
    if (!isRoleCode(role)) throw new Error(`Unknown role ${role}. Use SUPER_ADMIN, EXAM_ADMIN, CONTENT_MANAGER, INVIGILATOR or RESULT_VIEWER.`);
    await ensureRoles();
    await createAdminUser({ ...SYSTEM_ACTOR, label: "cli" }, { username, fullName, password, roleCode: role });
    console.log(`Created ${role} "${username}".`);
  }
  if (!provided) console.log(`Generated password (shown once, store it safely): ${password}`);
}

main()
  .catch((err) => {
    console.error((err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
