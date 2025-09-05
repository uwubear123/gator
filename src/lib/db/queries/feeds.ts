import { db } from "..";
import { feeds, users, feedFollows } from "../schema";
import { eq, sql } from "drizzle-orm";
import { readConfig } from "src/config";

export async function createFeed(name: string, url: string, userId: string) {
    const feed = await db.insert(feeds).values({ name: name, url: url, userId: userId }).returning();
    return feed;
}

export async function getFeeds() {
    // should also return the username that created the feed
    const result = await db.select().from(feeds).innerJoin(users, eq(feeds.userId, users.id));
    return result;
}


export async function getFeedByUrl(url: string) {
    const feed = await db.select().from(feeds).where(eq(feeds.url, url));
    return feed;
}

export async function markFeedFetched(id: string) {
    await db.update(feeds).set({ last_fetched_at: new Date(), updatedAt: new Date() }).where(eq(feeds.id, id));
}

export async function getNextFeedToFetch() {
    const result = await db.select().from(feeds).where(sql`last_fetched_at IS NULL`).orderBy(sql`created_at ASC`).limit(1);
    return result[0] || null;
}