import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { firstOrUndefined } from "./utils";

export async function createUser(name: string) {
    const [result] = await db.insert(users).values({ name: name}).returning();
    return result;
}

export async function getUserByName(name: string) {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    return result;
}

export async function resetDb() {
    await db.delete(users);
    return "Database reset successfully";
}

export async function getUsers() {
    const result = await db.select().from(users);
    return result;
}

export async function getUserById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return firstOrUndefined(result);   
}