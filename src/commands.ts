import { readConfig, setUser } from "./config";
import {
    createFeed,
    createFeedFollow,
    getFeedByURL,
    getFeedByUUID,
    getFeedFollowsTable,
    getFeedFollowsByUUID,
    getFeedsEntries,
    resetFeedsFollowsTable,
    resetFeedsTable,
} from "./lib/db/queries/feeds";
import {
    createUser,
    getUser,
    getUserByUUID,
    getUsers,
    resetUserTable,
} from "./lib/db/queries/users";
import { User } from "./lib/db/schema";
import { fetchFeed } from "./lib/rss/rss";

export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

/**
 * functions for command usage
 */

export async function registerCommand(
    registry: CommandsRegistry,
    cmdName: string,
    handler: CommandHandler,
) {
    registry[cmdName] = handler;
}

export async function runCommand(
    registry: CommandsRegistry,
    cmdName: string,
    ...args: string[]
) {
    const fn = registry[cmdName];

    if (!fn) {
        throw new Error("Command not registered");
    }

    // await here is crucial - errors fail to throw otherwise
    await fn(cmdName, ...args);
}

/**
 * auth functions 
 */
export async function handlerLogin(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    if (!args.length) {
        throw new Error("At least one arguement is required");
    }

    let result = await getUser(args[0]);
    if (result) {
        setUser(args[0]);
        console.log("User has been set");
    } else {
        throw new Error("User does not exist");
    }
}

export async function handlerRegister(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    if (!args.length) {
        throw new Error("At least one argument is required");
    }
    try {
        await createUser(args[0]);
        setUser(args[0]);
        console.log(
            `User ${args[0]} has been registered and is now the active user`,
        );
    } catch {
        throw new Error(`User ${args[0]} is already registered`);
    }
}

/*
 * "logged in" functions
 */

// middleware user command handler
export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

// abstracted user check to database
export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName, ...args) => {
        const user = await getUser(readConfig().currentUserName);
        if (!user) {
            throw new Error(`User ${user} does not exist`);
        }
        await handler(cmdName, user, ...args);
    }
}

// command "add"
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
        throw new Error(`oopsie woopsie: ${err}`);
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
        for (let i of result) {
            const feed = await getFeedByUUID(i.feedID);
            console.log(`  ${feed.name}`);
        }
    } catch (err) {
        throw new Error(`query for current user's feedfollows failed: ${err}`);
    }
}



/**
 * login agnostic functions
 */

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

// command "users"
export async function handlerUserList(
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
        const feeds = await getFeedsEntries();
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
export async function handlerFetchRSS(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    try {
        const result = await fetchFeed("https://www.wagslane.dev/index.xml");
        console.dir(result, { depth: null });
    } catch (err) {
        throw new Error("failed to fetch feed", { cause: err });
    }
}

// command "sandbox"
export async function handlerSandbox(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    await fetchFeed("https://www.wagslane.dev/index.xml");
}
