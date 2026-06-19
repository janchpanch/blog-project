import { setUser } from "src/config";
import { getUser, createUser } from "src/lib/db/queries/users";

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