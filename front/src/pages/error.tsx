import { Link } from "wouter";
import "./error.css";

export default function ErrorPage() {
    return (
        <main id="error">
            <div className="bg">
                <span id="osage" />
            </div>
            <div id="msg">
                <h1>not found</h1>
                <p>
                    this page you were looking for does not exist.
                    <br />
                    <span className="disabled">
                        not even osage can find it. see !! look !!
                    </span>
                </p>
                <br />
                <Link href="/">go home?</Link>
            </div>
        </main>
    );
}
