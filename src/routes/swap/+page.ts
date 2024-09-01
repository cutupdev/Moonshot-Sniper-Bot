import { settingsStore } from '../../stores/settings';

let allAssetsData = [] as any;
let userPublicKey = '';
let shyftApiKey = '';

const getUserPublicKey = async () => {
	return new Promise<void>((resolve) => {
		settingsStore.subscribe(($settings) => {
			userPublicKey = $settings.publicKey;
			shyftApiKey = $settings.shyftApiKey;
			resolve();
		});
	});
};

const getAssetsByOwner = async (publicKey: string, fetch: typeof window.fetch) => {
	if (!publicKey || !shyftApiKey) {
		console.error('Missing public key or Shyft API key');
		return;
	}

	const response = await fetch(
		`https://api.shyft.to/sol/v1/wallet/all_tokens?network=mainnet-beta&wallet=${publicKey}`,
		{
			method: 'GET',
			headers: {
				'x-api-key': shyftApiKey
			},
			redirect: 'follow'
		}
	);

	if (!response) return;
	const data = await response.json();
	console.log(data, 'data from shyft about assets');
	allAssetsData = data;
};

export const load = async ({ fetch }) => {
	await getUserPublicKey();
	await getAssetsByOwner(userPublicKey, fetch);
	return {
		allAssetsData
	};
};
