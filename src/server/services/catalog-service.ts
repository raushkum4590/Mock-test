/** Exam categories, test series and premium entitlements (admin side). */
import { asc, desc, eq, sql } from "drizzle-orm";
import type { z } from "zod";
import { examCategories, exams, studentEntitlements, students, testSeries } from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { now } from "@/lib/time/clock";
import type { categorySchema, entitlementSchema, seriesSchema } from "@/lib/validation/schemas";
import { audit, authorize, type Actor } from "./audit-service";

export async function listAllCategories() {
  return getDb().select().from(examCategories).orderBy(asc(examCategories.position), asc(examCategories.nameEn));
}

export async function listAllSeries() {
  return getDb()
    .select({ s: testSeries, categoryName: examCategories.nameEn })
    .from(testSeries)
    .innerJoin(examCategories, eq(examCategories.id, testSeries.categoryId))
    .orderBy(asc(examCategories.position), asc(testSeries.titleEn));
}

export async function createCategory(actor: Actor, input: z.output<typeof categorySchema>) {
  authorize(actor, "exams.manage");
  const db = getDb();
  const [dup] = await db.select({ id: examCategories.id }).from(examCategories).where(eq(examCategories.slug, input.slug));
  if (dup) throw new AppError("CONFLICT", `Category ${input.slug} already exists.`);
  const [row] = await db.insert(examCategories).values(input).returning({ id: examCategories.id });
  await audit(db, actor, "category.create", { type: "category", id: row!.id }, { slug: input.slug });
  return row!;
}

export async function createSeries(actor: Actor, input: z.output<typeof seriesSchema>) {
  authorize(actor, "exams.manage");
  const db = getDb();
  const [dup] = await db.select({ id: testSeries.id }).from(testSeries).where(eq(testSeries.slug, input.slug));
  if (dup) throw new AppError("CONFLICT", `Test series ${input.slug} already exists.`);
  const [row] = await db.insert(testSeries).values(input).returning({ id: testSeries.id });
  await audit(db, actor, "series.create", { type: "series", id: row!.id }, { slug: input.slug });
  return row!;
}

/** Grant premium access (payments are not integrated; this is the manual path). */
export async function grantEntitlement(actor: Actor, input: z.output<typeof entitlementSchema>) {
  authorize(actor, "students.manage");
  const db = getDb();
  const [s] = await db.select({ id: students.id }).from(students).where(sql`lower(${students.email}) = lower(${input.email})`);
  if (!s) throw new AppError("NOT_FOUND", `No student with email ${input.email}.`);
  const expiresAt = input.validDays > 0 ? new Date(now().getTime() + input.validDays * 86_400_000) : null;
  const [row] = await db
    .insert(studentEntitlements)
    .values({ studentId: s.id, examId: input.examId ?? null, seriesId: input.seriesId ?? null, expiresAt, grantedBy: actor.id ?? null })
    .returning({ id: studentEntitlements.id });
  await audit(db, actor, "entitlement.grant", { type: "student", id: s.id }, { examId: input.examId, seriesId: input.seriesId, expiresAt });
  return row!;
}

export async function listEntitlements() {
  return getDb()
    .select({
      id: studentEntitlements.id,
      email: students.email,
      examTitle: exams.titleEn,
      seriesTitle: testSeries.titleEn,
      expiresAt: studentEntitlements.expiresAt,
      createdAt: studentEntitlements.createdAt,
    })
    .from(studentEntitlements)
    .innerJoin(students, eq(students.id, studentEntitlements.studentId))
    .leftJoin(exams, eq(exams.id, studentEntitlements.examId))
    .leftJoin(testSeries, eq(testSeries.id, studentEntitlements.seriesId))
    .orderBy(desc(studentEntitlements.createdAt))
    .limit(200);
}

export async function revokeEntitlement(actor: Actor, id: string) {
  authorize(actor, "students.manage");
  const db = getDb();
  const [row] = await db.delete(studentEntitlements).where(eq(studentEntitlements.id, id)).returning();
  if (!row) throw new AppError("NOT_FOUND", "Entitlement not found.");
  await audit(db, actor, "entitlement.revoke", { type: "student", id: row.studentId });
}
