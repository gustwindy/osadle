import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema.ts";

export function InitDb(d1Db: D1Database) {
    const db = drizzle(d1Db);

    const sql = {
        songs: {
            upload: async (
                songId: string,
                commonName: string,
                audioHash: string,
                imageHash: string,
            ) => {
                return await db.insert(schema.songs).values({
                    songId,
                    commonName,
                    audioHash,
                    imageHash,
                });
            },

            delete: async (songId: string) => {
                return await db
                    .delete(schema.songs)
                    .where(eq(schema.songs.songId, songId));
            },

            get: async (songId: string): Promise<schema.Song | undefined> => {
                return await db
                    .select()
                    .from(schema.songs)
                    .where(eq(schema.songs.songId, songId))
                    .get();
            },

            aliases: async (
                songId: string,
                add?: string[],
                remove?: string[],
            ) => {
                const song = await sql.songs.get(songId);
                if (!song) return;

                if (add) {
                    song.aliases.push(...add);
                }

                return await db
                    .update(schema.songs)
                    .set({
                        aliases: song.aliases.filter((a) => {
                            return !remove?.includes(a);
                        }),
                    })
                    .where(eq(schema.songs.songId, songId));
            },

            list: async () => {
                return await db.select().from(schema.songs);
            },
        },
        history: {
            migrateV1ToV2: async () => {
                const oldHistory = await db
                    .select()
                    .from(schema.legacyHistory)
                    .all();

                const newHistory = await db.select().from(schema.history).all();

                const existingDays = newHistory.map((n) => {
                    return n.day;
                });

                // once in a life time for loop instead of forEach from me (cos async)
                for (const old of oldHistory) {
                    if (!existingDays.includes(old.day)) {
                        await sql.history.new(old.day, old.time, {});
                        existingDays.push(old.day);
                    }
                }
            },

            last: async (): Promise<schema.History | undefined> => {
                return await db
                    .select()
                    .from(schema.history)
                    .orderBy(desc(schema.history.day))
                    .limit(1)
                    .get();
            },
            recent: async (days: number = 10): Promise<schema.History[]> => {
                return await db
                    .select()
                    .from(schema.history)
                    .orderBy(desc(schema.history.day))
                    .limit(days)
                    .all();
            },

            new: async (
                day: number,
                time: number,
                seeds: Record<string, number>,
            ) => {
                await db.insert(schema.history).values({
                    day,
                    time,
                    seeds,
                });
            },
            archive: async (): Promise<schema.History[]> => {
                return await db
                    .select()
                    .from(schema.history)
                    .orderBy(desc(schema.history.day))
                    .limit(-1)
                    .offset(1)
                    .all();
            },
        },
    };
    return sql;
}
