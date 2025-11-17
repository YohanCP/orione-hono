import { relations } from "drizzle-orm";
import { pgTable, serial, numeric, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const products = pgTable(
    "products", {
        id: serial('id').primaryKey(),
        name: text('name').notNull(),
        amount: numeric('amount').default('1').notNull(),
        sku: text('sku'),
        price: integer('price').notNull(),
        sellerId: integer('seller_id')
            .notNull()
            .references(() => users.id, {onDelete: 'cascade'}),
        createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const productRelations = relations(products, ({ one }) => ({
    seller: one(users, {
        fields: [products.sellerId],
        references: [users.id]
    }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert