import { EMPTY_PVS } from "@/assets/constants";
export default interface Item {
    name: string,
    parent: string,
    pvs: typeof EMPTY_PVS
}