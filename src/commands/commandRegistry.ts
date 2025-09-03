import { setUser, readConfig } from "../config";
import { createUser, getUserByName, resetDb, getUsers } from "src/lib/db/queries/users";
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;


export const handlerLogin = async (cmdName: string, ...args: string[]) => {
    if (args.length === 0) {
        throw new Error("The login argument expects a single argument, the username");
    }
    // check if username is in db
    const user = await getUserByName(args[0]);
    if (!user) {
        throw new Error("User not found");
    }
    setUser(user.name);
    console.log("Login successful");
}

export const register = async(cmdName: string, ...args: string[]) => {
    if (args.length === 0) {
        throw new Error("The register argument expects a single argument, the username");
    }
    const user = await getUserByName(args[0]);
    if (user) {
        throw new Error("User already exists");
    }
    const newUser = await (createUser(args[0]));
    setUser(newUser.name);
    console.log(`User ${newUser.name} registered successfully`, newUser);
}

export const users = async(cmdName: string, ...args: string[]) => {
    const users = await getUsers();
    const loggedUser = readConfig().currentUserName;
    users.forEach(user => console.log(`* ${user.name} ${user.name === loggedUser ? "(current)" : ""}`));
}


export const reset = async(cmdName: string, ...args: string[]) => {
    await resetDb();
    console.log("Database reset successfully");
}

export const registerCommand = (registry: CommandsRegistry, cmdName: string, handler: CommandHandler) => {
    registry[cmdName] = handler;
}

export const runCommand = async (registry: CommandsRegistry, cmdName: string, ...args: string[]) => {
    if (!registry[cmdName]) {
        throw new Error(`Command ${cmdName} not found`);
    }
    await registry[cmdName](cmdName, ...args);
}