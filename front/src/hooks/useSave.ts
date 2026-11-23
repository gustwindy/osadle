import { useState } from "react";

export type Save = {
    lastDay: number;
    games: Map<string, GenericGame>;
    archives: Map<string, Map<number, GenericArchive>>;
};

export type GenericGame = {
    guesses: [];
    streak?: number;
    startTime?: number;
};

export type GenericArchive = {
    guessCount: number;
    succeeded: boolean;
};

function get(): Save {
    const raw = JSON.parse(localStorage.getItem("osadle") ?? "{}");

    const deserializedArchive = new Map(
        Object.entries(raw.archives ?? {}).map(([game, days]) => [
            game,
            new Map<number, GenericArchive>(
                Object.entries(days as Record<string, GenericArchive>).map(
                    ([day, genericArchive]) => [Number(day), genericArchive],
                ),
            ),
        ]),
    );

    return {
        lastDay: raw.lastDay ?? 0,
        games: new Map(Object.entries(raw.games ?? {})),
        archives: deserializedArchive,
    };
}

export function useSave(day?: number) {
    const [save, _] = useState<Save>(get());

    if (day && save.lastDay !== day) {
        save.lastDay = day;
        save.games.forEach((v, idx) => {
            v.guesses = [];
            v.startTime = undefined;

            save.games.set(idx, v); // i don't think you need to do this but just in case
        });
    }

    setSave(save);
    return save;
}

export function useGame(game: string, day?: number) {
    const save = useSave(day);

    save.games.set(
        game,
        save.games.get(game) ?? {
            guesses: [],
            streak: 0,
            startTime: undefined,
        },
    );

    setSave(save);
    return save.games.get(game);
}

export function useArchiveSave(game: string) {
    const save = useSave();

    save.archives.set(game, save.archives.get(game) ?? new Map());

    setSave(save);
    return save.archives.get(game);
}

export function setSave(save: Save) {
    const archives = Object.fromEntries(
        Array.from(save.archives).map(([game, archiveData]) => {
            return [game, Object.fromEntries(archiveData)];
        }),
    );
    localStorage.setItem(
        "osadle",
        JSON.stringify({
            ...save,
            games: Object.fromEntries(save.archives),
            archives: archives,
        }),
    );
}

export function modifySave(name: string, game: GenericGame) {
    const save = get();

    save.games.set(name, game);
    console.log(save);

    setSave(save);
}

export function modifyArchiveSave(
    game: string,
    archive: Map<number, GenericArchive>,
) {
    const save = get();
    save.archives.set(game, archive);
    setSave(save);
}
