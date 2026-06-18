import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
    url: text("url").notNull().unique(),
    userID: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
});

export const feedFollows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    userID: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    feedID: uuid("feed_id").references(() => feeds.id, { onDelete: 'cascade' }).notNull(),
}, (t) => [
    unique().on(t.userID, t.feedID),
]
)

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
export type FeedFollow = typeof feedFollows.$inferInsert;

export async function printFeed(feed: Feed, user: User) {
    console.log(feed)
    console.log(user)
}