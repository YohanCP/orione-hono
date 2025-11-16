import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, boolean, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum('user_role', ['user', 'seller']);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    role: userRoleEnum('role').notNull().default('user'),
    isValidated: boolean("is_validated").default(false).notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_unique").on(
      sql`lower(${table.username})`
    ),
    emailIdx: uniqueIndex("users_email_unique").on(
      sql`lower(${table.email})`
    ),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;