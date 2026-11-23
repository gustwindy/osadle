import Landing from "./pages/landing";
import "./global.css";
import { useEffect, useState } from "react";

import useHash from "./hooks/useHash";
import { useToday } from "./hooks/useToday";
import Credits from "./pages/credits";
import ErrorPage from "./pages/error";
import Archive from "./pages/archive";
import GuessSongDaily from "./pages/games/dailySong";
import LoadingFish from "./components/loadingFish";

export default function Main() {
    const hash = useHash();
    const today = useToday();
    const [isMobile, setMobile] = useState(
        document.body.clientWidth < document.body.clientHeight,
    );

    useEffect(() => {
        window.addEventListener("resize", () => {
            setMobile(document.body.clientWidth < document.body.clientHeight);
        });
    }, []);
    document.getElementById("root")?.classList.toggle("mobileUi", isMobile);

    const todayFor = (game: string) => {
        return today?.games.find((a) => {
            return a.id === game;
        });
    };

    const todays = {
        song: todayFor("song"),
    };

    const map = [
        { name: "home", hashes: ["", "#home"], element: <Landing /> },
        { name: "credits", hashes: ["#credits"], element: <Credits /> },
        {
            name: "song",
            hashes: ["#song"],
            element: (
                <>
                    {today && todays.song ? (
                        <GuessSongDaily
                            key={hash}
                            today={today}
                            dailySong={todays.song}
                        />
                    ) : (
                        <LoadingFish />
                    )}
                </>
            ),
        },
        {
            name: "archive",
            hashes: ["#archive"],
            element: <Archive />,
        },
    ];
    const page = map.find((a) => a.hashes.includes(hash));
    const shown = page ?? {
        name: "error",
        hashes: [],
        element: <ErrorPage />,
    };

    document.body.id = shown.name;

    return <>{shown.element}</>;
}
