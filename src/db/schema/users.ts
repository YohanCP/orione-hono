import { AnyPgColumn } from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["user", "admin"]);

export const users = table(
    "users",{
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        username: t.varchar("username", {length: 256}),
        email: t.varchar().notNull(),
        role: rolesEnum().default("user")
    },
    (table) => [
        t.uniqueIndex("email_idx").on(table.email)
    ]
)