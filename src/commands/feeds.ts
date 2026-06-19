import { createFeedFollow } from "src/lib/db/queries/feed-follows";
import { createFeed, getFeeds } from "src/lib/db/queries/feeds";
import { getUserByUUID } from "src/lib/db/queries/users";
import { User } from "src/lib/db/schema";

export async function handlerAddFeed(
    cmdName: string,
    user: User,
    ...args: string[]
): Promise<void> {
    switch (args.length) {
        case 0:
            throw new Error("feed name and url required");
        case 1:
            throw new Error("feed url required");
    }

    // Take the name, url, and requested user UUID from a getUser() query call
    try {
        const newFeed = await createFeed(args[0], args[1], user.id);
        await createFeedFollow(user.id, newFeed.id);
        console.log(`feed: ${newFeed.name}, user: ${user.name} added successfully`);
    } catch (err) {
        throw new Error(`failed to create feed "${args[0]}": "${args[1]}"`, {
            cause: err,
        });
    }
}

// command "feeds"
export async function handlerGetFeeds(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    try {
        // fetch all feeds
        const feeds = await getFeeds();
        for (let i of feeds) {
            // fetch the username from the stored user_id in each feed entry
            const user = await getUserByUUID(i.userID)
            console.log(`name: ${i.name}\nurl: ${i.url}\nusername: ${user.name}\n`);
        }
    } catch (err) {
        console.log(`feeds call to db failed: ${err}`);
    }
}
