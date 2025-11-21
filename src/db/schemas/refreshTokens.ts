import { pgTable, integer, text, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user'; 

export const refreshTokens = pgTable('refresh_tokens', {
    jti: text('jti').notNull().unique(), 
    
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
        
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(), 
    isRevoked: boolean('is_revoked').default(false).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.jti] }),
}));

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;