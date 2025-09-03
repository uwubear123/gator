import { db } from "..";
import { feeds, users } from "../schema";
import { eq } from "drizzle-orm";
import { readConfig } from "src/config";

export async function createFeed(name: string, url: string, user_id: string) {
    const feed = await db.insert(feeds).values({ name: name, url: url, user_id: user_id }).returning();
    return feed;
}

export async function getFeeds() {
    // should also return the username that created the feed
    const result = await db.select().from(feeds).innerJoin(users, eq(feeds.user_id, users.id));
    return result;
}