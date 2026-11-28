import type { OsadleGameConfig } from "../../shared/game.ts";
import { InitDb } from "../db/sql.ts";
import { env } from "cloudflare:workers";

export default async function SongGame(): Promise<OsadleGameConfig> {
    const songs = await InitDb(env.osadle).songs.list();

    const imgBase = new URL(
        env.LOCAL_DEV ? "thumbnails/" : "/storage/v1/object/public/thumbnails/",
        env.S3_ENDPOINT,
    );
    const audioBase = new URL(
        env.LOCAL_DEV ? "music/" : "/storage/v1/object/public/music/",
        env.S3_ENDPOINT,
    );

    return {
        id: "song",
        randomizer: {
            startPercent: {
                type: "range",
                decimals: false,
                min: 5,
                max: 90,
            },
            songId: {
                type: "list",
                options: songs.map((v) => {
                    return v.songId;
                }),
                avoidRepeats: true,
            },
        },
        data: {
            songs: songs.map((a) => {
                return {
                    id: a.songId,
                    name: a.commonName,
                    aliases: a.aliases,
                    image: new URL(a.imageHash, imgBase),
                    audio: new URL(a.audioHash, audioBase),
                };
            }),
        },
    };
}
