import { writable } from 'svelte/store';

export const auto1111Images = writable<Array<string> | Promise<string[]>>([]);
