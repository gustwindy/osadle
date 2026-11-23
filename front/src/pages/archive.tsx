import type { History } from "../../../shared/archive";
import LoadingFish from "../components/loadingFish";
import { useArchive } from "../hooks/useArchive";
import { type GenericArchive, useArchiveSave } from "../hooks/useSave";
import { attemptEmojis } from "../lib/utils";

import "./archive.css";

function ArchiveCard(
    { day, seeds, time }: History,
    archiveSave: GenericArchive | undefined,
) {
    return (
        <div className="archive-card">
            {Array.from(Object.entries(seeds)).map(([game, seed]) => (
                <div className="game-info" key={game}>
                    <button
                        className="title"
                        type="button"
                        onClick={() => console.log(game, seed)}
                    >
                        Daily {game} #{day}
                    </button>
                    <span className="attempts">
                        {archiveSave
                            ? attemptEmojis(
                                  archiveSave.guessCount,
                                  archiveSave.succeeded,
                              )
                            : "Unattempted"}
                    </span>
                </div>
            ))}
            <span className="date">{new Date(time).toDateString()}</span>
        </div>
    );
}

export default function Archive() {
    const archive = useArchive();
    const archiveSongSave = useArchiveSave("song");

    return (
        <>
            {archive && archiveSongSave ? (
                archive.archive.map((history) =>
                    ArchiveCard(history, archiveSongSave.get(history.day)),
                )
            ) : (
                <LoadingFish />
            )}
        </>
    );
}
