export type History = {
    day: number;
    time: number;
    seeds: Record<string, number>;
};

export type Archive = {
    archive: History[];
};
