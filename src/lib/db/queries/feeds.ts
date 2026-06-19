import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { Feed, feeds } from "../schema";

export async function createFeed(name: string, url: string, userID: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, userID: userID }).returning();
    return result;
}

export async function getFeedByURL(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function getFeedByUUID(id: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.id, id));
    return result;
}

export async function getFeeds() {
    const [...result] = await db.select({
        name: feeds.name,
        url: feeds.url,
        userID: feeds.userID,
    }).from(feeds);
    return result;
}

export async function markFeedFetched(feed: Feed) {
    const [...result] = await db.update(feeds).set({ updatedAt: sql`NOW()`, lastFetchedAt: sql`NOW()` }).where(eq(feeds.id, feed.id)).returning();
    return result;
}

export async function getNextFeedToFetch() {
    const [result] = await db.select().from(feeds).orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`);
    return result;
}

export async function resetFeedsTable() {
    const [result] = await db.delete(feeds);
    return result;
}

