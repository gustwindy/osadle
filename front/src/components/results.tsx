import type { JSX } from "react/jsx-runtime";
import "./results.css";
import { Link } from "wouter";

export function Results({
    title,
    correctAnswer,
    attempts,
    maxAttempts: max,
    copyable,
    isCorrect,
    extraCopy = "",
    keepPlayingCallback,
    children,
}: {
    title: string;
    correctAnswer: string;
    attempts: number;
    maxAttempts?: number;
    isCorrect: boolean;

    copyable: boolean;
    extraCopy?: string;
    keepPlayingCallback?: () => void;
    children?: JSX.Element[];
}) {
    return (
        <div className="darken">
            <div className="results">
                <span className="cloud1" />
                <span className="cloud2" />
                <h1 id="resultsTitle">{title}</h1>
                <span>
                    Answer: <span className="spoiler">{correctAnswer}</span>
                </span>
                <span>
                    Attempts: {isCorrect ? attempts : "X"}
                    {max ? `/${max}` : ""}
                </span>

                {isCorrect ? undefined : (
                    <span className="disabled">holy larps btw</span>
                )}
                {children}
                <div id="resultsButtons">
                    {copyable ? (
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `**${title}**: ${"⬛".repeat(attempts - 1)}${isCorrect ? "🩶" : "💥"} (${isCorrect ? attempts : "X"}/5)${extraCopy ? `\n${extraCopy}` : ""}\n> #osadle https://osadle.guhw.dev/`,
                                );
                                alert("copied");
                            }}
                        >
                            copy as text
                        </button>
                    ) : (
                        ""
                    )}
                    {keepPlayingCallback ? (
                        <button type="button" onClick={keepPlayingCallback}>
                            keep playing?
                        </button>
                    ) : null}
                    <Link href="/">other modes</Link>
                </div>
            </div>
        </div>
    );
}
