import { createFeedFollow } from "src/lib/db/queries/feed-follows";
import { createFeed } from "src/lib/db/queries/feeds";
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
