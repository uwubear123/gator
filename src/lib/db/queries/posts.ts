import { eq, and } from "drizzle-orm";
import { db } from "..";
import { posts, feeds } from "../schema";
import { getUserByName } from "./users";

export async function createPost(feed_id: string, title: string, url: string, description: string) {
    const [newPost] = await db.insert(posts).values({ title, url, description, feed_id }).returning();
    console.log(`Post created: ${newPost.id}`);
}

export async function getPostsForUser(username: string) {
    const user = getUserByName(username);
    const result = await db.select().from(posts).innerJoin(feeds, eq(posts.feed_id, feeds.id)).where(eq(feeds.userId, (await user)?.id));
    return result;
}

