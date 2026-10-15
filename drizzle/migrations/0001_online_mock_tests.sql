CREATE TABLE "bookmarks" (
	"student_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_student_id_question_id_pk" PRIMARY KEY("student_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "exam_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(60) NOT NULL,
	"name_en" varchar(120) NOT NULL,
	"name_hi" varchar(120),
	"description_en" text,
	"description_hi" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid,
	"marked_for_review" boolean DEFAULT false NOT NULL,
	"revision" integer NOT NULL,
	"idempotency_key" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"exam_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" "attempt_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"language" varchar(2) DEFAULT 'en' NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"deadline_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"submit_reason" varchar(16)
);
--> statement-breakpoint
CREATE TABLE "practice_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"exam_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"attempted" integer NOT NULL,
	"correct" integer NOT NULL,
	"incorrect" integer NOT NULL,
	"positive_marks" numeric(8, 2) NOT NULL,
	"negative_marks" numeric(8, 2) NOT NULL,
	"final_score" numeric(8, 2) NOT NULL,
	"max_score" numeric(8, 2) NOT NULL,
	"section_scores" jsonb NOT NULL,
	"topic_scores" jsonb NOT NULL,
	"time_taken_seconds" integer NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"answers_snapshot" jsonb NOT NULL,
	CONSTRAINT "practice_results_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
CREATE TABLE "student_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"series_id" uuid,
	"exam_id" uuid,
	"expires_at" timestamp with time zone,
	"granted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_entitlements_target_ck" CHECK ("student_entitlements"."series_id" IS NOT NULL OR "student_entitlements"."exam_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(254) NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"display_name" varchar(60) NOT NULL,
	"password_hash" text NOT NULL,
	"preferred_language" varchar(2) DEFAULT 'en' NOT NULL,
	"show_on_leaderboard" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"category_id" uuid NOT NULL,
	"title_en" varchar(200) NOT NULL,
	"title_hi" varchar(200),
	"description_en" text,
	"description_hi" text,
	"access_level" varchar(16) DEFAULT 'FREE' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_subject_ck";--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "slug" varchar(80);--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "description_en" text;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "description_hi" text;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "series_id" uuid;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "test_kind" varchar(16) DEFAULT 'FULL' NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "access_level" varchar(16) DEFAULT 'FREE' NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "timed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "max_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "result_policy" varchar(16) DEFAULT 'IMMEDIATE' NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "result_release_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "source" varchar(200);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "license" varchar(100);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "student_id" uuid;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_attempt_id_practice_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."practice_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_results" ADD CONSTRAINT "practice_results_attempt_id_practice_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."practice_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_results" ADD CONSTRAINT "practice_results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_results" ADD CONSTRAINT "practice_results_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_entitlements" ADD CONSTRAINT "student_entitlements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_entitlements" ADD CONSTRAINT "student_entitlements_series_id_test_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."test_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_entitlements" ADD CONSTRAINT "student_entitlements_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_entitlements" ADD CONSTRAINT "student_entitlements_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_series" ADD CONSTRAINT "test_series_category_id_exam_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."exam_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "password_reset_tokens_student_idx" ON "password_reset_tokens" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_answers_attempt_question_uq" ON "practice_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_attempts_one_active_uq" ON "practice_attempts" USING btree ("student_id","exam_id") WHERE "practice_attempts"."status" = 'IN_PROGRESS';--> statement-breakpoint
CREATE UNIQUE INDEX "practice_attempts_number_uq" ON "practice_attempts" USING btree ("student_id","exam_id","attempt_number");--> statement-breakpoint
CREATE INDEX "practice_attempts_deadline_idx" ON "practice_attempts" USING btree ("status","deadline_at");--> statement-breakpoint
CREATE INDEX "practice_attempts_exam_idx" ON "practice_attempts" USING btree ("exam_id","status");--> statement-breakpoint
CREATE INDEX "practice_results_student_idx" ON "practice_results" USING btree ("student_id","submitted_at");--> statement-breakpoint
CREATE INDEX "practice_results_exam_score_idx" ON "practice_results" USING btree ("exam_id","attempt_number","final_score");--> statement-breakpoint
CREATE INDEX "student_entitlements_student_idx" ON "student_entitlements" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_email_lower_uq" ON "students" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "test_series_category_idx" ON "test_series" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_category_id_exam_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."exam_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_series_id_test_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."test_series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exams_public_idx" ON "exams" USING btree ("is_public","status");--> statement-breakpoint
CREATE INDEX "exams_category_idx" ON "exams" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "sessions_student_idx" ON "sessions" USING btree ("student_id");--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_max_attempts_ck" CHECK ("exams"."max_attempts" >= 0);--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_subject_ck" CHECK (("sessions"."subject_type" = 'ADMIN' AND "sessions"."user_id" IS NOT NULL AND "sessions"."candidate_id" IS NULL AND "sessions"."student_id" IS NULL)
       OR ("sessions"."subject_type" = 'CANDIDATE' AND "sessions"."candidate_id" IS NOT NULL AND "sessions"."user_id" IS NULL AND "sessions"."student_id" IS NULL)
       OR ("sessions"."subject_type" = 'STUDENT' AND "sessions"."student_id" IS NOT NULL AND "sessions"."user_id" IS NULL AND "sessions"."candidate_id" IS NULL));