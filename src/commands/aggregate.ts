import { parseDuration } from "src/lib/util/helper";
import { getNextFeedToFetch, markFeedFetched } from "src/lib/db/queries/feeds";
import { fetchFeed } from "src/lib/rss/rss";
import { createPost, getPostsForUser } from "src/lib/db/queries/posts";
import { User } from "src/lib/db/schema";

// command "agg"
export async function handlerAggRSS(
    cmdName: string,
    ...args: string[]
): Promise<void> {

    if (!args[0]) {
        throw new Error("required: time between reqs as regex string '1s', '1m', '1h'")
    }

    let timeBetweenRequests = parseDuration(args[0]);

    console.log(`Collecting feeds every \n${args[0]}\n`);

    scrapeFeeds().catch();

    const interval = setInterval(() => {
        let date = new Date();
        console.log(`${date.toTimeString()}: feeds refreshed`)
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
    await markFeedFetched(feedToUpdate);

    for (let i of rss.channel.item) {
        await createPost(feedToUpdate, i)
    }
}

// command "browse"
export async function handlerBrowse(
    cmdName: string,
    user: User,
    ...args: string[]
): Promise<void> {
    if (!args[0]) {
        throw new Error("number limit required");
    }
    
    const [...posts] = await getPostsForUser(user, Number(args[0]));
    for (const i of posts) {
        const { title, url, description, publishedAt } = i.posts
        console.log(`${title}\n${url}\n${description}\n${publishedAt}\n`);
    }
}
