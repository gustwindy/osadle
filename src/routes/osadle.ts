import type { RouterType } from "itty-router";

import { InitDb } from "../db/sql.ts";
import getGames from "../games/index.ts";
import { response, serverFault } from "../lib/responses.ts";
import { env } from "cloudflare:workers";

const sql = InitDb(env.osadle);

export function routes(app: RouterType) {
    app.get("/api/today/", async (_request) => {
        const games = await getGames();

        const last = await sql.history.last();
        if (!last) return serverFault("nothing today");

        return response({
            _: "you know what you're doing, don't you? don't do it !!",
            day: last.day,
            time: last.time,
            games: Object.entries(last.seeds).map(([game, seed]) => {
                return {
                    id: game,
                    seed,
                    game: games.find((v) => {
                        return game === v.id;
                    }),
                };
            }),
        });
    });

    app.get("/api/games/", async (_request) => {
        const games = await getGames();

        return response(games);
    });

    app.get("/api/archive/", async (_request) => {
        const archive = await sql.history.archive();

        return response({
            archive: archive,
        });
    });
}
