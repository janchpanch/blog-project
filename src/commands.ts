import { readConfig, setUser } from "./config";
import { createFeed, resetFeedsTable } from "./lib/db/queries/feeds";
import { createUser, getUser, getUsers, resetUserTable } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/rss/rss";

export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

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
        throw new Error("User does not exist")
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
        console.log(`User ${args[0]} been registered and is now the active user`);
    } catch {
        throw new Error(`User ${args[0]} is already registered`);
    }
}

export async function handlerReset(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    let result: any;

    try {
        result = await resetUserTable();
        console.log("User table reset successful");
    } catch {
        throw new Error("User table reset fail");
    }

    try {
        result = await resetFeedsTable();
        console.log("Feed table reset successful");
    } catch {
        throw new Error("Feed table reset fail");
    }
}

export async function handlerUsers(
    cmdName: string,
    ...args: string[]
): Promise<void> {

    let result = await getUsers();
    if (!result.length) {
        console.log("no users exist in the database")
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

export async function handlerRSS(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    let result = await fetchFeed("https://www.wagslane.dev/index.xml");

    if (!result) {
        throw new Error("feed request failed");
    } else {
        console.dir(result, { depth: null })
    }
}

export async function handlerAddFeed(
    cmdName: string,
    ...args: string[]
): Promise<void> {

    switch (args.length) {
        case 0:
            throw new Error("feed name and url required")
        case 1:
            throw new Error("feed url required")

    }
    
    // Take the name, url, and requested user UUID from a getUser() query call -> nested await ftw
    await createFeed(args[0], args[1], (await getUser(readConfig().currentUserName)).id);;
    
    // Error thrown within createFeed(), will stop log if failed
    console.log("feed added successfully")    
}

export async function handlerSandbox(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    await fetchFeed("https://www.wagslane.dev/index.xml");
}

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

    // Await here is crucial - errors fail to throw otherwise
    await fn(cmdName, ...args);
}
