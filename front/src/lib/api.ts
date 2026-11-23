import type { OsadleGameConfig } from "../../../shared/game.ts";
import type { Archive } from "../../../shared/archive.ts";

const BASE_API = "/api/";

function uri(endpoint: string) {
    return new URL(`${BASE_API}${endpoint}`, location.toString()).toString();
}

// biome-ignore lint/suspicious/noExplicitAny: json
async function post(endpoint: string, body: any) {
    const req = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });

    if (!req.ok) alert(await req.text());

    return req.json();
}

async function get(endpoint: string) {
    const req = await fetch(endpoint);

    if (!req.ok) alert(await req.text());

    return req.json();
}

export const api = {
    songs: {
        upload: async (id: string, name: string, thumb: File, audio: File) => {
            const form = new FormData();
            form.append("id", id);
            form.append("name", name);
            form.append("thumb", thumb);
            form.append("audio", audio);

            const req = await fetch(uri("admin/songs/upload"), {
                method: "POST",
                body: form,
            });
            if (!req.ok) alert(await req.text());
        },
        delete: async (id: string) => {
            await post(uri("admin/songs/delete"), {
                id,
            });
        },
        aliases: async (id: string, add: string, remove: string) => {
            await post(uri("admin/songs/aliases"), {
                id,
                add: add.length > 1 ? [add] : [],
                remove: remove.length > 1 ? [remove] : [],
            });
        },
        list: async () => {
            return await get(uri("admin/songs/list"));
        },
    },
    today: async () => {
        return (await get(uri("today"))).content as Today;
    },
    games: async () => (await get(uri("games"))).content as OsadleGameConfig[],
    archive: async () => (await get(uri("archive"))).content as Archive,
};

export type OsadleGame = {
    id: string;
    seed: number;
    game: OsadleGameConfig;
};

export type Today = {
    day: number;
    time: number;
    games: OsadleGame[];
};
