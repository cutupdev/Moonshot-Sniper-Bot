import { writable, derived } from 'svelte/store';

export interface Settings {
	autoSnipe: boolean;
	shyftApiKey: string;
	quoteAmount: number;
	publicKey: string;
	privateKey: string;
	slippage: number; // Stored in basis points
	customFee: number; // Stored in lamports
}

const defaultSettings: Settings = {
	autoSnipe: false,
	shyftApiKey: '',
	quoteAmount: 0.005,
	publicKey: '',
	privateKey: '',
	slippage: 500, // 5% in basis points
	customFee: 0.00005 // Default to 0 lamports
};

function createSettingsStore() {
	const { subscribe, set, update } = writable<Settings>(loadSettings());

	return {
		subscribe,
		update: (newSettings: Partial<Settings>) => {
			update((currentSettings) => {
				const updatedSettings = { ...currentSettings, ...newSettings };
				saveSettings(updatedSettings);
				return updatedSettings;
			});
		},
		reset: () => {
			set(defaultSettings);
			saveSettings(defaultSettings);
		}
	};
}

export function saveSettings(settings: Settings) {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('moonshot_settings', JSON.stringify(settings));
	}
}

function loadSettings(): Settings {
	if (typeof localStorage !== 'undefined') {
		const savedSettings = localStorage.getItem('moonshot_settings');
		return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
	}
	return defaultSettings;
}

export const settingsStore = createSettingsStore();

export const updateSettingsStore = async (
	autoSnipeArgument: boolean,
	apiKey: string,
	minQuote: number,
	publicKey: string,
	privateKey: string,
	slippageBps: number,
	customFeeLamports: number
) => {
	settingsStore.update({
		autoSnipe: autoSnipeArgument,
		shyftApiKey: apiKey,
		quoteAmount: Number(minQuote),
		publicKey: publicKey,
		privateKey: privateKey,
		slippage: Number(slippageBps),
		customFee: Number(customFeeLamports)
	});
	saveSettings({
		autoSnipe: autoSnipeArgument,
		shyftApiKey: apiKey,
		quoteAmount: Number(minQuote),
		publicKey: publicKey,
		privateKey: privateKey,
		slippage: Number(slippageBps),
		customFee: Number(customFeeLamports)
	});
};

export const autoSnipeStore = derived(settingsStore, ($settings) => $settings.autoSnipe);
