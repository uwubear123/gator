import { CommandHandler, User } from "src/commands/commandRegistry";
import { readConfig } from "src/config";
import { getUserByName } from "src/lib/db/queries/users";

type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const loggedIn: middlewareLoggedIn = (handler: UserCommandHandler) => {
    return async (cmdName: string, ...args: string[]) => {
        const username = readConfig().currentUserName;
        if (!username) {
            throw new Error("User not logged in");
        }
        const user = await getUserByName(username);
        if (!user) {
            throw new Error("User not found");
        }
        return handler(cmdName, user, ...args);
    }
};