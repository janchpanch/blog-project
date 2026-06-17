import { db } from "..";
import { feeds } from "../schema";

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

export async function resetFeedsTable() {
    const [result] = await db.delete(feeds);
    return result;
}

