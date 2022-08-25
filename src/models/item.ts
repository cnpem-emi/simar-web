import { EMPTY_PVS } from "@/assets/constants";
export default interface Item {
    name: string,
    parent: string,
    pvs: PvMap
}

interface PvMap {
    [index: string]: {
        name: string,
        value: (string|string[]),
        hi_limit: number,
        lo_limit: number,
        subscribed: (boolean|boolean[])
    }
}
