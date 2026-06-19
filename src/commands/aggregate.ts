import { parseDuration } from "src/lib/util/helper";
import { readConfig } from "src/config";
import { getFeedFollowsTable, resetFeedsFollowsTable } from "src/lib/db/queries/feed-follows";
import { getFeeds, getNextFeedToFetch, markFeedFetched, resetFeedsTable } from "src/lib/db/queries/feeds";
import { getUserByUUID, getUsers, resetUserTable } from "src/lib/db/queries/users";
import { fetchFeed } from "src/lib/rss/rss";

// command "users"
export async function handlerGetUsers(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    let result = await getUsers();
    if (!result.length) {
        console.log("no users exist in the database");
    } else {
        for (let i = 0; i < result.length; i++) {
            let n = result[i].name;
            if (n === readConfig().currentUserName) {
                console.log(`* ${n} (current)`);
            } else {
                console.log(`* ${n}`);
            }
        }
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

// command "feedfollows"
export async function handlerFeedFollowsTable(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    try {
        const [...result] = await getFeedFollowsTable();
        console.log(result);
    } catch (err) {
        throw new Error(`get feed follows data failed: ${err}`);
    }
}

// command "agg"
export async function handlerAggRSS(
    cmdName: string,
    ...args: string[]
): Promise<void> {

    if (!args[0]) {
        throw new Error("required: time between reqs as regex string '1s', '1m', '1h'")
    }

    // try {
    //     const result = await fetchFeed(args[0]);
    //     console.dir(result, { depth: null });
    // } catch (err) {
    //     throw new Error("failed to fetch feed", { cause: err });
    // }
    let timeBetweenRequests = parseDuration(args[0]);

    console.log(`Collecting feeds every \n${args[0]}\n`);

    scrapeFeeds().catch();

    const interval = setInterval(() => {
        scrapeFeeds().catch();
    }, timeBetweenRequests);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}

export async function scrapeFeeds() {
    const feedToUpdate = await getNextFeedToFetch();
    const rss = await fetchFeed(feedToUpdate.url);
    await markFeedFetched(feedToUpdate)

    for (let i of rss.channel.item) {
        console.log(i.title)
    }
}

// command "reset"
export async function handlerResetTables(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    try {
        await resetUserTable();
        console.log("User table reset successful");
    } catch (err) {
        throw new Error(`User table reset fail: ${err}`);
    }

    try {
        await resetFeedsTable();
        console.log("Feed table reset successful");
    } catch (err) {
        throw new Error(`Feed table reset fail: ${err}`);
    }

    try {
        await resetFeedsFollowsTable();
        console.log("feed_follows table reset successfully");
    } catch (err) {
        throw new Error(`feed_follows table reset fail: ${err}`);
    }
}