import { db } from "..";
import { Feed, feeds } from "../schema";

export async function createFeed(name: string, url: string, userID: string) {
    let result: any;

    try {
        result = await db.insert(feeds).values({ name: name, url: url, userID: userID }).returning();
    } catch {
        throw new Error("feed insert failed")
    }
}

export async function resetFeedsTable() {
    const [result] = await db.delete(feeds);
    return result;
}

