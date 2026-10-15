/**
 * Role-based permissions. This map is the authority used by every
 * server-side check; the `roles` table is seeded from it for display and
 * reporting, so editing the table cannot escalate privileges.
 *
 * Students are not staff roles: they authenticate separately (students
 * table, STUDENT sessions) and can only reach /student and /api/student.
 */
export const PERMISSIONS = [
  "exams.manage",
  "questions.manage",
  "candidates.manage",
  "students.manage",
  "schedules.manage",
  "schedules.publish",
  "schedules.hold", // emergency pause / resume
  "schedules.end", // end or cancel a live exam
  "monitoring.view",
  "results.view",
  "results.export",
  "users.manage",
  "audit.view",
  "backup.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_CODES = ["SUPER_ADMIN", "EXAM_ADMIN", "CONTENT_MANAGER", "INVIGILATOR", "RESULT_VIEWER"] as const;
export type RoleCode = (typeof ROLE_CODES)[number];

export const ROLES: Record<RoleCode, { name: string; description: string; permissions: readonly Permission[] }> = {
  SUPER_ADMIN: {
    name: "Super Admin",
    description: "Full access including users, backups and audit logs.",
    permissions: PERMISSIONS,
  },
  EXAM_ADMIN: {
    name: "Exam Administrator",
    description: "Manages exams, questions, candidates, students, schedules and results.",
    permissions: [
      "exams.manage",
      "questions.manage",
      "candidates.manage",
      "students.manage",
      "schedules.manage",
      "schedules.publish",
      "schedules.hold",
      "schedules.end",
      "monitoring.view",
      "results.view",
      "results.export",
      "audit.view",
    ],
  },
  CONTENT_MANAGER: {
    name: "Content Manager",
    description: "Creates mock tests, test series and question bank content.",
    permissions: ["exams.manage", "questions.manage"],
  },
  INVIGILATOR: {
    name: "Invigilator",
    description: "Monitors live exams and may apply an emergency hold.",
    permissions: ["monitoring.view", "schedules.hold"],
  },
  RESULT_VIEWER: {
    name: "Result Viewer",
    description: "Views and exports results.",
    permissions: ["results.view", "results.export"],
  },
};

export function isRoleCode(value: string): value is RoleCode {
  return (ROLE_CODES as readonly string[]).includes(value);
}

export function hasPermission(role: string, permission: Permission): boolean {
  if (!isRoleCode(role)) return false;
  return ROLES[role].permissions.includes(permission);
}
