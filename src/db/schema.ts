import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
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
