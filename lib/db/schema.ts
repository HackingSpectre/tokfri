import { pgTable, uuid, varchar, text, boolean, timestamp, integer, bigint, uniqueIndex, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 30 }).notNull().unique(),
  suiAddress: varchar('sui_address', { length: 66 }).notNull().unique(),
  oauthProvider: varchar('oauth_provider', { length: 20 }).notNull(),
  oauthSub: varchar('oauth_sub', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  websiteUrl: varchar('website_url', { length: 255 }),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
}, (table) => ({
  usernameIdx: index('idx_users_username').on(sql`LOWER(${table.username})`),
  suiAddressIdx: index('idx_users_sui_address').on(table.suiAddress),
  oauthIdx: index('idx_users_oauth').on(table.oauthProvider, table.oauthSub),
  createdAtIdx: index('idx_users_created_at').on(table.createdAt),
  uniqueOauth: uniqueIndex('unique_oauth_account').on(table.oauthProvider, table.oauthSub),
}));

// ============================================================================
// POSTS TABLE
// ============================================================================
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  mediaUrls: text('media_urls').array(),
  isReply: boolean('is_reply').default(false),
  parentPostId: uuid('parent_post_id').references(() => posts.id, { onDelete: 'set null' }),
  replyCount: integer('reply_count').default(0),
  repostCount: integer('repost_count').default(0),
  likeCount: integer('like_count').default(0),
  viewCount: integer('view_count').default(0),
  tipAmount: bigint('tip_amount', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_posts_user_id').on(table.userId, table.createdAt),
  createdAtIdx: index('idx_posts_created_at').on(table.createdAt),
  parentPostIdx: index('idx_posts_parent_post_id').on(table.parentPostId),
  trendingIdx: index('idx_posts_trending').on(table.likeCount, table.createdAt),
}));

// ============================================================================
// FOLLOWS TABLE
// ============================================================================
export const follows = pgTable('follows', {
  id: uuid('id').defaultRandom().primaryKey(),
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  followerIdx: index('idx_follows_follower').on(table.followerId, table.createdAt),
  followingIdx: index('idx_follows_following').on(table.followingId, table.createdAt),
  uniqueFollow: uniqueIndex('unique_follow').on(table.followerId, table.followingId),
}));

// ============================================================================
// LIKES TABLE
// ============================================================================
export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_likes_user_id').on(table.userId, table.createdAt),
  postIdIdx: index('idx_likes_post_id').on(table.postId, table.createdAt),
  uniqueLike: uniqueIndex('unique_like').on(table.userId, table.postId),
}));

// ============================================================================
// REPOSTS TABLE
// ============================================================================
export const reposts = pgTable('reposts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_reposts_user_id').on(table.userId, table.createdAt),
  postIdIdx: index('idx_reposts_post_id').on(table.postId, table.createdAt),
  uniqueRepost: uniqueIndex('unique_repost').on(table.userId, table.postId),
}));

// ============================================================================
// TIPS TABLE
// ============================================================================
export const tips = pgTable('tips', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromUserId: uuid('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: uuid('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'set null' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  transactionDigest: varchar('transaction_digest', { length: 66 }).notNull().unique(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
}, (table) => ({
  fromUserIdx: index('idx_tips_from_user').on(table.fromUserId, table.createdAt),
  toUserIdx: index('idx_tips_to_user').on(table.toUserId, table.createdAt),
  postIdIdx: index('idx_tips_post_id').on(table.postId, table.createdAt),
  transactionIdx: index('idx_tips_transaction').on(table.transactionDigest),
  statusIdx: index('idx_tips_status').on(table.status, table.createdAt),
}));

// ============================================================================
// HASHTAGS TABLE
// ============================================================================
export const hashtags = pgTable('hashtags', {
  id: uuid('id').defaultRandom().primaryKey(),
  tag: varchar('tag', { length: 100 }).notNull().unique(),
  usageCount: integer('usage_count').default(0),
  trendingScore: integer('trending_score').default(0),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tagIdx: index('idx_hashtags_tag').on(sql`LOWER(${table.tag})`),
  trendingIdx: index('idx_hashtags_trending').on(table.trendingScore, table.usageCount),
  usageIdx: index('idx_hashtags_usage').on(table.usageCount),
}));

// ============================================================================
// POST_HASHTAGS TABLE (Join table)
// ============================================================================
export const postHashtags = pgTable('post_hashtags', {
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  hashtagId: uuid('hashtag_id').notNull().references(() => hashtags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.hashtagId] }),
  hashtagIdx: index('idx_post_hashtags_hashtag').on(table.hashtagId, table.createdAt),
  postIdx: index('idx_post_hashtags_post').on(table.postId),
}));

// ============================================================================
// NOTIFICATIONS TABLE
// ============================================================================
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  tipId: uuid('tip_id').references(() => tips.id, { onDelete: 'cascade' }),
  message: text('message'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('idx_notifications_user').on(table.userId, table.read, table.createdAt),
  typeIdx: index('idx_notifications_type').on(table.type, table.createdAt),
}));

// ============================================================================
// CONVERSATIONS TABLE
// ============================================================================
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 20 }).default('direct').notNull(), // 'direct' or 'group'
  name: varchar('name', { length: 100 }), // For group conversations
  description: text('description'), // For group conversations
  imageUrl: text('image_url'), // For group conversations
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('idx_conversations_type').on(table.type),
  lastMessageIdx: index('idx_conversations_last_message').on(table.lastMessageAt),
  createdByIdx: index('idx_conversations_created_by').on(table.createdBy),
}));

// ============================================================================
// CONVERSATION_PARTICIPANTS TABLE
// ============================================================================
export const conversationParticipants = pgTable('conversation_participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).default('member').notNull(), // 'admin', 'member'
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  conversationIdx: index('idx_conv_participants_conversation').on(table.conversationId, table.joinedAt),
  userIdx: index('idx_conv_participants_user').on(table.userId, table.joinedAt),
  uniqueParticipant: uniqueIndex('unique_conversation_participant').on(table.conversationId, table.userId),
}));

// ============================================================================
// UPDATED MESSAGES TABLE
// ============================================================================
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: uuid('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Legacy field
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 20 }).default('text').notNull(), // 'text', 'image', 'file'
  mediaUrls: text('media_urls').array(),
  replyToId: uuid('reply_to_id').references(() => messages.id, { onDelete: 'set null' }),
  isEdited: boolean('is_edited').default(false),
  isDeleted: boolean('is_deleted').default(false),
  read: boolean('read').default(false), // Legacy field
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('idx_messages_conversation').on(table.conversationId, table.createdAt),
  senderIdx: index('idx_messages_sender').on(table.senderId, table.createdAt),
  recipientIdx: index('idx_messages_recipient').on(table.recipientId, table.read, table.createdAt),
  replyIdx: index('idx_messages_reply').on(table.replyToId),
}));

// ============================================================================
// MESSAGE_READS TABLE
// ============================================================================
export const messageReads = pgTable('message_reads', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  messageIdx: index('idx_message_reads_message').on(table.messageId),
  userIdx: index('idx_message_reads_user').on(table.userId, table.readAt),
  uniqueRead: uniqueIndex('unique_message_read').on(table.messageId, table.userId),
}));

// ============================================================================
// COMMENTS TABLE
// ============================================================================
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  likeCount: integer('like_count').default(0),
  replyCount: integer('reply_count').default(0),
  depth: integer('depth').default(0), // 0 = top level, 1 = first reply, 2 = second reply (max)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  postIdx: index('idx_comments_post').on(table.postId, table.createdAt),
  userIdx: index('idx_comments_user').on(table.userId, table.createdAt),
  parentIdx: index('idx_comments_parent').on(table.parentCommentId, table.createdAt),
  depthIdx: index('idx_comments_depth').on(table.depth),
}));

// ============================================================================
// COMMENT_LIKES TABLE
// ============================================================================
export const commentLikes = pgTable('comment_likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  commentIdx: index('idx_comment_likes_comment').on(table.commentId),
  userIdx: index('idx_comment_likes_user').on(table.userId, table.createdAt),
  uniqueCommentLike: uniqueIndex('unique_comment_like').on(table.commentId, table.userId),
}));

// ============================================================================
// COMMUNITIES TABLE
// ============================================================================
export const communities = pgTable('communities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  bannerUrl: text('banner_url'),
  isPrivate: boolean('is_private').default(false),
  memberCount: integer('member_count').default(0),
  postCount: integer('post_count').default(0),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  rules: text('rules').array(),
  tags: varchar('tags', { length: 50 }).array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('idx_communities_slug').on(table.slug),
  nameIdx: index('idx_communities_name').on(sql`LOWER(${table.name})`),
  createdByIdx: index('idx_communities_created_by').on(table.createdBy),
  memberCountIdx: index('idx_communities_member_count').on(table.memberCount),
  tagsIdx: index('idx_communities_tags').on(table.tags),
}));

// ============================================================================
// COMMUNITY_MEMBERS TABLE
// ============================================================================
export const communityMembers = pgTable('community_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).default('member').notNull(), // 'owner', 'admin', 'moderator', 'member'
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  communityIdx: index('idx_community_members_community').on(table.communityId, table.joinedAt),
  userIdx: index('idx_community_members_user').on(table.userId, table.joinedAt),
  roleIdx: index('idx_community_members_role').on(table.role),
  uniqueMember: uniqueIndex('unique_community_member').on(table.communityId, table.userId),
}));

// ============================================================================
// COMMUNITY_POSTS TABLE
// ============================================================================
export const communityPosts = pgTable('community_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  postIdx: index('idx_community_posts_post').on(table.postId),
  communityIdx: index('idx_community_posts_community').on(table.communityId, table.createdAt),
  pinnedIdx: index('idx_community_posts_pinned').on(table.isPinned, table.createdAt),
  uniqueCommunityPost: uniqueIndex('unique_community_post').on(table.postId, table.communityId),
}));

// ============================================================================
// USER_STATS TABLE
// ============================================================================
export const userStats = pgTable('user_stats', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  followerCount: integer('follower_count').default(0),
  followingCount: integer('following_count').default(0),
  postCount: integer('post_count').default(0),
  totalTipsReceived: bigint('total_tips_received', { mode: 'number' }).default(0),
  totalTipsSent: bigint('total_tips_sent', { mode: 'number' }).default(0),
  totalLikesReceived: integer('total_likes_received').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  updatedIdx: index('idx_user_stats_updated').on(table.updatedAt),
  tipsReceivedIdx: index('idx_user_stats_tips_received').on(table.totalTipsReceived),
  followersIdx: index('idx_user_stats_followers').on(table.followerCount),
}));

// ============================================================================
// RELATIONS (for Drizzle query API)
// ============================================================================
export const usersRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  followers: many(follows, { relationName: 'followers' }),
  following: many(follows, { relationName: 'following' }),
  likes: many(likes),
  reposts: many(reposts),
  tipsSent: many(tips, { relationName: 'tipsSent' }),
  tipsReceived: many(tips, { relationName: 'tipsReceived' }),
  notifications: many(notifications),
  messagesSent: many(messages, { relationName: 'messagesSent' }),
  conversationParticipants: many(conversationParticipants),
  conversationsCreated: many(conversations),
  comments: many(comments),
  commentLikes: many(commentLikes),
  communitiesCreated: many(communities),
  communityMemberships: many(communityMembers),
  messageReads: many(messageReads),
  stats: one(userStats, {
    fields: [users.id],
    references: [userStats.userId],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  parentPost: one(posts, {
    fields: [posts.parentPostId],
    references: [posts.id],
  }),
  replies: many(posts),
  likes: many(likes),
  reposts: many(reposts),
  tips: many(tips),
  hashtags: many(postHashtags),
  comments: many(comments),
  communityPosts: many(communityPosts),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [conversations.createdBy],
    references: [users.id],
  }),
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
  }),
  replies: many(messages),
  reads: many(messageReads),
}));

export const messageReadsRelations = relations(messageReads, ({ one }) => ({
  message: one(messages, {
    fields: [messageReads.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReads.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
  }),
  replies: many(comments),
  likes: many(commentLikes),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [communities.createdBy],
    references: [users.id],
  }),
  members: many(communityMembers),
  posts: many(communityPosts),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one }) => ({
  post: one(posts, {
    fields: [communityPosts.postId],
    references: [posts.id],
  }),
  community: one(communities, {
    fields: [communityPosts.communityId],
    references: [communities.id],
  }),
}));
