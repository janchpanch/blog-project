import { XMLParser } from "fast-xml-parser";
import { isRecord } from "../util/validation";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedURL: string) {
    // Assign the response obj as *response*, not any
    let response: Response;
    try {
        response = await fetch(feedURL, {
            headers: {
                "User-Agent": "gator",
            },
        });
    } catch (error) {
        throw new Error(`Something went wrong: ${error}`);
    }

    let data = await response.text();
    let parser = new XMLParser({
        processEntities: false,
    });

    const parsed = parser.parse(data);

    if (!isRecord(parsed)) {
        throw new Error("invalid RSS feed");
    }

    const rss = parsed.rss;

    if (!isRecord(rss)) {
        throw new Error("invalid RSS feed");
    }

    const channel = rss.channel;

    if (!isRecord(channel)) {
        throw new Error("invalid RSS feed");
    }

    const { title, link, description } = channel;

    if (
        typeof title !== "string" ||
        typeof link !== "string" ||
        typeof description !== "string"
    ) {
        throw new Error("invalid RSS feed metadata");
    }

    // Handle the the RSSItem objects
    const rawItem = channel.item;
    let rawItems: unknown[];
    let validItems: RSSItem[] = [];

    console.log(typeof rawItem);


    if (Array.isArray(rawItem)) {
        rawItems = rawItem;
        // console.log("Array check")
        // console.log(rawItems)
    } else if (isRecord(rawItem)) {
        rawItems = [rawItem];
        // console.log("Record check")
    } else {
        rawItems = [];
        // console.log("Empty default")
    }

    // **IN** gives indices | **OF** yields objects. Python spoilage.
    for (const rawItem of rawItems) {
        if (!isRecord(rawItem)) {
            // console.log("invalid record")
            continue;
        }

        const { title, link, description, pubDate } = rawItem;

        if (
            typeof title !== "string" ||
            typeof link !== "string" ||
            typeof description !== "string" ||
            typeof pubDate !== "string"
        ) {
            continue;
        }

        validItems.push({
            title,
            link,
            description,
            pubDate,
        });

    }

    let feed: RSSFeed = {
        channel: {
            title: title,
            link: link,
            description: description,
            item: validItems,
        },
    };
    return feed;
}
