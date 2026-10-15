/**
 * Database schema (PostgreSQL). Shared by Neon (Profile A) and a local
 * PostgreSQL server (Profile B) — both run the same migrations.
 *
 * Conventions:
 *  - All timestamps are `timestamptz` and are written in UTC by the server.
 *  - Marks are numeric(8,2) and read as JS numbers; scoring arithmetic is
 *    done in integer hundredths (see src/lib/scoring).
 *  - Primary keys are UUIDs so data can be merged between a local centre
 *    database and Neon without key collisions.
 */
import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const tstz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const createdAt = () => tstz("created_at").notNull().defaultNow();
const updatedAt = () => tstz("updated_at").notNull().defaultNow();
const marks = (name: string) => numeric(name, { precision: 8, scale: 2, mode: "number" });

export const SCHEDULE_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "WAITING",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

export const ATTEMPT_STATUSES = ["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED"] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export const scheduleStatusEnum = pgEnum("schedule_status", SCHEDULE_STATUSES);
export const attemptStatusEnum = pgEnum("attempt_status", ATTEMPT_STATUSES);

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export const roles = pgTable("roles", {
  code: varchar("code", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  createdAt: createdAt(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 64 }).notNull(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    roleCode: varchar("role_code", { length: 32 })
      .notNull()
      .references(() => roles.code),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: tstz("last_login_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_username_lower_uq").on(sql`lower(${t.username})`)],
);

export const examBatches = pgTable("exam_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  createdAt: createdAt(),
});

/** A physical exam centre (venue). Workstations and candidates belong to one. */
export const examCentres = pgTable("exam_centres", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Roll numbers are unique across the whole installation so a roll number
    // always identifies exactly one person, whichever exam they sit.
    rollNumber: varchar("roll_number", { length: 40 }).notNull(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    photoUrl: text("photo_url"),
    batchId: uuid("batch_id").references(() => examBatches.id, { onDelete: "set null" }),
    // Centre the candidate is allotted to (used for centre-wise attendance).
    centreId: uuid("centre_id").references(() => examCentres.id, { onDelete: "set null" }),
    preferredLanguage: varchar("preferred_language", { length: 2 }).notNull().default("en"),
    // false = not eligible / deactivated; blocks login.
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: tstz("last_login_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("candidates_roll_number_upper_uq").on(sql`upper(${t.rollNumber})`),
    index("candidates_batch_idx").on(t.batchId),
    index("candidates_centre_idx").on(t.centreId),
  ],
);

export const workstations = pgTable("workstations", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  centreId: uuid("centre_id").references(() => examCentres.id, { onDelete: "set null" }),
  label: varchar("label", { length: 100 }),
  lab: varchar("lab", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 64 }),
  isActive: boolean("is_active").notNull().default(true),
  lastSeenAt: tstz("last_seen_at"),
  createdAt: createdAt(),
});

/**
 * Self-registered online students (the mock-test platform). Separate from
 * `candidates`, who are issued roll numbers by an exam centre.
 */
export const students = pgTable(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 254 }).notNull(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    // Shown on leaderboards instead of the full name.
    displayName: varchar("display_name", { length: 60 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    preferredLanguage: varchar("preferred_language", { length: 2 }).notNull().default("en"),
    showOnLeaderboard: boolean("show_on_leaderboard").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: tstz("last_login_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("students_email_lower_uq").on(sql`lower(${t.email})`)],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    // HMAC of the emailed token; the token itself is never stored.
    id: varchar("id", { length: 64 }).primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    expiresAt: tstz("expires_at").notNull(),
    usedAt: tstz("used_at"),
    createdAt: createdAt(),
  },
  (t) => [index("password_reset_tokens_student_idx").on(t.studentId)],
);

/** Server-side sessions; the cookie carries a random token, the DB stores its HMAC. */
export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    subjectType: varchar("subject_type", { length: 16 }).notNull().$type<"ADMIN" | "CANDIDATE" | "STUDENT">(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }),
    workstationCode: varchar("workstation_code", { length: 40 }),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    lastSeenAt: tstz("last_seen_at").notNull().defaultNow(),
    expiresAt: tstz("expires_at").notNull(),
    revokedAt: tstz("revoked_at"),
  },
  (t) => [
    index("sessions_expires_idx").on(t.expiresAt),
    index("sessions_candidate_idx").on(t.candidateId),
    index("sessions_user_idx").on(t.userId),
    index("sessions_student_idx").on(t.studentId),
    check(
      "sessions_subject_ck",
      sql`(${t.subjectType} = 'ADMIN' AND ${t.userId} IS NOT NULL AND ${t.candidateId} IS NULL AND ${t.studentId} IS NULL)
       OR (${t.subjectType} = 'CANDIDATE' AND ${t.candidateId} IS NOT NULL AND ${t.userId} IS NULL AND ${t.studentId} IS NULL)
       OR (${t.subjectType} = 'STUDENT' AND ${t.studentId} IS NOT NULL AND ${t.userId} IS NULL AND ${t.candidateId} IS NULL)`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Exams and question bank
// ---------------------------------------------------------------------------

export const examCategories = pgTable("exam_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  nameEn: varchar("name_en", { length: 120 }).notNull(),
  nameHi: varchar("name_hi", { length: 120 }),
  descriptionEn: text("description_en"),
  descriptionHi: text("description_hi"),
  position: integer("position").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

export const testSeries = pgTable(
  "test_series",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => examCategories.id, { onDelete: "restrict" }),
    titleEn: varchar("title_en", { length: 200 }).notNull(),
    titleHi: varchar("title_hi", { length: 200 }),
    descriptionEn: text("description_en"),
    descriptionHi: text("description_hi"),
    accessLevel: varchar("access_level", { length: 16 }).notNull().default("FREE").$type<"FREE" | "PREMIUM">(),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("test_series_category_idx").on(t.categoryId)],
);

export const TEST_KINDS = ["FULL", "SECTIONAL", "TOPIC", "PYQ", "QUIZ"] as const;
export type TestKind = (typeof TEST_KINDS)[number];

/**
 * An exam is a paper (sections + questions + marking). It can be sat at an
 * exam centre through `exam_schedules`, and/or published online as a
 * self-paced mock test for students (the `public*` / practice fields).
 */
export const exams = pgTable(
  "exams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 40 }).notNull().unique(),
    examType: varchar("exam_type", { length: 32 }).notNull(), // SSC_CGL | SSC_CHSL | SSC_JE | OTHER
    titleEn: varchar("title_en", { length: 200 }).notNull(),
    titleHi: varchar("title_hi", { length: 200 }),
    instructionsEn: text("instructions_en"),
    instructionsHi: text("instructions_hi"),
    defaultDurationMinutes: integer("default_duration_minutes").notNull().default(60),
    status: varchar("status", { length: 16 }).notNull().default("DRAFT").$type<"DRAFT" | "READY" | "ARCHIVED">(),
    allowAnswerReview: boolean("allow_answer_review").notNull().default(false),
    // --- Online mock-test settings ---
    slug: varchar("slug", { length: 80 }).unique(),
    descriptionEn: text("description_en"),
    descriptionHi: text("description_hi"),
    categoryId: uuid("category_id").references(() => examCategories.id, { onDelete: "set null" }),
    seriesId: uuid("series_id").references(() => testSeries.id, { onDelete: "set null" }),
    testKind: varchar("test_kind", { length: 16 }).notNull().default("FULL").$type<TestKind>(),
    // Listed for students only when true AND status = READY.
    isPublic: boolean("is_public").notNull().default(false),
    accessLevel: varchar("access_level", { length: 16 }).notNull().default("FREE").$type<"FREE" | "PREMIUM">(),
    timed: boolean("timed").notNull().default(true),
    // 0 = unlimited attempts.
    maxAttempts: integer("max_attempts").notNull().default(0),
    resultPolicy: varchar("result_policy", { length: 16 }).notNull().default("IMMEDIATE").$type<"IMMEDIATE" | "AT_TIME">(),
    resultReleaseAt: tstz("result_release_at"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("exams_public_idx").on(t.isPublic, t.status),
    index("exams_category_idx").on(t.categoryId),
    check("exams_max_attempts_ck", sql`${t.maxAttempts} >= 0`),
  ],
);

export const examSections = pgTable(
  "exam_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }).notNull(),
    titleEn: varchar("title_en", { length: 200 }).notNull(),
    titleHi: varchar("title_hi", { length: 200 }),
    subject: varchar("subject", { length: 100 }).notNull(),
    position: integer("position").notNull(),
    marksCorrect: marks("marks_correct").notNull().default(2),
    // Stored as a positive magnitude that is subtracted for a wrong answer.
    marksWrong: marks("marks_wrong").notNull().default(0.5),
    // Sectional timing: sections with the same group share one fixed timer of
    // group_minutes; groups run one after another in section order. NULL =
    // the section follows only the overall exam timer.
    timerGroup: varchar("timer_group", { length: 40 }),
    groupMinutes: integer("group_minutes"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("exam_sections_exam_code_uq").on(t.examId, t.code),
    index("exam_sections_exam_idx").on(t.examId),
    check("exam_sections_marks_ck", sql`${t.marksCorrect} >= 0 AND ${t.marksWrong} >= 0`),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 40 }).notNull().unique(),
    subject: varchar("subject", { length: 100 }).notNull(),
    topic: varchar("topic", { length: 100 }),
    difficulty: varchar("difficulty", { length: 16 }).notNull().default("MEDIUM").$type<"EASY" | "MEDIUM" | "HARD">(),
    textEn: text("text_en"),
    textHi: text("text_hi"),
    imageUrl: text("image_url"),
    explanationEn: text("explanation_en"),
    explanationHi: text("explanation_hi"),
    // Optional per-question override of the section marking rule.
    marksCorrect: marks("marks_correct"),
    marksWrong: marks("marks_wrong"),
    isActive: boolean("is_active").notNull().default(true),
    // Provenance: only original or properly licensed content may be used.
    source: varchar("source", { length: 200 }),
    license: varchar("license", { length: 100 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("questions_subject_idx").on(t.subject, t.topic),
    check("questions_text_ck", sql`${t.textEn} IS NOT NULL OR ${t.textHi} IS NOT NULL`),
  ],
);

export const questionOptions = pgTable(
  "question_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    textEn: text("text_en"),
    textHi: text("text_hi"),
    imageUrl: text("image_url"),
    isCorrect: boolean("is_correct").notNull().default(false),
  },
  (t) => [uniqueIndex("question_options_q_pos_uq").on(t.questionId, t.position)],
);

export const examSectionQuestions = pgTable(
  "exam_section_questions",
  {
    sectionId: uuid("section_id")
      .notNull()
      .references(() => examSections.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.sectionId, t.questionId] }),
    uniqueIndex("esq_section_pos_uq").on(t.sectionId, t.position),
    index("esq_question_idx").on(t.questionId),
  ],
);

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

export const examSchedules = pgTable(
  "exam_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "restrict" }),
    batchId: uuid("batch_id").references(() => examBatches.id, { onDelete: "set null" }),
    title: varchar("title", { length: 200 }).notNull(),
    status: scheduleStatusEnum("status").notNull().default("DRAFT"),
    timeZone: varchar("time_zone", { length: 64 }).notNull().default("Asia/Kolkata"),
    loginOpensAt: tstz("login_opens_at").notNull(),
    startAt: tstz("start_at").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    // Official end. Initially start_at + duration; extended by authorised
    // pauses. Every deadline check reads this column.
    endAt: tstz("end_at").notNull(),
    // Candidates without an attempt may start until start_at + late_entry_seconds.
    lateEntrySeconds: integer("late_entry_seconds").notNull().default(900),
    enforceWorkstation: boolean("enforce_workstation").notNull().default(false),
    allowPause: boolean("allow_pause").notNull().default(true),
    // Proctoring policy. DB defaults are off so existing sittings are unchanged;
    // the admin form turns them on for new schedules.
    requirePhoto: boolean("require_photo").notNull().default(false),
    cameraMonitoring: boolean("camera_monitoring").notNull().default(false),
    requireFullscreen: boolean("require_fullscreen").notNull().default(false),
    violationLimit: integer("violation_limit").notNull().default(3),
    autoSubmitOnViolations: boolean("auto_submit_on_violations").notNull().default(false),
    resultsPublished: boolean("results_published").notNull().default(false),
    actualStartAt: tstz("actual_start_at"),
    actualEndAt: tstz("actual_end_at"),
    pausedAt: tstz("paused_at"),
    totalPausedSeconds: integer("total_paused_seconds").notNull().default(0),
    publishedAt: tstz("published_at"),
    publishedBy: uuid("published_by").references(() => users.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("exam_schedules_status_start_idx").on(t.status, t.startAt),
    index("exam_schedules_status_end_idx").on(t.status, t.endAt),
    index("exam_schedules_exam_idx").on(t.examId),
    check(
      "exam_schedules_times_ck",
      sql`${t.loginOpensAt} <= ${t.startAt} AND ${t.startAt} < ${t.endAt} AND ${t.durationSeconds} > 0 AND ${t.lateEntrySeconds} >= 0`,
    ),
  ],
);

export const examAssignments = pgTable(
  "exam_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("schedule_id")
      .notNull()
      .references(() => examSchedules.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    workstationId: uuid("workstation_id").references(() => workstations.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("exam_assignments_schedule_candidate_uq").on(t.scheduleId, t.candidateId),
    uniqueIndex("exam_assignments_schedule_ws_uq")
      .on(t.scheduleId, t.workstationId)
      .where(sql`${t.workstationId} IS NOT NULL`),
    index("exam_assignments_candidate_idx").on(t.candidateId),
  ],
);

// ---------------------------------------------------------------------------
// Proctoring: photos and violations
// ---------------------------------------------------------------------------

export const PHOTO_KINDS = ["LOGIN", "START", "END"] as const;
export type PhotoKind = (typeof PHOTO_KINDS)[number];

/**
 * Candidate photos stored in Cloudinary. LOGIN photos are taken before the
 * roll-number login and identified by a one-time capture token (cookie);
 * login links them to the candidate.
 */
export const examPhotos = pgTable(
  "exam_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: varchar("kind", { length: 8 }).$type<PhotoKind>().notNull(),
    captureToken: varchar("capture_token", { length: 64 }),
    candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
    scheduleId: uuid("schedule_id").references(() => examSchedules.id, { onDelete: "cascade" }),
    attemptId: uuid("attempt_id").references(() => candidateAttempts.id, { onDelete: "cascade" }),
    storageKey: varchar("storage_key", { length: 255 }).notNull(),
    url: text("url").notNull(),
    bytes: integer("bytes").notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    workstationCode: varchar("workstation_code", { length: 40 }),
    capturedAt: tstz("captured_at").notNull(),
  },
  (t) => [
    uniqueIndex("exam_photos_capture_token_uq").on(t.captureToken),
    index("exam_photos_candidate_idx").on(t.candidateId, t.capturedAt),
    index("exam_photos_attempt_idx").on(t.attemptId),
  ],
);

export const VIOLATION_TYPES = ["FULLSCREEN_EXIT", "TAB_HIDDEN", "CAMERA_OFF", "CAMERA_DENIED"] as const;
export type ViolationType = (typeof VIOLATION_TYPES)[number];

export const examViolations = pgTable(
  "exam_violations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => candidateAttempts.id, { onDelete: "cascade" }),
    scheduleId: uuid("schedule_id")
      .notNull()
      .references(() => examSchedules.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 24 }).$type<ViolationType>().notNull(),
    // The attempt's violation count after this one (null if it was not counted, e.g. a duplicate report).
    countAfter: integer("count_after"),
    occurredAt: tstz("occurred_at").notNull(),
  },
  (t) => [index("exam_violations_attempt_idx").on(t.attemptId, t.occurredAt), index("exam_violations_schedule_idx").on(t.scheduleId)],
);

// ---------------------------------------------------------------------------
// Attempts, answers, submissions and results
// ---------------------------------------------------------------------------

export const candidateAttempts = pgTable(
  "candidate_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .unique()
      .references(() => examAssignments.id, { onDelete: "cascade" }),
    scheduleId: uuid("schedule_id")
      .notNull()
      .references(() => examSchedules.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    status: attemptStatusEnum("status").notNull().default("IN_PROGRESS"),
    language: varchar("language", { length: 2 }).notNull().default("en"),
    startedAt: tstz("started_at").notNull().defaultNow(),
    lastSeenAt: tstz("last_seen_at").notNull().defaultNow(),
    submittedAt: tstz("submitted_at"),
    submitReason: varchar("submit_reason", { length: 16 }).$type<"CANDIDATE" | "DEADLINE" | "ADMIN" | "VIOLATION">(),
    workstationCode: varchar("workstation_code", { length: 40 }),
    ipAddress: varchar("ip_address", { length: 64 }),
    // Fullscreen exits, hidden tab and camera loss counted against the schedule's violation limit.
    violationCount: integer("violation_count").notNull().default(0),
  },
  (t) => [
    uniqueIndex("candidate_attempts_schedule_candidate_uq").on(t.scheduleId, t.candidateId),
    index("candidate_attempts_schedule_status_idx").on(t.scheduleId, t.status),
  ],
);

export const candidateAnswers = pgTable(
  "candidate_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => candidateAttempts.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    selectedOptionId: uuid("selected_option_id").references(() => questionOptions.id, { onDelete: "restrict" }),
    markedForReview: boolean("marked_for_review").notNull().default(false),
    visited: boolean("visited").notNull().default(true),
    // Monotonic per (attempt, question). A write is accepted only when its
    // revision is greater than the stored one (see attempt-service).
    revision: integer("revision").notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 80 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("candidate_answers_attempt_question_uq").on(t.attemptId, t.questionId)],
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .unique()
      .references(() => candidateAttempts.id, { onDelete: "cascade" }),
    scheduleId: uuid("schedule_id")
      .notNull()
      .references(() => examSchedules.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 16 }).notNull().$type<"CANDIDATE" | "DEADLINE" | "ADMIN" | "VIOLATION">(),
    submittedAt: tstz("submitted_at").notNull(),
    answeredCount: integer("answered_count").notNull(),
    markedCount: integer("marked_count").notNull(),
    notAnsweredCount: integer("not_answered_count").notNull(),
    // Frozen copy of the final accepted answer state.
    answersSnapshot: jsonb("answers_snapshot")
      .$type<{ questionId: string; selectedOptionId: string | null; markedForReview: boolean; revision: number }[]>()
      .notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("submissions_schedule_idx").on(t.scheduleId)],
);

export type SectionScore = {
  sectionId: string;
  code: string;
  title: string;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  positive: number;
  negative: number;
  score: number;
};

export const results = pgTable(
  "results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .unique()
      .references(() => candidateAttempts.id, { onDelete: "cascade" }),
    submissionId: uuid("submission_id")
      .notNull()
      .unique()
      .references(() => submissions.id, { onDelete: "cascade" }),
    scheduleId: uuid("schedule_id")
      .notNull()
      .references(() => examSchedules.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    totalQuestions: integer("total_questions").notNull(),
    attempted: integer("attempted").notNull(),
    unanswered: integer("unanswered").notNull(),
    correct: integer("correct").notNull(),
    incorrect: integer("incorrect").notNull(),
    positiveMarks: marks("positive_marks").notNull(),
    negativeMarks: marks("negative_marks").notNull(),
    finalScore: marks("final_score").notNull(),
    maxScore: marks("max_score").notNull(),
    sectionScores: jsonb("section_scores").$type<SectionScore[]>().notNull(),
    timeTakenSeconds: integer("time_taken_seconds").notNull(),
    computedAt: tstz("computed_at").notNull().defaultNow(),
  },
  (t) => [index("results_schedule_score_idx").on(t.scheduleId, t.finalScore)],
);

// ---------------------------------------------------------------------------
// Online mock tests (self-paced practice attempts by students)
// ---------------------------------------------------------------------------

/** Premium access grants (payments are not integrated yet; admins grant access). */
export const studentEntitlements = pgTable(
  "student_entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    seriesId: uuid("series_id").references(() => testSeries.id, { onDelete: "cascade" }),
    examId: uuid("exam_id").references(() => exams.id, { onDelete: "cascade" }),
    expiresAt: tstz("expires_at"),
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [
    index("student_entitlements_student_idx").on(t.studentId),
    check("student_entitlements_target_ck", sql`${t.seriesId} IS NOT NULL OR ${t.examId} IS NOT NULL`),
  ],
);

export const practiceAttempts = pgTable(
  "practice_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "restrict" }),
    attemptNumber: integer("attempt_number").notNull(),
    status: attemptStatusEnum("status").notNull().default("IN_PROGRESS"),
    language: varchar("language", { length: 2 }).notNull().default("en"),
    startedAt: tstz("started_at").notNull(),
    // Official deadline = started_at + duration, fixed by the server at start.
    // NULL for untimed practice tests.
    deadlineAt: tstz("deadline_at"),
    lastSeenAt: tstz("last_seen_at").notNull(),
    submittedAt: tstz("submitted_at"),
    submitReason: varchar("submit_reason", { length: 16 }).$type<"CANDIDATE" | "DEADLINE" | "ADMIN">(),
  },
  (t) => [
    // At most one active attempt per student per test.
    uniqueIndex("practice_attempts_one_active_uq").on(t.studentId, t.examId).where(sql`${t.status} = 'IN_PROGRESS'`),
    uniqueIndex("practice_attempts_number_uq").on(t.studentId, t.examId, t.attemptNumber),
    index("practice_attempts_deadline_idx").on(t.status, t.deadlineAt),
    index("practice_attempts_exam_idx").on(t.examId, t.status),
  ],
);

export const practiceAnswers = pgTable(
  "practice_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => practiceAttempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    selectedOptionId: uuid("selected_option_id").references(() => questionOptions.id, { onDelete: "restrict" }),
    markedForReview: boolean("marked_for_review").notNull().default(false),
    revision: integer("revision").notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 80 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("practice_answers_attempt_question_uq").on(t.attemptId, t.questionId)],
);

export type TopicScore = { topic: string; subject: string; total: number; attempted: number; correct: number; incorrect: number };

export const practiceResults = pgTable(
  "practice_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .unique()
      .references(() => practiceAttempts.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    attempted: integer("attempted").notNull(),
    correct: integer("correct").notNull(),
    incorrect: integer("incorrect").notNull(),
    positiveMarks: marks("positive_marks").notNull(),
    negativeMarks: marks("negative_marks").notNull(),
    finalScore: marks("final_score").notNull(),
    maxScore: marks("max_score").notNull(),
    sectionScores: jsonb("section_scores").$type<SectionScore[]>().notNull(),
    topicScores: jsonb("topic_scores").$type<TopicScore[]>().notNull(),
    timeTakenSeconds: integer("time_taken_seconds").notNull(),
    submittedAt: tstz("submitted_at").notNull(),
    // Frozen copy of the final answers.
    answersSnapshot: jsonb("answers_snapshot")
      .$type<{ questionId: string; selectedOptionId: string | null; markedForReview: boolean }[]>()
      .notNull(),
  },
  (t) => [
    index("practice_results_student_idx").on(t.studentId, t.submittedAt),
    index("practice_results_exam_score_idx").on(t.examId, t.attemptNumber, t.finalScore),
  ],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.questionId] })],
);

export const TEST_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "USED", "EXPIRED"] as const;
export type TestRequestStatus = (typeof TEST_REQUEST_STATUSES)[number];

/**
 * A student's request to sit an online test at a chosen time. When approval
 * is required (application setting `online.requireStartApproval`), a test
 * can only be started inside an APPROVED request's window.
 */
export const testScheduleRequests = pgTable(
  "test_schedule_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 16 }).$type<TestRequestStatus>().notNull().default("PENDING"),
    requestedStartAt: tstz("requested_start_at").notNull(),
    studentNote: text("student_note"),
    // Set on approval (the admin may move the requested time).
    startAt: tstz("start_at"),
    windowEndsAt: tstz("window_ends_at"),
    adminNote: text("admin_note"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: tstz("reviewed_at"),
    attemptId: uuid("attempt_id").references(() => practiceAttempts.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // At most one open (pending or approved) request per student per test.
    uniqueIndex("test_schedule_requests_open_uq").on(t.studentId, t.examId).where(sql`${t.status} IN ('PENDING', 'APPROVED')`),
    index("test_schedule_requests_status_idx").on(t.status, t.requestedStartAt),
  ],
);

// ---------------------------------------------------------------------------
// Events, audit and settings
// ---------------------------------------------------------------------------

export const examEvents = pgTable(
  "exam_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    scheduleId: uuid("schedule_id").references(() => examSchedules.id, { onDelete: "cascade" }),
    attemptId: uuid("attempt_id").references(() => candidateAttempts.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 48 }).notNull(),
    fromStatus: varchar("from_status", { length: 16 }),
    toStatus: varchar("to_status", { length: 16 }),
    actor: varchar("actor", { length: 80 }).notNull(), // SYSTEM | ADMIN:<id> | CANDIDATE:<id>
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [
    index("exam_events_schedule_idx").on(t.scheduleId, t.createdAt),
    index("exam_events_attempt_idx").on(t.attemptId),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    actorType: varchar("actor_type", { length: 16 }).notNull(), // ADMIN | CANDIDATE | SYSTEM
    actorId: uuid("actor_id"),
    actorLabel: varchar("actor_label", { length: 150 }),
    action: varchar("action", { length: 64 }).notNull(),
    entityType: varchar("entity_type", { length: 48 }),
    entityId: varchar("entity_id", { length: 64 }),
    details: jsonb("details").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 64 }),
    createdAt: createdAt(),
  },
  (t) => [
    index("audit_logs_created_idx").on(t.createdAt),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
  ],
);

export const applicationSettings = pgTable("application_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: updatedAt(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
});
