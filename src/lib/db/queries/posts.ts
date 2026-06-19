import { RSSItem } from "src/lib/rss/rss";
import { db } from "..";
import { Feed, feedFollows, posts, User } from "../schema";
import { eq, desc } from "drizzle-orm"

export async function createPost(feed: Feed, item: RSSItem) {
    const dateObj = new Date(item.pubDate);
    const [result] = await db.insert(posts)
        .values({
            title: item.title,
            url: item.link,
            description: item.description,
            publishedAt: dateObj,
            feedID: feed.id
        })
        .onConflictDoNothing();
    return result;
}

export async function getPostsForUser(user: User, limit: number) {
    const [...userPosts] = await db.select()
        .from(feedFollows)
        .innerJoin(posts, 
            eq(feedFollows.feedID, posts.feedID))
        .where(
            eq(feedFollows.userID, user.id))
        .orderBy(desc(posts.publishedAt))
        .limit(limit)
    return userPosts;
}

export async function resetPostsTable() {
    const [result] = await db.delete(posts);
    return result;
}