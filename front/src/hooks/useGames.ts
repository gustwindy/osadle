import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { OsadleGameConfig } from "../../../shared/game";

export function useGames() {
    const [games, setGames] = useState<OsadleGameConfig[]>();
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (fetched) return;
        setFetched(true);
        api.games().then(setGames);
    });

    return games;
}

export type Song = {
    id: string;
    name: string;
    aliases: string[];
    image: string;
    audio?: string;
};

export function useSongs() {
    const games = useGames();
    return games?.find((game) => game.id === "song")?.data.songs as Song[];
}
