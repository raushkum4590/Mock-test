CREATE TABLE "test_schedule_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"exam_id" uuid NOT NULL,
	"status" varchar(16) DEFAULT 'PENDING' NOT NULL,
	"requested_start_at" timestamp with time zone NOT NULL,
	"student_note" text,
	"start_at" timestamp with time zone,
	"window_ends_at" timestamp with time zone,
	"admin_note" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"attempt_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "test_schedule_requests" ADD CONSTRAINT "test_schedule_requests_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_schedule_requests" ADD CONSTRAINT "test_schedule_requests_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_schedule_requests" ADD CONSTRAINT "test_schedule_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_schedule_requests" ADD CONSTRAINT "test_schedule_requests_attempt_id_practice_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."practice_attempts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "test_schedule_requests_open_uq" ON "test_schedule_requests" USING btree ("student_id","exam_id") WHERE "test_schedule_requests"."status" IN ('PENDING', 'APPROVED');--> statement-breakpoint
CREATE INDEX "test_schedule_requests_status_idx" ON "test_schedule_requests" USING btree ("status","requested_start_at");