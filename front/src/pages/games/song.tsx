import {
    createRef,
    type JSX,
    type RefObject,
    useEffect,
    useMemo,
    useState,
} from "react";

import useMobile from "../../hooks/useMobile";
import "./song.css";

import { fromSeed } from "../../../../shared/seed";
import { Results } from "../../components/results";
import { SuggestionBox } from "../../components/suggestionBox";
import { modifySave, useGame } from "../../hooks/useSave";
import type { OsadleGame, Today } from "../../lib/api";
import findAudio from "../../lib/audio";
import { styleForImage } from "../../lib/utils";

const GUESS_INTERVALS = [0.5, 1, 2, 5, 7];

export type Song = {
    id: string;
    name: string;
    aliases: string[];
    image: string;
    audio?: string;
};

export default function GuessSong({
    today,
    todaysGame: daily,
}: {
    today: Today;
    todaysGame: OsadleGame;
}) {
    const isMobile = useMobile();
    const save = useGame("song", today.day);
    const [guesses, setGuesses] = useState<string[]>(save?.guesses ?? []);

    const [seed, setSeed] = useState(daily.seed);
    const gameData = useMemo(
        () =>
            fromSeed(seed, daily.game.randomizer) as {
                songId: string;
                startPercent: number;
            },
        [seed, daily.game.randomizer],
    );
    const songs = useMemo(() => {
        return daily.game.data.songs as Song[];
    }, [daily]);

    const [isCustom, setCustom] = useState<boolean>(false);

    const [input, setInput] = useState("");
    const [top, setTop] = useState<Song>();
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
        if (!top) return;
        if (isFinished) return;
        setInput("");
        if (isCustom) {
            setGuesses([...guesses, top.id]);
        } else {
            if (save) {
                save.guesses = [...guesses, top.id] as string[] as [];
                modifySave("song", save);
                setGuesses(save.guesses);
            }
        }
    };
    const playButtonCallback = () => {
        if (!(audioStart && buffer)) return;
        if (playing) {
            playing.source.stop(0);
            clearTimeout(playing.timeout);
            setPlaying(undefined);
            return;
        }

        if (!isMobile) {
            inputRef.current?.focus();
        }

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
        if (!isMobile) {
            inputRef.current?.focus();
        }
    });
    useEffect(() => {
        const cb = (ev: KeyboardEvent) => {
            if (ev.key === "Tab") {
                playButtonCallback();
                ev.preventDefault();
            }
        };
        addEventListener("keydown", cb);

        return () => {
            removeEventListener("keydown", cb);
        };
    });
    useEffect(() => {
        alert(
            "unfortunately, due to some miscalculations, this website will be down until around December.\n\nplease join the discord server (mail icon bottom left of homepage) for more information.\n\nTL;DR, windy poor windy haev no money catn payfor database",
        );
        const correctSong = songs.find((v) => {
            return v.id === gameData.songId;
        }) as Song;
        findAudio(correctSong.audio ?? "why", gameData.startPercent).then(
            (d) => {
                if (!d) return alert("error");
                setStart(d.start);

                setBuffer(d.buffer);
            },
        );
    }, [gameData, songs]);

    return songs ? (
        <main id="song">
            <div className="bg">
                <span id="osageLeft" />
                <span id="osageRight" />
            </div>
            <h1>
                {isCustom ? `custom osadle song` : `osadle #${today.day}: song`}
            </h1>
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
                                Using {GUESS_INTERVALS[guesses.length]}sec
                            </span>
                            <span>{guesses.length}/5</span>
                            <span>volume:</span>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                onChange={(ev) => {
                                    setVolume(
                                        ev.currentTarget.valueAsNumber / 100,
                                    );
                                }}
                                value={volume * 100}
                            />
                        </span>
                        <button
                            id="play"
                            type="button"
                            className={
                                buffer ? (playing ? "playing" : "") : "disabled"
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
                                        return v.id === guesses[idx];
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
                    title={
                        isCustom
                            ? "custom osadle song"
                            : `osadle song #${today.day}`
                    }
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
                        setCustom(true);
                        setGuesses([]);
                        setBuffer(undefined);
                        setSeed(Math.random() * 1000);
                    }}
                ></Results>
            ) : null}
        </main>
    ) : (
        <h1>loading</h1>
    );
}
function GuessCard({
    guessCallback,
    inputCallback,
    inputRef,
    isNext = false,
    song,
    children,
}: {
    guessCallback: () => void;
    inputCallback: (v: string) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    isNext?: boolean;
    song?: Song;
    children?: JSX.Element;
}) {
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
