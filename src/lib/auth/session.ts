/**
 * Session helpers for Server Components / pages (route handlers use
 * src/server/http.ts). This is the Data Access Layer entry point for pages:
 * every protected page calls requireAdminPage / requireCandidatePage.
 */
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { Actor } from "@/server/services/audit-service";
import {
  resolveAdminSession,
  resolveCandidateSession,
  resolveStudentSession,
  type AdminPrincipal,
  type CandidatePrincipal,
  type StudentPrincipal,
} from "@/server/services/session-service";
import { ADMIN_COOKIE, CANDIDATE_COOKIE, STUDENT_COOKIE } from "./cookie-names";

export const getAdmin = cache(async (): Promise<AdminPrincipal | null> => {
  const jar = await cookies();
  return resolveAdminSession(jar.get(ADMIN_COOKIE)?.value);
});

export const getCandidate = cache(async (): Promise<CandidatePrincipal | null> => {
  const jar = await cookies();
  return resolveCandidateSession(jar.get(CANDIDATE_COOKIE)?.value);
});

export const getStudent = cache(async (): Promise<StudentPrincipal | null> => {
  const jar = await cookies();
  return resolveStudentSession(jar.get(STUDENT_COOKIE)?.value);
});

/** Redirects to the student login, returning here afterwards. */
export async function requireStudentPage(returnTo = "/student"): Promise<StudentPrincipal> {
  const student = await getStudent();
  if (!student) redirect(`/student/login?next=${encodeURIComponent(returnTo)}`);
  return student;
}

export async function requireAdminPage(permission?: Permission): Promise<AdminPrincipal> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (permission && !hasPermission(admin.role, permission)) redirect("/admin/denied");
  return admin;
}

export async function requireCandidatePage(): Promise<CandidatePrincipal> {
  const candidate = await getCandidate();
  if (!candidate) redirect("/login");
  return candidate;
}

export function pageActor(admin: AdminPrincipal): Actor {
  return { type: "ADMIN", id: admin.userId, label: admin.username, role: admin.role };
}
