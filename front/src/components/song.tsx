import {
    createRef,
    type JSX,
    type RefObject,
    useEffect,
    useMemo,
    useState,
} from "react";
import useMobile from "../hooks/useMobile";
import "./song.css";
import { fromSeed } from "../../../shared/seed";
import { Results } from "./results";
import { SuggestionBox } from "./suggestionBox";
import { type GenericGame, modifySave } from "../hooks/useSave";
import type { OsadleGame } from "../lib/api";
import findAudio from "../lib/audio";
import { styleForImage } from "../lib/utils";
import { type Song, useSongs } from "../hooks/useGames";
import LoadingFish from "./loadingFish";

const GUESS_INTERVALS = [0.5, 1, 2, 5, 7];

type GuessCardProps = {
    guessCallback: () => void;
    inputCallback: (v: string) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    isNext: boolean;
    song?: Song;
    children?: JSX.Element;
};
function GuessCard({
    guessCallback,
    inputCallback,
    inputRef,
    isNext = false,
    song,
    children,
}: GuessCardProps) {
    return (
        <div className="card">
            <span className="thumb" style={styleForImage(song?.image)} />
            <div className="vert">
                {isNext ? (
                    <div id="guessBox">
                        {children}
                        <input
                            onChange={(ev) => {
                                inputCallback(ev.currentTarget.value);
                            }}
                            onKeyDown={(ev) => {
                                if (ev.key === "Enter") {
                                    guessCallback();
                                }
                            }}
                            ref={isNext ? inputRef : undefined}
                        />
                        <button
                            type="button"
                            id="guess"
                            onClick={guessCallback}
                        >
                            guess
                        </button>
                    </div>
                ) : (
                    <span className="songTitle">{song?.name ?? "?"}</span>
                )}
                <span className="time">
                    {isNext ? "type your guess above" : " "}
                </span>
            </div>
        </div>
    );
}

type GuessSongReturn = {
    element: JSX.Element;
    newGame: (
        osadleGame: OsadleGame,
        save?: GenericGame,
        newTitle?: string,
    ) => void;
};

type GuessSongProps = {
    osadleGame: OsadleGame;
    title?: string;
    initSave?: GenericGame;
    extraResultElements?: JSX.Element[];
    onGameFinish?: () => void;
};

export default function GuessSong({
    osadleGame,
    title: initTitle,
    initSave,
    extraResultElements,
}: GuessSongProps): GuessSongReturn {
    const isMobile = useMobile();
    const songs = useSongs();

    const [game, setGame] = useState(osadleGame);
    const seed = useMemo(() => game.seed, [game]);
    const [save, setSave] = useState<GenericGame | undefined | null>(initSave);
    const [guesses, setGuesses] = useState<string[]>(save?.guesses ?? []);
    const [title, setTitle] = useState<string>(initTitle ?? "");

    const gameData = useMemo(
        () =>
            fromSeed(seed, game.game.randomizer) as {
                songId: string;
                startPercent: number;
            },
        [seed, game.game.randomizer],
    );

    const [input, setInput] = useState("");
    const [topSong, setTop] = useState<Song>();
    const [playing, setPlaying] = useState<
        | {
              source: AudioBufferSourceNode;
              timeout: number;
          }
        | undefined
    >();

    const [volume, setVolume] = useState<number>(0.25);
    const [buffer, setBuffer] = useState<AudioBuffer | undefined>();
    const [audioStart, setStart] = useState<number>(0);
    const [context, _] = useState(new AudioContext());

    const isCorrect = guesses[guesses.length - 1] === gameData.songId;
    const isFinished = isCorrect || guesses.length >= GUESS_INTERVALS.length;

    const inputRef = createRef<HTMLInputElement>();

    const submit = () => {
        if (!topSong) return;
        if (isFinished) return;

        setInput("");
        setGuesses([...guesses, topSong.id]);

        if (!save) return;
        save.guesses = [...guesses, topSong.id] as string[] as [];
        modifySave("song", save);
    };
    const playButtonCallback = () => {
        if (!(audioStart && buffer)) return;
        if (playing) {
            playing.source.stop(0);
            clearTimeout(playing.timeout);
            setPlaying(undefined);
            return;
        }

        if (!isMobile) inputRef.current?.focus();

        const seconds =
            GUESS_INTERVALS[guesses.length] ??
            GUESS_INTERVALS[GUESS_INTERVALS.length - 1];

        const source = context.createBufferSource();
        source.buffer = buffer;

        const gain = context.createGain();
        gain.gain.value = 0.5 * volume;
        source.connect(gain);
        gain.connect(context.destination);

        setPlaying({
            source,
            timeout: setTimeout(() => {
                setPlaying(undefined);
            }, seconds * 1000),
        });
        source.start(0, audioStart);
        source.stop(context.currentTime + seconds);
    };
    useEffect(() => {
        if (!isMobile) inputRef.current?.focus();
    });
    useEffect(() => {
        const cb = (ev: KeyboardEvent) => {
            if (ev.key !== "Tab") return;
            playButtonCallback();
            ev.preventDefault();
        };
        addEventListener("keydown", cb);
        return () => removeEventListener("keydown", cb);
    });
    useEffect(() => {
        const correctSong = songs?.find((v) => {
            return v.id === gameData.songId;
        });
        findAudio(correctSong?.audio ?? "why", gameData.startPercent).then(
            (d) => {
                if (!d) return alert("no audio found for the given song??");
                setStart(d.start);
                setBuffer(d.buffer);
            },
        );
    }, [gameData, songs]);

    const newGame = (
        osadleGame: OsadleGame,
        save?: GenericGame | null,
        newTitle?: string,
    ) => {
        setGame(osadleGame);
        setGuesses([]);
        setBuffer(undefined);
        if (save !== undefined) setSave(save);
        if (newTitle) setTitle(newTitle);
    };

    return {
        element: (
            <>
                {songs ? (
                    <>
                        <h1>{title}</h1>
                        <div id="content">
                            <div id="big-card">
                                <div id="top">
                                    <button
                                        id="disc"
                                        type="button"
                                        className={playing ? "spinning" : ""}
                                        onClick={playButtonCallback}
                                    />
                                    <span id="stats">
                                        <span>
                                            Using{" "}
                                            {GUESS_INTERVALS[guesses.length]}sec
                                        </span>
                                        <span>{guesses.length}/5</span>
                                        <span>volume:</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            onChange={(ev) => {
                                                setVolume(
                                                    ev.currentTarget
                                                        .valueAsNumber / 100,
                                                );
                                            }}
                                            value={volume * 100}
                                        />
                                    </span>
                                    <button
                                        id="play"
                                        type="button"
                                        className={
                                            buffer
                                                ? playing
                                                    ? "playing"
                                                    : ""
                                                : "disabled"
                                        }
                                        onClick={playButtonCallback}
                                    />
                                </div>
                                <div id="bottom">
                                    {GUESS_INTERVALS.map((_, idx) => {
                                        return (
                                            <GuessCard
                                                // biome-ignore lint/suspicious/noArrayIndexKey: it's constant anyway
                                                key={idx}
                                                isNext={idx === guesses.length}
                                                guessCallback={submit}
                                                inputCallback={(value) => {
                                                    setInput(value);
                                                }}
                                                inputRef={inputRef}
                                                song={songs.find((v) => {
                                                    return (
                                                        v.id === guesses[idx]
                                                    );
                                                })}
                                            >
                                                <SuggestionBox
                                                    choices={songs}
                                                    setTopSuggestion={setTop}
                                                    current={input}
                                                />
                                            </GuessCard>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {isFinished ? (
                            <Results
                                title={title}
                                correctAnswer={
                                    songs.find((v) => {
                                        return v.id === gameData.songId; // i am literally the only one i can blame for needing to do this
                                    })?.name ?? "idk vro open ended question ig"
                                }
                                attempts={guesses.length}
                                maxAttempts={GUESS_INTERVALS.length}
                                copyable
                                isCorrect={isCorrect}
                                keepPlayingCallback={() => {
                                    if (!buffer)
                                        return alert(
                                            "wait for the song to load first sorry",
                                        );
                                    newGame(
                                        {
                                            id: "song",
                                            seed: Math.random() * 1000,
                                            game: game.game,
                                        },
                                        null,
                                        "custom osadle song",
                                    );
                                }}
                            >
                                {extraResultElements}
                            </Results>
                        ) : null}
                    </>
                ) : (
                    <LoadingFish />
                )}
            </>
        ),
        newGame: newGame,
    };
}
