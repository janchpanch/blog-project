import {
    CommandsRegistry,
    handlerLogin,
    handlerRegister,
    handlerReset,
    handlerRSS,
    handlerSandbox,
    handlerUsers,
    registerCommand,
    runCommand,
} from "./commands";

async function main() {
    let reg: CommandsRegistry = {};

    registerCommand(reg, "login", handlerLogin);
    registerCommand(reg, "register", handlerRegister);
    registerCommand(reg, "reset", handlerReset);
    registerCommand(reg, "users", handlerUsers);
    registerCommand(reg, "agg", handlerRSS)

    registerCommand(reg, "sandbox", handlerSandbox)

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
