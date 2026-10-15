CREATE TABLE "exam_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(8) NOT NULL,
	"capture_token" varchar(64),
	"candidate_id" uuid,
	"schedule_id" uuid,
	"attempt_id" uuid,
	"storage_key" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"bytes" integer NOT NULL,
	"ip_address" varchar(64),
	"workstation_code" varchar(40),
	"captured_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"schedule_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"type" varchar(24) NOT NULL,
	"count_after" integer,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_attempts" ADD COLUMN "violation_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD COLUMN "require_photo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD COLUMN "camera_monitoring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD COLUMN "require_fullscreen" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD COLUMN "violation_limit" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD COLUMN "auto_submit_on_violations" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_photos" ADD CONSTRAINT "exam_photos_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_photos" ADD CONSTRAINT "exam_photos_schedule_id_exam_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."exam_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_photos" ADD CONSTRAINT "exam_photos_attempt_id_candidate_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."candidate_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_violations" ADD CONSTRAINT "exam_violations_attempt_id_candidate_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."candidate_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_violations" ADD CONSTRAINT "exam_violations_schedule_id_exam_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."exam_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_violations" ADD CONSTRAINT "exam_violations_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "exam_photos_capture_token_uq" ON "exam_photos" USING btree ("capture_token");--> statement-breakpoint
CREATE INDEX "exam_photos_candidate_idx" ON "exam_photos" USING btree ("candidate_id","captured_at");--> statement-breakpoint
CREATE INDEX "exam_photos_attempt_idx" ON "exam_photos" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "exam_violations_attempt_idx" ON "exam_violations" USING btree ("attempt_id","occurred_at");--> statement-breakpoint
CREATE INDEX "exam_violations_schedule_idx" ON "exam_violations" USING btree ("schedule_id");