import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable('users',{
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull()
});

export type NewUser = typeof users.$inferInsert;