interface Item {
    name: string,
    parent: string,
    pvs: Record<string, PvMap>
}

interface PvMap {
    name: string,
    value: (string | string[]),
    hi_limit: number,
    lo_limit: number,
    subscribed: (boolean | boolean[])
}

export { PvMap, Item }