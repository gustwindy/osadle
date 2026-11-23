import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Archive } from "../../../shared/archive";

export function useArchive() {
    const [archive, setArchive] = useState<Archive>();
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (fetched) return;
        setFetched(true);
        api.archive().then(setArchive);
    });

    return archive;
}
