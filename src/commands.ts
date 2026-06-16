import { readConfig, setUser } from "./config";
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
  if (!args.length || args.length === 0) {
    throw new Error("At least one arguement is required");
  }

  if (!args.length || args.length === 0) {
    throw new Error("A username is required");
  }

  let result: any;

  try {
    result = await getUser(args[0]);
    setUser(result);
    console.log("User has been set");
  } catch {
    throw new Error("User does not exist");
  }
}

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (!args.length || args.length === 0) {
    throw new Error("At least one argument is required");
  }

  if (!args.length || args.length === 0) {
    throw new Error("A username is required");
  }

  let result: any;

  try {
    result = await createUser(args[0]);
    setUser(args[0]);
    console.log(`User ${readConfig().currentUserName} created`);
  } catch {
    throw new Error("User already exists");
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
}

export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  
  let result: any;
  try {
    result = await getUsers();
    for (let i = 0; i < result.length; i++ ) {
      let n = result[i].name;
      if (n === readConfig().currentUserName) {
        console.log(`* ${n} (current)`);
      } else {
        console.log(`* ${n}`);
      }
    }

  } catch {
    throw new Error("users command failed")
  }
}

export async function handlerSandbox(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await fetchFeed("https://www.wagslane.dev/");
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
