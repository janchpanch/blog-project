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

