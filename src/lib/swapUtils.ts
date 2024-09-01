import { settingsStore } from '../stores/settings';
import axios from 'axios';

interface SwapParams {
	mintAddress?: string;
	tokenAddress?: string;
	outputMint?: string;
	swapArg: string;
	amount?: number;
	slippage?: number;
	customFee?: number;
}

const getSwapOption = (swapArg: string): string => {
	return !swapArg || swapArg === '' ? 'buy' : swapArg;
};

const getSettingsFromStore = async (): Promise<{
	privateKey: string;
	amount: number;
	slippage: number;
	publicKey: string;
	customFee: number;
}> => {
	return new Promise((resolve) => {
		settingsStore.subscribe(($settings) => {
			resolve({
				privateKey: $settings.privateKey,
				amount: $settings.quoteAmount,
				slippage: $settings.slippage,
				publicKey: $settings.publicKey,
				customFee: $settings.customFee
			});
		});
	});
};

const createSwapObject = (
	params: SwapParams,
	settings: {
		privateKey: string;
		amount: number;
		slippage: number;
		publicKey: string;
		customFee: number;
	}
) => {
	return {
		option: getSwapOption(params.swapArg),
		privateKey: settings.privateKey,
		splMint: params.mintAddress || params.tokenAddress,
		outputMint: params.outputMint,
		amount: params.amount || settings.amount,
		microlamports: params.customFee || settings.customFee,
		slippageBps: params.slippage || settings.slippage,
		userPubKey: settings.publicKey
	};
};

const executeSwap = async (swapObj: any) => {
	console.log(swapObj, 'swap obj before sending');

	try {
		const response = await axios.post(
			'https://moonshot-txns-processor-public.up.railway.app/processor/transaction',
			swapObj
		);

		if (!response) return null;
		console.log(response, 'swap response');
		return response.data;
	} catch (err) {
		console.log(err);
		throw new Error('Something went wrong...');
	}
};

export const handleSwap = async ({ mintAddress, swapArg, amount, slippage }: SwapParams) => {
	const settings = await getSettingsFromStore();

	if (!settings.privateKey || !settings.amount || !settings.slippage || !settings.publicKey) {
		console.error('Settings not loaded');
		return;
	}

	const swapObj = createSwapObject({ mintAddress, swapArg, amount, slippage }, settings);
	return executeSwap(swapObj);
};

export const handleUserSwap = async ({
	tokenAddress,
	outputMint,
	swapArg,
	amount,
	slippage,
	customFee
}: SwapParams) => {
	if (!amount || !slippage) {
		console.error('Amount and slippage are required for user swap');
		return;
	}

	const settings = await getSettingsFromStore();

	if (!settings.privateKey || !settings.publicKey) {
		console.error('Private key or public key not loaded');
		return;
	}

	const swapObj = createSwapObject(
		{ tokenAddress, outputMint, swapArg, amount, slippage, customFee },
		settings
	);
	return executeSwap(swapObj);
};
