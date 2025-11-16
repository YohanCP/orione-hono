import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable('users',{
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  isValidated: boolean('is_validated').default(false).notNull()
});

export type NewUser = typeof users.$inferInsert;