import { createFeedFollow, deleteFeedFollow, getFeedFollowsByUUID } from "src/lib/db/queries/feed-follows";
import { getFeedByURL, getFeedByUUID } from "src/lib/db/queries/feeds";
import { User } from "src/lib/db/schema";

// command "follow"
export async function handlerFollow(
    cmdName: string,
    user: User,
    ...args: string[]
): Promise<void> {
    if (!args.length) {
        throw new Error("input url required");
    }
    try {
        const feed = await getFeedByURL(args[0]);
        const feedFollow = await createFeedFollow(user.id, feed.id);
        console.log(feedFollow);
    } catch (err) {
        throw new Error(`user <${user.name}> cannot follow <${args[0]}>: ${err}`);
    }
}

// command "unfollow"
export async function handlerUnfollow(
    cmdName: string,
    user: User,
    ...args: string[]
): Promise<void> {
    if (!args.length) {
        throw new Error("a url is required")
    }

    try {
        await deleteFeedFollow(user, args[0])
    } catch (err) {
        throw new Error(`you <${user.name}> cannot unfollow <${args[0]}: ${err}>`);
    }
}

// command "following"
export async function handlerUserFFList(
    cmdName: string,
    user: User,
    ...args: string[]
): Promise<void> {
    try {
        const [...result] = await getFeedFollowsByUUID(
            user.id,
        );
        console.log(`You {${user.name}} are following:`);
        if (!result.length) {
            console.log("  no feed(s) followed")
        }
        for (let i of result) {
            const feed = await getFeedByUUID(i.feedID);
            console.log(`  ${feed.name}`);
        }
    } catch (err) {
        throw new Error(`query for current user's feedfollows failed: ${err}`);
    }
}