import { writable } from "svelte/store";

export const sync_time = writable(new Date());
export const sync_paused = writable(false);
export const sync_time_origin_UAR = writable(null);
