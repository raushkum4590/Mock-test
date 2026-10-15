CREATE TYPE "public"."attempt_status" AS ENUM('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED');--> statement-breakpoint
CREATE TYPE "public"."schedule_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'WAITING', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "application_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_type" varchar(16) NOT NULL,
	"actor_id" uuid,
	"actor_label" varchar(150),
	"action" varchar(64) NOT NULL,
	"entity_type" varchar(48),
	"entity_id" varchar(64),
	"details" jsonb,
	"ip_address" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid,
	"marked_for_review" boolean DEFAULT false NOT NULL,
	"visited" boolean DEFAULT true NOT NULL,
	"revision" integer NOT NULL,
	"idempotency_key" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"schedule_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"status" "attempt_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"language" varchar(2) DEFAULT 'en' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"submit_reason" varchar(16),
	"workstation_code" varchar(40),
	"ip_address" varchar(64),
	CONSTRAINT "candidate_attempts_assignment_id_unique" UNIQUE("assignment_id")
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roll_number" varchar(40) NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"password_hash" text NOT NULL,
	"photo_url" text,
	"batch_id" uuid,
	"preferred_language" varchar(2) DEFAULT 'en' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"workstation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_batches_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "exam_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"schedule_id" uuid,
	"attempt_id" uuid,
	"candidate_id" uuid,
	"type" varchar(48) NOT NULL,
	"from_status" varchar(16),
	"to_status" varchar(16),
	"actor" varchar(80) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"batch_id" uuid,
	"title" varchar(200) NOT NULL,
	"status" "schedule_status" DEFAULT 'DRAFT' NOT NULL,
	"time_zone" varchar(64) DEFAULT 'Asia/Kolkata' NOT NULL,
	"login_opens_at" timestamp with time zone NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"duration_seconds" integer NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"late_entry_seconds" integer DEFAULT 900 NOT NULL,
	"enforce_workstation" boolean DEFAULT false NOT NULL,
	"allow_pause" boolean DEFAULT true NOT NULL,
	"results_published" boolean DEFAULT false NOT NULL,
	"actual_start_at" timestamp with time zone,
	"actual_end_at" timestamp with time zone,
	"paused_at" timestamp with time zone,
	"total_paused_seconds" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_schedules_times_ck" CHECK ("exam_schedules"."login_opens_at" <= "exam_schedules"."start_at" AND "exam_schedules"."start_at" < "exam_schedules"."end_at" AND "exam_schedules"."duration_seconds" > 0 AND "exam_schedules"."late_entry_seconds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "exam_section_questions" (
	"section_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "exam_section_questions_section_id_question_id_pk" PRIMARY KEY("section_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "exam_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"code" varchar(40) NOT NULL,
	"title_en" varchar(200) NOT NULL,
	"title_hi" varchar(200),
	"subject" varchar(100) NOT NULL,
	"position" integer NOT NULL,
	"marks_correct" numeric(8, 2) DEFAULT 2 NOT NULL,
	"marks_wrong" numeric(8, 2) DEFAULT 0.5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_sections_marks_ck" CHECK ("exam_sections"."marks_correct" >= 0 AND "exam_sections"."marks_wrong" >= 0)
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"exam_type" varchar(32) NOT NULL,
	"title_en" varchar(200) NOT NULL,
	"title_hi" varchar(200),
	"instructions_en" text,
	"instructions_hi" text,
	"default_duration_minutes" integer DEFAULT 60 NOT NULL,
	"status" varchar(16) DEFAULT 'DRAFT' NOT NULL,
	"allow_answer_review" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exams_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"text_en" text,
	"text_hi" text,
	"image_url" text,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"subject" varchar(100) NOT NULL,
	"topic" varchar(100),
	"difficulty" varchar(16) DEFAULT 'MEDIUM' NOT NULL,
	"text_en" text,
	"text_hi" text,
	"image_url" text,
	"explanation_en" text,
	"explanation_hi" text,
	"marks_correct" numeric(8, 2),
	"marks_wrong" numeric(8, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_code_unique" UNIQUE("code"),
	CONSTRAINT "questions_text_ck" CHECK ("questions"."text_en" IS NOT NULL OR "questions"."text_hi" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"schedule_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"total_questions" integer NOT NULL,
	"attempted" integer NOT NULL,
	"unanswered" integer NOT NULL,
	"correct" integer NOT NULL,
	"incorrect" integer NOT NULL,
	"positive_marks" numeric(8, 2) NOT NULL,
	"negative_marks" numeric(8, 2) NOT NULL,
	"final_score" numeric(8, 2) NOT NULL,
	"max_score" numeric(8, 2) NOT NULL,
	"section_scores" jsonb NOT NULL,
	"time_taken_seconds" integer NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "results_attempt_id_unique" UNIQUE("attempt_id"),
	CONSTRAINT "results_submission_id_unique" UNIQUE("submission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"code" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"subject_type" varchar(16) NOT NULL,
	"user_id" uuid,
	"candidate_id" uuid,
	"workstation_code" varchar(40),
	"ip_address" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "sessions_subject_ck" CHECK (("sessions"."subject_type" = 'ADMIN' AND "sessions"."user_id" IS NOT NULL AND "sessions"."candidate_id" IS NULL)
       OR ("sessions"."subject_type" = 'CANDIDATE' AND "sessions"."candidate_id" IS NOT NULL AND "sessions"."user_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"schedule_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"reason" varchar(16) NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"answered_count" integer NOT NULL,
	"marked_count" integer NOT NULL,
	"not_answered_count" integer NOT NULL,
	"answers_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(64) NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"password_hash" text NOT NULL,
	"role_code" varchar(32) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workstations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"label" varchar(100),
	"lab" varchar(100),
	"ip_address" varchar(64),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workstations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "application_settings" ADD CONSTRAINT "application_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_answers" ADD CONSTRAINT "candidate_answers_attempt_id_candidate_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."candidate_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_answers" ADD CONSTRAINT "candidate_answers_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_answers" ADD CONSTRAINT "candidate_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_answers" ADD CONSTRAINT "candidate_answers_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_attempts" ADD CONSTRAINT "candidate_attempts_assignment_id_exam_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."exam_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_attempts" ADD CONSTRAINT "candidate_attempts_schedule_id_exam_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."exam_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_attempts" ADD CONSTRAINT "candidate_attempts_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_batch_id_exam_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."exam_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_assignments" ADD CONSTRAINT "exam_assignments_schedule_id_exam_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."exam_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_assignments" ADD CONSTRAINT "exam_assignments_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_assignments" ADD CONSTRAINT "exam_assignments_workstation_id_workstations_id_fk" FOREIGN KEY ("workstation_id") REFERENCES "public"."workstations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_schedule_id_exam_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."exam_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_attempt_id_candidate_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."candidate_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_batch_id_exam_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."exam_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_section_questions" ADD CONSTRAINT "exam_section_questions_section_id_exam_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."exam_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_section_questions" ADD CONSTRAINT "exam_section_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_attempt_id_candidate_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."candidate_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_schedule_id_exam_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."exam_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_attempt_id_candidate_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."candidate_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_schedule_id_exam_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."exam_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_code_roles_code_fk" FOREIGN KEY ("role_code") REFERENCES "public"."roles"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_answers_attempt_question_uq" ON "candidate_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_attempts_schedule_candidate_uq" ON "candidate_attempts" USING btree ("schedule_id","candidate_id");--> statement-breakpoint
CREATE INDEX "candidate_attempts_schedule_status_idx" ON "candidate_attempts" USING btree ("schedule_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "candidates_roll_number_upper_uq" ON "candidates" USING btree (upper("roll_number"));--> statement-breakpoint
CREATE INDEX "candidates_batch_idx" ON "candidates" USING btree ("batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_assignments_schedule_candidate_uq" ON "exam_assignments" USING btree ("schedule_id","candidate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_assignments_schedule_ws_uq" ON "exam_assignments" USING btree ("schedule_id","workstation_id") WHERE "exam_assignments"."workstation_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "exam_assignments_candidate_idx" ON "exam_assignments" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "exam_events_schedule_idx" ON "exam_events" USING btree ("schedule_id","created_at");--> statement-breakpoint
CREATE INDEX "exam_events_attempt_idx" ON "exam_events" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "exam_schedules_status_start_idx" ON "exam_schedules" USING btree ("status","start_at");--> statement-breakpoint
CREATE INDEX "exam_schedules_status_end_idx" ON "exam_schedules" USING btree ("status","end_at");--> statement-breakpoint
CREATE INDEX "exam_schedules_exam_idx" ON "exam_schedules" USING btree ("exam_id");--> statement-breakpoint
CREATE UNIQUE INDEX "esq_section_pos_uq" ON "exam_section_questions" USING btree ("section_id","position");--> statement-breakpoint
CREATE INDEX "esq_question_idx" ON "exam_section_questions" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_sections_exam_code_uq" ON "exam_sections" USING btree ("exam_id","code");--> statement-breakpoint
CREATE INDEX "exam_sections_exam_idx" ON "exam_sections" USING btree ("exam_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_options_q_pos_uq" ON "question_options" USING btree ("question_id","position");--> statement-breakpoint
CREATE INDEX "questions_subject_idx" ON "questions" USING btree ("subject","topic");--> statement-breakpoint
CREATE INDEX "results_schedule_score_idx" ON "results" USING btree ("schedule_id","final_score");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_candidate_idx" ON "sessions" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submissions_schedule_idx" ON "submissions" USING btree ("schedule_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_lower_uq" ON "users" USING btree (lower("username"));