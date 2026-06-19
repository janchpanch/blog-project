import { resetFeedsFollowsTable } from "src/lib/db/queries/feed-follows";
import { resetFeedsTable } from "src/lib/db/queries/feeds";
import { resetPostsTable } from "src/lib/db/queries/posts";
import { resetUserTable } from "src/lib/db/queries/users";
import { User } from "src/lib/db/schema";

export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;



export type CommandsRegistry = Record<string, CommandHandler>;

// middleware user command handler
export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;


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

    try {
        await resetPostsTable();
        console.log("posts table reset successfully");
    } catch (err) {
        throw new Error(`posts table reset fail: ${err}`)
    }
}