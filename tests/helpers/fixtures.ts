import { eq } from "drizzle-orm";
import { examSchedules, users } from "@db/schema";
import { getDb } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";
import type { RoleCode } from "@/lib/permissions";
import { utcToZonedInput } from "@/lib/time/zone";
import { examSchema, questionSchema, scheduleSchema, sectionSchema, candidateSchema } from "@/lib/validation/schemas";
import type { Actor } from "@/server/services/audit-service";
import { loginCandidate } from "@/server/services/auth-service";
import { createCandidate } from "@/server/services/candidate-service";
import { addSection, attachQuestions, createExam, getExamDetail, setExamStatus } from "@/server/services/exam-service";
import { createQuestion } from "@/server/services/question-service";
import { adminTransition, assignCandidates, createSchedule } from "@/server/services/schedule-service";
import { resolveCandidateSession, type CandidatePrincipal } from "@/server/services/session-service";

export const META = { ip: "10.0.0.1", userAgent: "vitest", workstationCode: null };
const TZ = "Asia/Kolkata";

let seq = 0;
const uniq = (p: string) => `${p}${++seq}`;

export async function createAdmin(role: RoleCode = "SUPER_ADMIN", password = "Admin@12345"): Promise<Actor & { id: string; username: string; password: string }> {
  const username = uniq(role.toLowerCase());
  const [u] = await getDb()
    .insert(users)
    .values({ username, fullName: `Test ${role}`, passwordHash: await hashPassword(password), roleCode: role })
    .returning({ id: users.id });
  return { type: "ADMIN", id: u!.id, label: username, role, username, password };
}

export type SampleExam = {
  examId: string;
  sectionIds: string[];
  /** questionId -> { correct, wrong } option ids */
  questions: { id: string; correctOptionId: string; wrongOptionId: string; sectionIndex: number }[];
};

/**
 * Two sections × `perSection` questions. Section 1: +2/−0.5, section 2: +1/−0.25.
 */
export async function createSampleExam(actor: Actor, perSection = 2): Promise<SampleExam> {
  const code = uniq("EXAM");
  const { id: examId } = await createExam(
    actor,
    examSchema.parse({ code, examType: "SSC_CGL", titleEn: `Mock ${code}`, titleHi: `मॉक ${code}`, defaultDurationMinutes: 60 }),
  );
  const sections = [
    { code: "GI", titleEn: "Reasoning", titleHi: "तर्कशक्ति", subject: "Reasoning", marksCorrect: 2, marksWrong: 0.5 },
    { code: "GA", titleEn: "General Awareness", titleHi: "सामान्य जागरूकता", subject: "GA", marksCorrect: 1, marksWrong: 0.25 },
  ];
  const out: SampleExam = { examId, sectionIds: [], questions: [] };
  for (const s of sections) {
    const { id: sectionId } = await addSection(actor, examId, sectionSchema.parse(s));
    out.sectionIds.push(sectionId);
    const qIds: string[] = [];
    for (let i = 0; i < perSection; i++) {
      const qcode = uniq("Q");
      const { id } = await createQuestion(
        actor,
        questionSchema.parse({
          code: qcode,
          subject: s.subject,
          textEn: `Question ${qcode}?`,
          textHi: `प्रश्न ${qcode}?`,
          options: [
            { textEn: "Right", textHi: "सही", isCorrect: true },
            { textEn: "Wrong", textHi: "गलत", isCorrect: false },
            { textEn: "Also wrong", textHi: "यह भी गलत", isCorrect: false },
            { textEn: "Nope", textHi: "नहीं", isCorrect: false },
          ],
        }),
      );
      qIds.push(id);
    }
    await attachQuestions(actor, sectionId, qIds);
  }
  await setExamStatus(actor, examId, "READY");
  // Resolve option ids through the admin detail view.
  const detail = await getExamDetail(examId);
  detail.sections.forEach((s, sectionIndex) =>
    s.questions.forEach((q) => {
      const correct = q.correctOptionIds[0]!;
      const wrong = q.options.find((o) => o.id !== correct)!.id;
      out.questions.push({ id: q.id, correctOptionId: correct, wrongOptionId: wrong, sectionIndex });
    }),
  );
  return out;
}

export async function createCandidateLogin(actor: Actor, password = "Pass@123") {
  const rollNumber = uniq("ROLL");
  const { id } = await createCandidate(actor, candidateSchema.parse({ rollNumber, fullName: `Candidate ${rollNumber}`, password }));
  return { id, rollNumber, password };
}

export async function loginAs(c: { rollNumber: string; password: string }, workstationCode: string | null = null): Promise<{ token: string; principal: CandidatePrincipal }> {
  const { token } = await loginCandidate({ rollNumber: c.rollNumber, password: c.password }, { ...META, workstationCode });
  const principal = await resolveCandidateSession(token);
  if (!principal) throw new Error("login failed");
  return { token, principal };
}

/** Create + lock + publish a schedule relative to `base` (minutes). */
export async function createPublishedSchedule(
  actor: Actor,
  examId: string,
  candidateIds: string[],
  base: Date,
  opts: { loginOpensIn?: number; startsIn?: number; durationMinutes?: number; lateEntryMinutes?: number; allowPause?: boolean } = {},
) {
  const loginOpens = new Date(base.getTime() + (opts.loginOpensIn ?? 10) * 60_000);
  const start = new Date(base.getTime() + (opts.startsIn ?? 30) * 60_000);
  const { id } = await createSchedule(
    actor,
    scheduleSchema.parse({
      examId,
      title: uniq("Sitting "),
      timeZone: TZ,
      loginOpensAt: utcToZonedInput(loginOpens, TZ),
      startAt: utcToZonedInput(start, TZ),
      durationMinutes: opts.durationMinutes ?? 60,
      lateEntryMinutes: opts.lateEntryMinutes ?? 15,
      allowPause: opts.allowPause ?? true,
    }),
  );
  await assignCandidates(actor, id, { candidateIds });
  await adminTransition(actor, id, "SCHEDULE", null);
  await adminTransition(actor, id, "PUBLISH", null);
  const [row] = await getDb().select().from(examSchedules).where(eq(examSchedules.id, id));
  return row!;
}

let keySeq = 0;
export const key = () => `k-${Date.now()}-${++keySeq}`;
