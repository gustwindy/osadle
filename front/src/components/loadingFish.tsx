import "./loadingFish.css";

type LoadingFishProps = {
    viewportWidth?: number;
};
export default function LoadingFish({ viewportWidth = 25 }: LoadingFishProps) {
    return (
        <div
            className="loading-fish"
            style={{
                width: `${viewportWidth}vw`,
                height: `${viewportWidth * 0.695}vw`,
            }}
        />
    );
}
