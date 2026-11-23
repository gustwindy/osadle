import type { JSX } from "react/jsx-runtime";
import { useGame } from "../../hooks/useSave";
import type { OsadleGame, Today } from "../../lib/api";
import GuessSong from "../../components/song";

type GuessSongDailyProps = {
    today: Today;
    dailySong: OsadleGame;
};

export default function GuessSongDaily({
    today,
    dailySong,
}: GuessSongDailyProps): JSX.Element {
    const { element } = GuessSong({
        osadleGame: dailySong,
        initSave: useGame("song", today.day),
        title: `osadle #${today.day}: song`,
    });
    return element;
}
