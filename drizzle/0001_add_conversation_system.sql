-- Migration: Add conversation-based messaging system
-- This extends the existing messages table and adds conversation tables

-- ============================================================================
-- ADD CONVERSATION TABLES
-- ============================================================================

CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) DEFAULT 'direct' NOT NULL,
	"name" varchar(100),
	"description" text,
	"image_url" text,
	"created_by" uuid NOT NULL,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_read_at" timestamp with time zone,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "message_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================================================
-- EXTEND MESSAGES TABLE
-- ============================================================================

-- Add new columns to messages table
ALTER TABLE "messages" ADD COLUMN "conversation_id" uuid;
ALTER TABLE "messages" ADD COLUMN "message_type" varchar(20) DEFAULT 'text' NOT NULL;
ALTER TABLE "messages" ADD COLUMN "media_urls" text[];
ALTER TABLE "messages" ADD COLUMN "reply_to_id" uuid;
ALTER TABLE "messages" ADD COLUMN "is_edited" boolean DEFAULT false;
ALTER TABLE "messages" ADD COLUMN "is_deleted" boolean DEFAULT false;
ALTER TABLE "messages" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

-- ============================================================================
-- MIGRATE EXISTING DATA
-- ============================================================================

-- Create conversations for existing direct messages
WITH message_pairs AS (
    SELECT DISTINCT
        LEAST(sender_id, recipient_id) as user1,
        GREATEST(sender_id, recipient_id) as user2,
        MIN(created_at) as first_message_at,
        MIN(sender_id) as created_by
    FROM "messages"
    GROUP BY LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id)
)
INSERT INTO "conversations" ("id", "type", "created_by", "created_at")
SELECT 
    gen_random_uuid() as id,
    'direct' as type,
    mp.created_by as created_by,
    mp.first_message_at as created_at
FROM message_pairs mp;

-- Create a temporary mapping table to track conversation IDs
CREATE TEMP TABLE conversation_mapping AS
WITH message_pairs AS (
    SELECT DISTINCT
        LEAST(sender_id, recipient_id) as user1,
        GREATEST(sender_id, recipient_id) as user2,
        MIN(created_at) as first_message_at
    FROM "messages"
    GROUP BY LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id)
),
numbered_conversations AS (
    SELECT 
        c.id as conversation_id,
        c.created_at,
        ROW_NUMBER() OVER (ORDER BY c.created_at) as rn
    FROM "conversations" c
    WHERE c.type = 'direct'
),
numbered_pairs AS (
    SELECT 
        mp.*,
        ROW_NUMBER() OVER (ORDER BY mp.first_message_at) as rn
    FROM message_pairs mp
)
SELECT 
    nc.conversation_id,
    np.user1,
    np.user2
FROM numbered_conversations nc
JOIN numbered_pairs np ON nc.rn = np.rn;

-- Update messages with conversation_id
UPDATE "messages" 
SET "conversation_id" = cm.conversation_id
FROM conversation_mapping cm
WHERE 
    LEAST("messages".sender_id, "messages".recipient_id) = cm.user1 AND
    GREATEST("messages".sender_id, "messages".recipient_id) = cm.user2;

-- Add participants to conversations
INSERT INTO "conversation_participants" ("conversation_id", "user_id", "role", "joined_at")
SELECT DISTINCT
    cm.conversation_id,
    cm.user1 as user_id,
    'member' as role,
    NOW() as joined_at
FROM conversation_mapping cm
UNION
SELECT DISTINCT
    cm.conversation_id,
    cm.user2 as user_id,
    'member' as role,
    NOW() as joined_at
FROM conversation_mapping cm;

-- Update last_message_at for conversations
UPDATE "conversations" 
SET "last_message_at" = (
    SELECT MAX(created_at) 
    FROM "messages" 
    WHERE "messages".conversation_id = "conversations".id
);

-- Migrate read status to message_reads table
INSERT INTO "message_reads" ("message_id", "user_id", "read_at")
SELECT 
    m.id as message_id,
    m.recipient_id as user_id,
    m.created_at as read_at
FROM "messages" m
WHERE m.read = true;

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_users_id_fk" 
    FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" 
    FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_messages_id_fk" 
    FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Update messages foreign keys
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" 
    FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_messages_id_fk" 
    FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;

-- ============================================================================
-- ADD INDEXES
-- ============================================================================

CREATE INDEX "idx_conversations_type" ON "conversations" USING btree ("type");
CREATE INDEX "idx_conversations_last_message" ON "conversations" USING btree ("last_message_at");
CREATE INDEX "idx_conversations_created_by" ON "conversations" USING btree ("created_by");

CREATE INDEX "idx_conv_participants_conversation" ON "conversation_participants" USING btree ("conversation_id","joined_at");
CREATE INDEX "idx_conv_participants_user" ON "conversation_participants" USING btree ("user_id","is_active");
CREATE UNIQUE INDEX "unique_conversation_participant" ON "conversation_participants" USING btree ("conversation_id","user_id");

CREATE INDEX "idx_message_reads_message" ON "message_reads" USING btree ("message_id");
CREATE INDEX "idx_message_reads_user" ON "message_reads" USING btree ("user_id","read_at");
CREATE UNIQUE INDEX "unique_message_read" ON "message_reads" USING btree ("message_id","user_id");

CREATE INDEX "idx_messages_conversation" ON "messages" USING btree ("conversation_id","created_at");
CREATE INDEX "idx_messages_reply" ON "messages" USING btree ("reply_to_id");

-- ============================================================================
-- ADD MISSING TABLES (Comments, Communities, etc.)
-- ============================================================================

CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"content" text NOT NULL,
	"depth" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"reply_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"avatar_url" text,
	"banner_url" text,
	"is_private" boolean DEFAULT false,
	"member_count" integer DEFAULT 0,
	"post_count" integer DEFAULT 0,
	"rules" text[],
	"tags" varchar(50)[],
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "communities_slug_unique" UNIQUE("slug")
);

CREATE TABLE "community_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "community_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints for new tables
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" 
    FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" 
    FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_comments_id_fk" 
    FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_users_id_fk" 
    FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" 
    FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_community_id_communities_id_fk" 
    FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_post_id_posts_id_fk" 
    FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes for new tables
CREATE INDEX "idx_comments_post" ON "comments" USING btree ("post_id","created_at");
CREATE INDEX "idx_comments_user" ON "comments" USING btree ("user_id","created_at");
CREATE INDEX "idx_comments_parent" ON "comments" USING btree ("parent_comment_id","created_at");
CREATE INDEX "idx_comments_depth" ON "comments" USING btree ("depth");

CREATE INDEX "idx_comment_likes_comment" ON "comment_likes" USING btree ("comment_id","created_at");
CREATE INDEX "idx_comment_likes_user" ON "comment_likes" USING btree ("user_id","created_at");
CREATE UNIQUE INDEX "unique_comment_like" ON "comment_likes" USING btree ("comment_id","user_id");

CREATE INDEX "idx_communities_slug" ON "communities" USING btree (LOWER("slug"));
CREATE INDEX "idx_communities_created_by" ON "communities" USING btree ("created_by");
CREATE INDEX "idx_communities_member_count" ON "communities" USING btree ("member_count");
CREATE INDEX "idx_communities_created_at" ON "communities" USING btree ("created_at");

CREATE INDEX "idx_community_members_community" ON "community_members" USING btree ("community_id","joined_at");
CREATE INDEX "idx_community_members_user" ON "community_members" USING btree ("user_id","is_active");
CREATE UNIQUE INDEX "unique_community_member" ON "community_members" USING btree ("community_id","user_id");

CREATE INDEX "idx_community_posts_community" ON "community_posts" USING btree ("community_id","created_at");
CREATE INDEX "idx_community_posts_post" ON "community_posts" USING btree ("post_id");
CREATE UNIQUE INDEX "unique_community_post" ON "community_posts" USING btree ("community_id","post_id");

-- ============================================================================
-- CLEAN UP LEGACY COLUMNS (Optional - can be done later)
-- ============================================================================

-- Note: We keep recipient_id and read columns for now for backward compatibility
-- They can be removed in a future migration after confirming the new system works
-- ALTER TABLE "messages" DROP COLUMN "recipient_id";
-- ALTER TABLE "messages" DROP COLUMN "read";