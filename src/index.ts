import { setUser, readConfig } from "./config";
import { CommandsRegistry, handlerLogin, registerCommand,
         runCommand, register, reset, users, agg, addfeed,
         feeds, handlerFollow, handlerListFeeds, handlerListFeedFollows, unfollow, 
         browse} from "./commands/commandRegistry";
import { loggedIn } from "./middleware/middleware";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", register);
  registerCommand(registry, "reset", reset);
  registerCommand(registry, "users", users);
  registerCommand(registry, "agg", agg);
  registerCommand(registry, "addfeed", loggedIn(addfeed));
  registerCommand(registry, "feeds", feeds);
  registerCommand(registry, "follow", loggedIn(handlerFollow));
  registerCommand(registry, "feeds", loggedIn(handlerListFeeds));
  registerCommand(registry, "following", loggedIn(handlerListFeedFollows));
  registerCommand(registry, "unfollow", loggedIn(unfollow));
  registerCommand(registry, "browse", browse);

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("No command provided");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  await runCommand(registry, cmdName, ...cmdArgs);
  process.exit(0);
}



main();
