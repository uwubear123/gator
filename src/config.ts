import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
    dbUrl: string;
    currentUserName?: string;    
};

// we want to read the db_url thats in .gatorconfig.json and add the username to it. The username will be added manually in the main function
export function setUser(username: string) {
    const config = readConfig();
    config.currentUserName = username;
    writeConfig(config);
}

// helper functions to repair setUser function

const getConfigFilePath = () => path.join(os.homedir(), ".gatorconfig.json");

const serializeConfig = (config: Config) => {
    return {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName
    };
};

const writeConfig = (config: Config) => fs.writeFileSync(getConfigFilePath(), JSON.stringify(serializeConfig(config)));
export const readConfig = () => validateConfig(JSON.parse(fs.readFileSync(getConfigFilePath(), {encoding: "utf-8"})));

// this is used by readConfig to validate result of JSON.parse
export const validateConfig = (rawConfig: any): Config => {
    // accept snake_case and map it to camelCase
    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name || undefined
    };
    
    if (typeof config !== "object") {
        throw new Error("Invalid config");
    }
    if (typeof config.dbUrl !== "string") {
        throw new Error("Invalid config");
    }

    return config; 
};

