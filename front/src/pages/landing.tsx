import "./landing.css";

export default function Landing() {
    return (
        <>
            <div id="top">
                <span id="wip" />
                <span id="title">
                    <span id="logo" />
                    <span id="subtitle">guess inabakumori things daily!</span>
                </span>
            </div>
            <div id="bottom">
                <div id="left">
                    <div className="box" id="options">
                        <span className="cloud1" />
                        <span className="cloud2" />

                        <h1 id="pagesTitle">pages</h1>

                        <div id="buttons">
                            <a href="#song">Daily Song</a>
                            <span className="disabled">
                                More gamemodes soon...
                            </span>
                            <br></br>
                            <a href="#archive">Daily Archive</a>
                            <br />
                            <a href="#credits">Credits</a>
                        </div>
                    </div>
                    <div id="discordPlug">
                        <button
                            type="button"
                            className="icon"
                            onClick={() => {
                                window.open("https://guhw.dev/discord");
                            }}
                        />
                        <span>support/feedback discord server</span>
                    </div>
                </div>
                <div id="right">
                    <span id="randomOsage" />
                </div>
            </div>
        </>
    );
}
