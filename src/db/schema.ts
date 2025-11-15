// import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
// import * as t from "drizzle-orm/pg-core";

// export const users = table(
//     "users",{
//         id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
//         username: t.varchar("username", {length: 256}),
//         email: t.varchar().notNull(),
//     },
//     (table) => [
//         t.uniqueIndex("email_idx").on(table.email)
//     ]
// )

// src/db/schema.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // UUID or nanoid
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(), // Store the HASH, never the plaintext password!
  createdAt: timestamp('created_at').defaultNow().notNull(),
});