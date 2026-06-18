import {
    CommandsRegistry,
    handlerAddFeed,
    handlerGetFeeds,
    handlerFollow,
    handlerLogin,
    handlerRegister,
    handlerResetTables,
    handlerRSS,
    handlerSandbox,
    handlerUserList,
    registerCommand,
    runCommand,
    handlerGetFeedFollows,
    handlerGetUserFF,
} from "./commands";

async function main() {
    let reg: CommandsRegistry = {};

    registerCommand(reg, "login", handlerLogin);
    registerCommand(reg, "register", handlerRegister);
    registerCommand(reg, "reset", handlerResetTables);
    registerCommand(reg, "users", handlerUserList);
    registerCommand(reg, "agg", handlerRSS);
    registerCommand(reg, "addfeed", handlerAddFeed);
    registerCommand(reg, "feeds", handlerGetFeeds);
    registerCommand(reg, "follow", handlerFollow);
    registerCommand(reg, "feedfollows", handlerGetFeedFollows);
    registerCommand(reg, "following", handlerGetUserFF);

    registerCommand(reg, "sandbox", handlerSandbox);

    let input = process.argv;
    let cmd = input[2];
    let args = input.slice(3);

    // console.log(input);
    // console.log(cmd);
    // console.log(args);

    if (!cmd || cmd.length === 0) {
        throw new Error("not enough arguments were provided");
    }

    await runCommand(reg, cmd, ...args);

    process.exit(0);
}

main();
