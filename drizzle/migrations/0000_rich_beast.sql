CREATE TYPE "public"."conversation_phase" AS ENUM('survey', 'feedback');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('agreement', 'disagreement', 'suggestion', 'question', 'concern');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('invited', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."session_phase" AS ENUM('survey', 'drafting', 'feedback', 'synthesis', 'finalized');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'participant');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"phase" "conversation_phase" NOT NULL,
	"status" "conversation_status" DEFAULT 'active' NOT NULL,
	"agent_state" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"last_active_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "draft_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"component" text NOT NULL,
	"section_order" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"version" integer DEFAULT 1,
	"source_response_ids" uuid[],
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"conversation_id" uuid,
	"draft_section_id" uuid,
	"component" text,
	"feedback_type" "feedback_type" NOT NULL,
	"content" text NOT NULL,
	"raw_message_ids" uuid[],
	"synthesized" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "participant_status" DEFAULT 'invited' NOT NULL,
	"invited_at" timestamp with time zone DEFAULT now(),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"submission_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"admin_id" uuid NOT NULL,
	"description" text,
	"phase" "session_phase" DEFAULT 'survey' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"constitution_draft" text,
	"constitution_version" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sessions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tagged_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"phase" "conversation_phase" NOT NULL,
	"tag" text NOT NULL,
	"component" text NOT NULL,
	"content" text NOT NULL,
	"raw_message_ids" uuid[],
	"confidence" real DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"display_name" text NOT NULL,
	"password_hash" text,
	"role" "user_role" DEFAULT 'participant' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_id_session_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."session_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_sections" ADD CONSTRAINT "draft_sections_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_participant_id_session_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."session_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_draft_section_id_draft_sections_id_fk" FOREIGN KEY ("draft_section_id") REFERENCES "public"."draft_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagged_responses" ADD CONSTRAINT "tagged_responses_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagged_responses" ADD CONSTRAINT "tagged_responses_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagged_responses" ADD CONSTRAINT "tagged_responses_participant_id_session_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."session_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_drafts_session_order" ON "draft_sections" USING btree ("session_id","section_order");--> statement-breakpoint
CREATE INDEX "idx_feedback_unsynthesized" ON "feedback" USING btree ("session_id") WHERE synthesized = false;--> statement-breakpoint
CREATE INDEX "idx_messages_conversation" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "session_user_unique" ON "session_participants" USING btree ("session_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_sessions_slug" ON "sessions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_tagged_session_component" ON "tagged_responses" USING btree ("session_id","component");--> statement-breakpoint
CREATE INDEX "idx_tagged_tag" ON "tagged_responses" USING btree ("tag");