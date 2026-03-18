import {
  pgTable, uuid, text, timestamp, integer,
  boolean, jsonb, real, pgEnum, uniqueIndex, index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─── Enums ─────────────────────────────────────────────

export const sessionPhaseEnum = pgEnum('session_phase', [
  'survey', 'drafting', 'feedback', 'synthesis', 'finalized'
]);

export const userRoleEnum = pgEnum('user_role', ['admin', 'participant']);

export const participantStatusEnum = pgEnum('participant_status', [
  'invited', 'in_progress', 'completed'
]);

export const conversationStatusEnum = pgEnum('conversation_status', [
  'active', 'paused', 'completed'
]);

export const conversationPhaseEnum = pgEnum('conversation_phase', [
  'survey', 'feedback'
]);

export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

export const feedbackTypeEnum = pgEnum('feedback_type', [
  'agreement', 'disagreement', 'suggestion', 'question', 'concern'
]);

// ─── Tables ────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email'),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('participant'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  adminId: uuid('admin_id').notNull().references(() => users.id),
  description: text('description'),
  phase: sessionPhaseEnum('phase').notNull().default('survey'),
  config: jsonb('config').$type<SessionConfig>().default({}),
  constitutionDraft: text('constitution_draft'),
  constitutionVersion: integer('constitution_version').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('idx_sessions_slug').on(table.slug),
]);

export const sessionParticipants = pgTable('session_participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: participantStatusEnum('status').notNull().default('invited'),
  invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  submissionCount: integer('submission_count').default(0),
}, (table) => [
  uniqueIndex('session_user_unique').on(table.sessionId, table.userId),
]);

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  participantId: uuid('participant_id').notNull()
    .references(() => sessionParticipants.id, { onDelete: 'cascade' }),
  phase: conversationPhaseEnum('phase').notNull(),
  status: conversationStatusEnum('status').notNull().default('active'),
  agentState: jsonb('agent_state').$type<ConversationAgentState>().default({}),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_messages_conversation').on(table.conversationId, table.createdAt),
]);

export const taggedResponses = pgTable('tagged_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  participantId: uuid('participant_id').notNull()
    .references(() => sessionParticipants.id, { onDelete: 'cascade' }),
  phase: conversationPhaseEnum('phase').notNull(),
  tag: text('tag').notNull(),
  component: text('component').notNull(),
  content: text('content').notNull(),
  rawMessageIds: uuid('raw_message_ids').array(),
  confidence: real('confidence').default(1.0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_tagged_session_component').on(table.sessionId, table.component),
  index('idx_tagged_tag').on(table.tag),
]);

export const draftSections = pgTable('draft_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  component: text('component').notNull(),
  sectionOrder: integer('section_order').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  version: integer('version').default(1),
  sourceResponseIds: uuid('source_response_ids').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_drafts_session_order').on(table.sessionId, table.sectionOrder),
]);

export const feedback = pgTable('feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  participantId: uuid('participant_id').notNull()
    .references(() => sessionParticipants.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  draftSectionId: uuid('draft_section_id').references(() => draftSections.id),
  component: text('component'),
  feedbackType: feedbackTypeEnum('feedback_type').notNull(),
  content: text('content').notNull(),
  rawMessageIds: uuid('raw_message_ids').array(),
  synthesized: boolean('synthesized').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_feedback_unsynthesized').on(table.sessionId).where(sql`synthesized = false`),
]);

// ─── Relations ─────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  admin: one(users, { fields: [sessions.adminId], references: [users.id] }),
  participants: many(sessionParticipants),
  conversations: many(conversations),
  taggedResponses: many(taggedResponses),
  draftSections: many(draftSections),
  feedback: many(feedback),
}));

export const sessionParticipantsRelations = relations(sessionParticipants, ({ one, many }) => ({
  session: one(sessions, { fields: [sessionParticipants.sessionId], references: [sessions.id] }),
  user: one(users, { fields: [sessionParticipants.userId], references: [users.id] }),
  conversations: many(conversations),
  taggedResponses: many(taggedResponses),
  feedback: many(feedback),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  session: one(sessions, { fields: [conversations.sessionId], references: [sessions.id] }),
  participant: one(sessionParticipants, {
    fields: [conversations.participantId], references: [sessionParticipants.id]
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId], references: [conversations.id]
  }),
}));

export const taggedResponsesRelations = relations(taggedResponses, ({ one }) => ({
  conversation: one(conversations, {
    fields: [taggedResponses.conversationId], references: [conversations.id]
  }),
  session: one(sessions, {
    fields: [taggedResponses.sessionId], references: [sessions.id]
  }),
  participant: one(sessionParticipants, {
    fields: [taggedResponses.participantId], references: [sessionParticipants.id]
  }),
}));

export const draftSectionsRelations = relations(draftSections, ({ one, many }) => ({
  session: one(sessions, {
    fields: [draftSections.sessionId], references: [sessions.id]
  }),
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  session: one(sessions, {
    fields: [feedback.sessionId], references: [sessions.id]
  }),
  participant: one(sessionParticipants, {
    fields: [feedback.participantId], references: [sessionParticipants.id]
  }),
  conversation: one(conversations, {
    fields: [feedback.conversationId], references: [conversations.id]
  }),
  draftSection: one(draftSections, {
    fields: [feedback.draftSectionId], references: [draftSections.id]
  }),
}));

// ─── Types ─────────────────────────────────────────────

export interface SessionConfig {
  activeComponents?: string[];
  customContext?: string;
  requireEmail?: boolean;
  maxParticipants?: number;
}

export interface ConversationAgentState {
  currentComponent?: string;
  coveredComponents?: string[];
  participantDepth?: 'new' | 'active' | 'core' | 'leadership';
  conversationPhase?: 'opening' | 'identity' | 'structure' | 'protocols' | 'closing';
  insightCount?: number;
}
