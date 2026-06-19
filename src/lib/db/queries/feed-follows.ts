import { eq, and } from "drizzle-orm";
import { db } from "..";
import { FeedFollow, feedFollows, users, feeds, User } from "../schema";
import { getFeedByURL } from "./feeds";

export async function getFeedFollowsTable(): Promise<FeedFollow[]> {
    const [...result] = await db.select().from(feedFollows);
    return result;
}

export async function getFeedFollowsByUUID(user_id: string) {
    const [...result] = await db.select().from(feedFollows).where(eq(feedFollows.userID, user_id));
    return result
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

export async function deleteFeedFollow(user: User, url: string) {
    const feed = await getFeedByURL(url);
    const [...result] = await db.delete(feedFollows).where(
        and(
            eq(feedFollows.userID, user.id),
            eq(feedFollows.feedID, feed.id)
        )
    );
    return result;
}

export async function resetFeedsFollowsTable() {
    const [result] = await db.delete(feedFollows);
    return result;
}

