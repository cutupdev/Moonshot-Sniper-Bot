import { writable } from 'svelte/store';

export interface NewMoonShotToken {
	name: string;
	symbol: string;
	metadata_uri: string;
	image: string;
	address: string;
	mint_authority: string;
	freeze_authority: string;
	current_supply: number;
	decimals: number;
	timestamp?: string;
}

export const newMoonShotTokensArr = writable<NewMoonShotToken[]>([]);

export const addTokenToArr = (newToken: NewMoonShotToken) => {
	newMoonShotTokensArr.update((arr) => {
		const updatedArr = [newToken, ...arr];
		localStorage.setItem('newMoonShotTokens', JSON.stringify(updatedArr));
		return updatedArr;
	});
	console.log(newMoonShotTokensArr, 'Array updated');
};

export const loadTokensFromLocalStorage = () => {
	const storedTokens = localStorage.getItem('newMoonShotTokens');
	if (storedTokens) {
		newMoonShotTokensArr.set(JSON.parse(storedTokens));
	}
};

export const clearTokens = () => {
	newMoonShotTokensArr.set([]);
	localStorage.removeItem('newMoonShotTokens');
};
