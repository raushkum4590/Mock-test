/**
 * Request validation schemas, shared by API routes (authoritative) and
 * client forms (React Hook Form + zodResolver, for early feedback).
 */
import { z } from "zod";
import { ADMIN_ACTIONS } from "@/lib/exam-engine/state-machine";
import { ROLE_CODES } from "@/lib/permissions";
import { MIN_ADMIN_PASSWORD_LENGTH, MIN_CANDIDATE_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

const trimmed = (max: number) => z.string().trim().min(1, "Required").max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));
const code = (max = 40) =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .max(max)
    .regex(/^[A-Za-z0-9][A-Za-z0-9_\-./]*$/, "Use letters, digits, - _ . / only");
const id = z.uuid();
const marksValue = z.coerce.number().min(0).max(100);
export const localDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, "Use YYYY-MM-DDTHH:mm");
const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Must be a /path or http(s) URL")
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

// The group values match ExamGroup in src/lib/exam-patterns.ts.
export const EXAM_TYPES = ["SSC_CGL", "SSC_CHSL", "SSC_JE", "SSC", "BANKING", "RAILWAY", "TEACHING", "UPSC", "STATE_PSC", "DEFENCE", "POLICE", "INSURANCE", "GOVT_OTHER", "OTHER"] as const;
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export const LANGUAGES = ["en", "hi"] as const;
export type Language = (typeof LANGUAGES)[number];

// --- Auth -------------------------------------------------------------------

export const adminLoginSchema = z.object({
  username: trimmed(64),
  password: z.string().min(1, "Required").max(256),
});

export const candidateLoginSchema = z.object({
  rollNumber: trimmed(40),
  password: z.string().min(1, "Required").max(256),
});

export const setupSchema = z.object({
  token: z.string().min(1, "Required"),
  username: code(64),
  fullName: trimmed(150),
  password: z.string().min(MIN_ADMIN_PASSWORD_LENGTH, `At least ${MIN_ADMIN_PASSWORD_LENGTH} characters`).max(256),
});

export const createUserSchema = z.object({
  username: code(64),
  fullName: trimmed(150),
  password: z.string().min(MIN_ADMIN_PASSWORD_LENGTH, `At least ${MIN_ADMIN_PASSWORD_LENGTH} characters`).max(256),
  roleCode: z.enum(ROLE_CODES),
});

// --- Students (online platform) ----------------------------------------------------

export const MIN_STUDENT_PASSWORD_LENGTH = 8;
const email = z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address"));

export const studentRegisterSchema = z.object({
  fullName: trimmed(150),
  email,
  password: z.string().min(MIN_STUDENT_PASSWORD_LENGTH, `At least ${MIN_STUDENT_PASSWORD_LENGTH} characters`).max(256),
  preferredLanguage: z.enum(["en", "hi"]).default("en"),
});
export const studentLoginSchema = z.object({ email, password: z.string().min(1, "Required").max(256) });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(MIN_STUDENT_PASSWORD_LENGTH, `At least ${MIN_STUDENT_PASSWORD_LENGTH} characters`).max(256),
});
export const studentProfileSchema = z.object({
  fullName: trimmed(150),
  displayName: trimmed(60),
  preferredLanguage: z.enum(["en", "hi"]),
  showOnLeaderboard: z.boolean(),
});

export const categorySchema = z.object({
  slug: z.string().trim().toLowerCase().min(1).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, digits and hyphens"),
  nameEn: trimmed(120),
  nameHi: optionalText(120),
  descriptionEn: optionalText(2000),
  descriptionHi: optionalText(2000),
  position: z.coerce.number().int().min(0).max(1000).default(0),
});

export const seriesSchema = z.object({
  slug: z.string().trim().toLowerCase().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, digits and hyphens"),
  categoryId: z.uuid(),
  titleEn: trimmed(200),
  titleHi: optionalText(200),
  descriptionEn: optionalText(2000),
  accessLevel: z.enum(["FREE", "PREMIUM"]).default("FREE"),
  isPublished: z.coerce.boolean().default(true),
});

export const entitlementSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    examId: z.uuid().optional().nullable().or(z.literal("").transform(() => null)),
    seriesId: z.uuid().optional().nullable().or(z.literal("").transform(() => null)),
    validDays: z.coerce.number().int().min(0).max(3650).default(365), // 0 = no expiry
  })
  .refine((e) => e.examId || e.seriesId, "Choose a test or a test series");

// --- Exams and questions --------------------------------------------------------

// Keep in sync with TEST_KINDS in drizzle/schema.ts (not imported here so
// client bundles do not pull in the ORM).
export const TEST_KINDS = ["FULL", "SECTIONAL", "TOPIC", "PYQ", "QUIZ"] as const;
const optionalId = id.optional().nullable().or(z.literal("").transform(() => null));
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, digits and single hyphens")
  .optional()
  .nullable()
  .or(z.literal("").transform(() => null));

export const examSchema = z
  .object({
    code: code(),
    examType: z.enum(EXAM_TYPES),
    titleEn: trimmed(200),
    titleHi: optionalText(200),
    instructionsEn: optionalText(20000),
    instructionsHi: optionalText(20000),
    defaultDurationMinutes: z.coerce.number().int().min(1).max(600),
    allowAnswerReview: z.coerce.boolean().default(false),
    // Online mock-test settings
    slug,
    descriptionEn: optionalText(5000),
    descriptionHi: optionalText(5000),
    categoryId: optionalId,
    seriesId: optionalId,
    testKind: z.enum(TEST_KINDS).default("FULL"),
    // Visible to students by default (Testbook-style: no separate publish step).
    isPublic: z.coerce.boolean().default(true),
    accessLevel: z.enum(["FREE", "PREMIUM"]).default("FREE"),
    timed: z.coerce.boolean().default(true),
    maxAttempts: z.coerce.number().int().min(0).max(100).default(0),
    resultPolicy: z.enum(["IMMEDIATE", "AT_TIME"]).default("IMMEDIATE"),
    // Wall-clock in EXAM_TIME_ZONE, like schedule times.
    resultReleaseAt: localDateTime.optional().nullable().or(z.literal("").transform(() => null)),
  })
  .refine((e) => e.resultPolicy !== "AT_TIME" || !!e.resultReleaseAt, {
    message: "Set the result release time",
    path: ["resultReleaseAt"],
  });
export type ExamInput = z.input<typeof examSchema>;

export const examStatusSchema = z.object({ status: z.enum(["DRAFT", "READY", "ARCHIVED"]) });

export const sectionSchema = z.object({
  code: code(),
  titleEn: trimmed(200),
  titleHi: optionalText(200),
  subject: trimmed(100),
  marksCorrect: marksValue,
  marksWrong: marksValue,
  // Sectional timing (optional): sections with the same group share one fixed timer.
  timerGroup: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => v || null),
  groupMinutes: z.preprocess((v) => (v === "" || v === undefined ? null : v), z.coerce.number().int().min(1).max(600).nullable()).optional(),
});
export type SectionInput = z.input<typeof sectionSchema>;

export const optionSchema = z
  .object({
    textEn: optionalText(2000),
    textHi: optionalText(2000),
    imageUrl,
    isCorrect: z.coerce.boolean().default(false),
  })
  .refine((o) => o.textEn || o.textHi || o.imageUrl, "Option needs text or an image");

export const questionSchema = z
  .object({
    code: code(),
    subject: trimmed(100),
    topic: optionalText(100),
    difficulty: z.enum(DIFFICULTIES).default("MEDIUM"),
    textEn: optionalText(10000),
    textHi: optionalText(10000),
    imageUrl,
    explanationEn: optionalText(10000),
    explanationHi: optionalText(10000),
    marksCorrect: z.coerce.number().min(0).max(100).optional().nullable(),
    marksWrong: z.coerce.number().min(0).max(100).optional().nullable(),
    isActive: z.coerce.boolean().default(true),
    options: z.array(optionSchema).min(2, "At least 2 options").max(6),
  })
  .refine((q) => q.textEn || q.textHi, { message: "English or Hindi question text is required", path: ["textEn"] })
  .refine((q) => q.options.filter((o) => o.isCorrect).length === 1, {
    message: "Exactly one option must be correct",
    path: ["options"],
  });
export type QuestionInput = z.input<typeof questionSchema>;

export const attachQuestionsSchema = z.object({
  questionIds: z.array(id).min(1).max(500),
});

// --- Candidates, batches, workstations ------------------------------------------

export const batchSchema = z.object({
  code: code(),
  name: trimmed(150),
  description: optionalText(1000),
});

export const candidateSchema = z.object({
  rollNumber: code(),
  fullName: trimmed(150),
  password: z
    .string()
    .max(256)
    .optional()
    .nullable()
    .refine((v) => !v || v.length >= MIN_CANDIDATE_PASSWORD_LENGTH, `At least ${MIN_CANDIDATE_PASSWORD_LENGTH} characters`)
    .transform((v) => (v ? v : null)),
  batchId: id.optional().nullable().or(z.literal("").transform(() => null)),
  centreId: id.optional().nullable().or(z.literal("").transform(() => null)),
  photoUrl: imageUrl,
  preferredLanguage: z.enum(LANGUAGES).default("en"),
});
export type CandidateInput = z.input<typeof candidateSchema>;

export const candidateUpdateSchema = z.object({
  fullName: trimmed(150).optional(),
  isActive: z.boolean().optional(),
  batchId: id.nullable().optional(),
  centreId: id.nullable().optional(),
  resetPassword: z.boolean().optional(),
  newPassword: z.string().min(MIN_CANDIDATE_PASSWORD_LENGTH).max(256).optional(),
});

export const workstationSchema = z.object({
  code: code(),
  centreId: id.optional().nullable().or(z.literal("").transform(() => null)),
  label: optionalText(100),
  lab: optionalText(100),
  ipAddress: optionalText(64),
});

export const centreSchema = z.object({
  code: code(),
  name: trimmed(150),
  city: optionalText(100),
  address: optionalText(500),
});

// --- Schedules ---------------------------------------------------------------

export const scheduleSchema = z
  .object({
    examId: id,
    batchId: id.optional().nullable().or(z.literal("").transform(() => null)),
    title: trimmed(200),
    timeZone: z.string().trim().min(1).max(64).default("Asia/Kolkata"),
    loginOpensAt: localDateTime,
    startAt: localDateTime,
    durationMinutes: z.coerce.number().int().min(1).max(600),
    lateEntryMinutes: z.coerce.number().int().min(0).max(600).default(15),
    enforceWorkstation: z.coerce.boolean().default(false),
    allowPause: z.coerce.boolean().default(true),
    // Proctoring (the admin form turns these on by default for new schedules).
    requirePhoto: z.coerce.boolean().default(false),
    cameraMonitoring: z.coerce.boolean().default(false),
    requireFullscreen: z.coerce.boolean().default(false),
    violationLimit: z.coerce.number().int().min(0).max(50).default(3),
    autoSubmitOnViolations: z.coerce.boolean().default(false),
  })
  .refine((s) => s.loginOpensAt <= s.startAt, {
    message: "Login must open at or before the start time",
    path: ["loginOpensAt"],
  });
export type ScheduleInput = z.input<typeof scheduleSchema>;

export const transitionSchema = z.object({
  action: z.enum(ADMIN_ACTIONS),
  reason: optionalText(500),
});

export const assignmentSchema = z
  .object({
    candidateIds: z.array(id).max(5000).optional(),
    fromBatch: z.boolean().optional(),
  })
  .refine((a) => a.fromBatch || (a.candidateIds && a.candidateIds.length > 0), "Nothing to assign");

export const workstationAssignmentSchema = z.object({
  assignmentId: id,
  workstationId: id.nullable(),
});

// --- Candidate exam runtime ------------------------------------------------------

export const startAttemptSchema = z.object({
  scheduleId: id,
  language: z.enum(LANGUAGES).default("en"),
});

export const answerChangeSchema = z.object({
  questionId: id,
  selectedOptionId: id.nullable(),
  markedForReview: z.boolean(),
  revision: z.number().int().min(1).max(1_000_000),
  idempotencyKey: z.string().min(8).max(80),
});
export type AnswerChange = z.infer<typeof answerChangeSchema>;

export const saveAnswersSchema = z.object({
  attemptId: id,
  changes: z.array(answerChangeSchema).min(1).max(50),
});

export const submitSchema = z.object({
  attemptId: id,
});

export const languageSchema = z.object({ language: z.enum(LANGUAGES) });
