import { setUser, readConfig } from "../config";
import { createUser, getUserByName, resetDb, getUsers, getUserById } from "src/lib/db/queries/users";
import { XMLParser } from "fast-xml-parser";
import { createFeed, getFeedByUrl, getFeeds } from "src/lib/db/queries/feeds";
import { feeds as feedsTable, users as usersTable } from "src/lib/db/schema";
import { createFeedFollow, deleteFeedFollow, getFeedFollowsForUser } from "src/lib/db/queries/follows";
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
export type RSSFeed = {
    channel: {
      title: string;
      link: string;
      description: string;
      item: RSSItem[];
    };
  };
export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
  };
export type Feed = typeof feedsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;


// COMMANDS FOR USERS

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

// COMMANDS FOR DB

export const reset = async(cmdName: string, ...args: string[]) => {
    await resetDb();
    console.log("Database reset successfully");
}


// COMMANDS FOR REGISTRY

export const registerCommand = (registry: CommandsRegistry, cmdName: string, handler: CommandHandler) => {
    registry[cmdName] = handler;
}

export const runCommand = async (registry: CommandsRegistry, cmdName: string, ...args: string[]) => {
    if (!registry[cmdName]) {
        throw new Error(`Command ${cmdName} not found`);
    }
    await registry[cmdName](cmdName, ...args);
}

// COMMANDS FOR RSS

export const fetchFeed = async (feedURL: string) => {
    let res: any;
    try {
        res = await fetch(feedURL, {
            method: "GET",
            headers: {
                "User-Agent": "gator",
            },
        });
    } catch (err) {
        throw new Error(`Network error fetching feed: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (!res || !res.ok) {
        const status = res?.status ?? "unknown";
        const statusText = res?.statusText ?? "";
        throw new Error(`Failed to fetch feed: ${status} ${statusText}`.trim());
    }

    const contentType = typeof res.headers?.get === "function" ? (res.headers.get("content-type") ?? "") : "";
    const xml = await res.text();

    // Basic non-XML detection (e.g., HTML block/redirect pages)
    const looksLikeHTML = /<!doctype html|<html[\s>]/i.test(xml);
    if ((contentType && !/(xml|rss|atom)/i.test(contentType)) || looksLikeHTML) {
        throw new Error(`Non-XML response (content-type: ${contentType || "unknown"}). Response may be HTML due to redirect or block.`);
    }

    const parser = new XMLParser();
    const parsed: any = parser.parse(xml);

    // Support both { rss: { channel } } and { channel }
    const channel: any = parsed?.rss?.channel ?? parsed?.channel;
    if (!channel || typeof channel !== "object") {
        throw new Error("Invalid feed: missing channel");
    }

    // Validate required channel metadata as non-empty strings
    const isNonEmptyString = (v: any) => typeof v === "string" && v.trim().length > 0;
    const title = channel.title;
    const link = channel.link;
    const description = channel.description;
    if (!isNonEmptyString(title) || !isNonEmptyString(link) || !isNonEmptyString(description)) {
        throw new Error("Invalid feed: missing channel metadata");
    }

    // Normalize items to an array; ignore non-object/array values
    let items: any[] = [];
    const rawItems = channel.item;
    if (Array.isArray(rawItems)) {
        items = rawItems;
    } else if (rawItems && typeof rawItems === "object") {
        items = [rawItems];
    } // else: leave as empty [] if it's a string/number/etc.

    const normalizedItems = items.filter((item) => {
        return (
            item &&
            typeof item === "object" &&
            isNonEmptyString(item.title) &&
            isNonEmptyString(item.link) &&
            isNonEmptyString(item.description) &&
            isNonEmptyString(item.pubDate)
        );
    });

    const metadata: RSSFeed = {
        channel: {
            title,
            link,
            description,
            item: normalizedItems as RSSItem[],
        },
    };

    return metadata;
}

export const agg = async () => {
    const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(feed, null, 2));
}


// COMMANDS FOR FEEDS

export const addfeed = async (_cmdName: string, user: User, name: string, url: string) => {
    if (!name || !url) {
        throw new Error("The addfeed argument expects two arguments, the name and the url");
    }
    
    const [feed] = await createFeed(name, url, user.id);
    printFeed(feed, user); 
    
    const feedFollow = await createFeedFollow(user.id, feed.id);
    printFeedFollow(user.name, feedFollow.feedName);
};

export const printFeed = async (feed: Feed, user: User) => {
    console.log(`* ID:            ${feed.id}`);
    console.log(`* Created:       ${feed.createdAt}`);
    console.log(`* Updated:       ${feed.updatedAt}`);
    console.log(`* name:          ${feed.name}`);
    console.log(`* URL:           ${feed.url}`);
    console.log(`* User:          ${user.name}`);
};

export const feeds = async () => {
    const feeds = await getFeeds();
    feeds.forEach(feed => printFeed(feed.feeds, feed.users));
};

// COMMANDS FOR FEEDFOLLOWS

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("The follow argument expects a single argument, the feed name")
    }

    const feedURL = args[0];
    const feed = await getFeedByUrl(feedURL);
    if (!feed) {
        throw new Error("Feed not found");
    }

    const ffRow = await createFeedFollow(user.id, feed[0].id);
    console.log(`Feed follow created`);
    printFeedFollow(ffRow.userName, ffRow.feedName);

}


export async function handlerListFeedFollows(_cmdName: string, user: User) {

    const feedFollows = await getFeedFollowsForUser(user.id);
    if (feedFollows.length === 0){
        console.log("No feed follows found for this user");
        return;
    }
    
    console.log(`Feed follows for user %s:`, user.id);
    for (let ff of feedFollows) {
        console.log(`* %s`, ff.feedname);
    }
}

export async function handlerListFeeds(_cmdName: string) {
    const feeds = await getFeeds();
  
    if (feeds.length === 0) {
      console.log(`No feeds found.`);
      return;
    }
  
    console.log(`Found %d feeds:\n`, feeds.length);
    for (let feed of feeds) {
      const user = await getUserById(feed.feeds.userId);
      if (!user) {
        throw new Error(`Failed to find user for feed ${feed.feeds.id}`);
      }
  
      printFeed(feed.feeds, user);
      console.log(`=====================================`);
    }
}


export function printFeedFollow(username: string, feedname: string) {
    console.log(`* User:          ${username}`);
    console.log(`* Feed:          ${feedname}`);
}

export async function unfollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("The unfollow argument expects a single argument, the feed name")
    }
    const feedName = args[0];
    const feedFollow = await getFeedFollowsForUser(user.id);
    if (!feedFollow) {
        throw new Error("Feed follow not found");
    }
    await deleteFeedFollow(user.id, feedFollow[0].feedId);
    console.log(`Feed follow deleted`);
}