import { CommandHandler, UserCommandHandler } from "./commands/commands";
import { readConfig } from "./config";
import { getUser } from "./lib/db/queries/users";

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