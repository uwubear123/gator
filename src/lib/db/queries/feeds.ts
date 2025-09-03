import { db } from "..";
import { feeds } from "../schema";
import { eq } from "drizzle-orm";
import { readConfig } from "src/config";

export async function createFeed(name: string, url: string, user_id: string) {
    const feed = await db.insert(feeds).values({ name: name, url: url, user_id: user_id }).returning();
    return feed;
}