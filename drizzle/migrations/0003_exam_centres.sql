CREATE TABLE "exam_centres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(150) NOT NULL,
	"city" varchar(100),
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_centres_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "centre_id" uuid;--> statement-breakpoint
ALTER TABLE "workstations" ADD COLUMN "centre_id" uuid;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_centre_id_exam_centres_id_fk" FOREIGN KEY ("centre_id") REFERENCES "public"."exam_centres"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workstations" ADD CONSTRAINT "workstations_centre_id_exam_centres_id_fk" FOREIGN KEY ("centre_id") REFERENCES "public"."exam_centres"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "candidates_centre_idx" ON "candidates" USING btree ("centre_id");