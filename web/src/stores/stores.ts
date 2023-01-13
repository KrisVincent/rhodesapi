import { writable } from 'svelte/store';

export const currentDropdownSelection = writable('/operator/');
export const api = writable('GET');
export const currResponse = writable({} as { [key: string]: any });
export const operatorName = writable('Surtr');