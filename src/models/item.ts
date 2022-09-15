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

interface Outlet {
    name: string,
    status: number
}

export { PvMap, Item, Outlet }