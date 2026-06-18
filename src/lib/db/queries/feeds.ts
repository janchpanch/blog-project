import { eq, and } from "drizzle-orm";
import { db } from "..";
import { FeedFollow, feedFollows, feeds, users } from "../schema";
import { getUser } from "./users";

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

export async function getFeedsEntries() {
    const [...result] = await db.select({
        name: feeds.name,
        url: feeds.url,
        userID: feeds.userID,
    }).from(feeds);
    return result;
}

export async function createFeedFollow(userID: string, feedID: string) {
    const [ff] = await db.insert(feedFollows).values({ userID: userID, feedID: feedID }).returning();

    const [...result] = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        username: users.name,
        feedName: feeds.name
    })
        .from(feedFollows)
        .where(and(
            eq(users.id, ff.userID),
            eq(feeds.id, ff.feedID)))
        .innerJoin(users, eq(feedFollows.userID, ff.userID))
        .innerJoin(feeds, eq(feedFollows.feedID, ff.feedID));


    return result;
}

export async function getFeedFollowsTable(): Promise<FeedFollow[]> {
    const [...result] = await db.select().from(feedFollows);
    return result;
}

export async function getFeedFollowsByUUID(user_id: string) {
    const [...result] = await db.select().from(feedFollows).where(eq(feedFollows.userID, user_id));
    return result
}

export async function unfollowFeed() {

}

export async function resetFeedsTable() {
    const [result] = await db.delete(feeds);
    return result;
}

export async function resetFeedsFollowsTable() {
    const [result] = await db.delete(feedFollows);
    return result;
}

