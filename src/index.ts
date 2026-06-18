import {
    CommandsRegistry,
    middlewareLoggedIn,
    handlerAddFeed,
    handlerGetFeeds,
    handlerFollow,
    handlerLogin,
    handlerRegister,
    handlerResetTables,
    handlerFetchRSS,
    handlerSandbox,
    handlerUserList,
    registerCommand,
    runCommand,
    handlerFeedFollowsList,
    handlerUserFFList,
} from "./commands";

async function main() {
    let reg: CommandsRegistry = {};

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
    registerCommand(reg, "following", middlewareLoggedIn(handlerUserFFList));

    /**  
     * auth-agnostic functions
     */
    registerCommand(reg, "agg", handlerFetchRSS);
    registerCommand(reg, "feeds", handlerGetFeeds);
    registerCommand(reg, "feedfollows", handlerFeedFollowsList);
    registerCommand(reg, "users", handlerUserList);
    registerCommand(reg, "reset", handlerResetTables);

    /**
     * test function(s)
     */
    registerCommand(reg, "sandbox", handlerSandbox);

    let input = process.argv;
    let cmd = input[2];
    let args = input.slice(3);

    if (!cmd || cmd.length === 0) {
        throw new Error("not enough arguments were provided");
    }

    await runCommand(reg, cmd, ...args);

    process.exit(0);
}

main();
