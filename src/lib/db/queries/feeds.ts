import { eq, and } from "drizzle-orm";
import { db } from "..";
import { feed_follows as feedFollows, feeds, users } from "../schema";

export async function createFeed(name: string, url: string, userID: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, userID: userID }).returning();
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

export async function createFeedFollow(userID: string, feedID: string) {
    const [newFeedFollow] = await db.insert(feedFollows).values({ userID: userID, feedID: feedID }).returning();
    
    const [result] = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        udpatedAt: feedFollows.updatedAt,
    })
    .from(feedFollows)
    .where(and(
        eq(users.id, newFeedFollow.userID),
        eq(feeds.id, newFeedFollow.feedID)))
    .innerJoin(users, eq(feedFollows.userID, users.id))
    .innerJoin(feeds, eq(feedFollows.feedID, feeds.id));
    
    return result;
}

export async function resetFeedsTable() {
    const [result] = await db.delete(feeds);
    return result;
}

export async function resetFeedsFollowsTable() {
    const [result] = await db.delete(feedFollows);
    return result;
}

