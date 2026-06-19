import { handlerAggRSS, handlerBrowse } from "./commands/aggregate";
import { CommandsRegistry, registerCommand, handlerResetTables, runCommand } from "./commands/commands";
import { handlerFollow, handlerUnfollow, handlerUserFFList, handlerFeedFollowsList } from "./commands/feed-follows";
import { handlerAddFeed, handlerGetFeeds } from "./commands/feeds";
import { handlerLogin, handlerRegister, handlerGetUsers } from "./commands/users";
import { middlewareLoggedIn } from "./middleware";

async function main() {
    let reg: CommandsRegistry = {};

    let input = process.argv;
    let cmd = input[2];
    let args = input.slice(3);

    if (!cmd || cmd.length === 0) {
        throw new Error("not enough arguments were provided");
    }

    /**
     * auth functions
     */
    registerCommand(reg, "login", handlerLogin);
    registerCommand(reg, "register", handlerRegister);

    /**
     * "logged-in" functions
     */
    registerCommand(reg, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(reg, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(reg, "unfollow", middlewareLoggedIn(handlerUnfollow));
    registerCommand(reg, "following", middlewareLoggedIn(handlerUserFFList));
    registerCommand(reg, "browse", middlewareLoggedIn(handlerBrowse));

    /**  
     * auth-agnostic functions
     */
    registerCommand(reg, "reset", handlerResetTables);
    registerCommand(reg, "users", handlerGetUsers);
    registerCommand(reg, "reset", handlerResetTables);
    registerCommand(reg, "feeds", handlerGetFeeds);
    registerCommand(reg, "feedfollows", handlerFeedFollowsList);
    registerCommand(reg, "agg", handlerAggRSS);

    await runCommand(reg, cmd, ...args);

    process.exit(0);
}

main();
