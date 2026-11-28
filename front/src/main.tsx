import Landing from "./pages/landing";
import "./global.css";
import { useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import { useToday } from "./hooks/useToday";
import Credits from "./pages/credits";
import ErrorPage from "./pages/error";
import GuessSong from "./pages/games/song";

export default function Main() {
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

    return (
        <Switch>
            <Route path="/" component={Landing} />
            <Route path="song">
                {today && todays.song ? (
                    <GuessSong today={today} todaysGame={todays.song} />
                ) : (
                    <h1>loading</h1>
                )}
            </Route>
            <Route path="credits" component={Credits} />
            <Route component={ErrorPage} />
        </Switch>
    );
}
