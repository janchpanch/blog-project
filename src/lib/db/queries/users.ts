import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result.name;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result.name;
}

export async function getUsers() {
    // ...result -> needed to query more than the first entry in the table
    const [...result] = await db.query.users.findMany();
    return result;
}

export async function resetUserTable() {
  const [result] = await db.delete(users);
  return result;
}
