import { setUser, readConfig } from "./config";
import { CommandsRegistry, handlerLogin, registerCommand, runCommand, register, reset, users } from "./commands/commandRegistry";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", register);
  registerCommand(registry, "reset", reset);
  registerCommand(registry, "users", users);

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
