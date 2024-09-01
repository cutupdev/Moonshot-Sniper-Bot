import * as web3 from '@solana/web3.js';
import type { Idl } from '@project-serum/anchor';
import { SolanaParser } from '@debridge-finance/solana-transaction-parser';
import * as idl from './moonshotIDL.json';
import { ShyftSdk, Network } from '@shyft-to/js';
import { Buffer } from 'buffer';
import { settingsStore, autoSnipeStore } from '../stores/settings';
import { handleSwap } from '$lib/swapUtils';
import { writable } from 'svelte/store';

globalThis.Buffer = Buffer;

import { io } from 'socket.io-client';

import { addTokenToArr } from '../stores/token-store';

const socket = io('http://localhost:5173');

socket.on('newMoonshotToken', (message) => {
	console.log(message, 'New Moonshot Token');
});

let runListener = false;
let connectionId: number;
let shyftApiKey = '';
let autoSnipe = false;

// Subscribe to the settings store to get the shyftApiKey and autoSnipe state
settingsStore.subscribe((settings) => {
	shyftApiKey = settings.shyftApiKey;
});

autoSnipeStore.subscribe((value) => {
	autoSnipe = value;
	console.log('Auto-snipe status changed:', autoSnipe);
});

type AccountInfo = {
	name: string;
	pubKey: string;
};

type Instruction = {
	name: string;
	txnId: string;
};

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

const rpcConnection = new web3.Connection(`https://rpc.shyft.to?api_key=${shyftApiKey}`);

const shyft = new ShyftSdk({
	apiKey: shyftApiKey,
	network: Network.Mainnet
});

export const foundTokensArray: NewMoonShotToken[] = [];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const findInitialPooledSol = async (mintAddress: string) => {
	try {
		await sleep(5000);

		const balance = await shyft.wallet.getBalance({ wallet: mintAddress });
		console.log(balance, 'Found SOL value');

		return balance;
	} catch (error) {
		console.log('Error: ', error);
	}
};

const getTokenInfoFromShyft = async (mintAddress: string, signature: string) => {
	try {
		await sleep(2000);

		// Extract the timestamp using the provided signature
		const foundTimestamp = await extractTimestamp(signature);

		// Get the token information
		const tokenInfo = await shyft.token.getInfo({
			network: Network.Mainnet,
			tokenAddress: mintAddress
		});

		// Add the timestamp to the token info
		const tokenWithTimestamp: NewMoonShotToken = {
			...tokenInfo,
			timestamp: foundTimestamp || '' // Add the timestamp here
		};

		// Push the updated token info to the array
		foundTokensArray.push(tokenWithTimestamp);

		// Add the token to the array (if necessary)
		addTokenToArr(tokenWithTimestamp);

		console.log(tokenWithTimestamp, 'token found');

		// Emit the updated token information
		socket.emit('client emitting new moonshot token', tokenWithTimestamp);

		console.log(foundTokensArray, 'foundTokensArray');

		return foundTokensArray;
	} catch (error) {
		console.log('Error: ', error);
	}
};

const fetchDexScreenerData = async (mintAddress: string) => {
	try {
		let isWaiting = true;

		await sleep(30000);

		isWaiting = false;

		if (!isWaiting) {
			const response = await fetch(`https://api.moonshot.cc/token/v1/solana/${mintAddress}`);
			const data = await response.json();
			console.log('Fetched Data: ', data);

			return data;
		}
	} catch (fetchError) {
		console.log('Error fetching data: ', fetchError);
	}
};

const handleMint = async (
	signature: string,
	splMintAddress: string,
	curveAddress: string,
	mintMetadata: string
) => {
	try {
		if (autoSnipe) {
			handleSwap({ mintAddress: splMintAddress, swapArg: 'buy' }).catch((error) => {
				console.error('Error during auto-snipe:', error);
			});
		}

		// Always process token data regardless of autoSnipe
		Promise.all([
			getTokenInfoFromShyft(splMintAddress, signature),
			findInitialPooledSol(curveAddress),
			fetchDexScreenerData(splMintAddress)
		]).catch((error) => {
			console.error('Error processing token data:', error);
		});
	} catch (error) {
		console.log('Error: ', error);
	}
};

const extractTimestamp = async (signature: string): Promise<string | undefined> => {
	try {
		if (!signature) return;

		console.log('TEST1', signature);

		const txnData = await shyft.transaction.parsed({
			txnSignature: signature
		});

		if (!txnData) return;

		console.log('TEST2 - DATA', txnData);

		const timestamp = txnData?.timestamp;
		return timestamp;
	} catch (err) {
		console.log(err);
		return undefined;
	}
};

export const isListenerRunning = writable(false); // Create the store

export const startListener = async () => {
	try {
		const publicKey = new web3.PublicKey('MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG');
		const solanaConnection = new web3.Connection(`https://rpc.shyft.to?api_key=${shyftApiKey}`, {
			wsEndpoint: `wss://rpc.shyft.to?api_key=${shyftApiKey}`
		});

		runListener = true;
		isListenerRunning.set(true); // Set the store to true
		console.log('listener started');

		connectionId = solanaConnection.onLogs(
			publicKey,
			async (logs, context) => {
				if (!runListener) {
					console.log('Listener stopped.');
					solanaConnection.removeOnLogsListener(connectionId);
					return;
				}

				if (logs.signature) {
					await sleep(2000);

					const extractedSignature = logs.signature;

					const txParser = new SolanaParser([
						{
							idl: idl as unknown as Idl,
							programId: 'MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG'
						}
					]);

					if (!txParser) {
						return;
					}

					const parsed = await txParser.parseTransaction(rpcConnection, extractedSignature, false);

					if (!parsed) {
						console.log('Parsed transaction is null or empty');
						return;
					}

					const accountsArr: AccountInfo[] = [];

					parsed.forEach((element) => {
						if (element.accounts && element.accounts.length > 0) {
							element.accounts.forEach((account) => {
								accountsArr.push({
									name: account.name || 'Unknown',
									pubKey: account.pubkey ? account.pubkey.toBase58() : 'Unknown'
								});
							});
						}

						const mintInstructionArr: Instruction[] = [];
						let isMintInstructionFound = false;

						if (element.name && element.name !== undefined) {
							console.log('Instruction: ', element.name);
							console.log('Extracted signature: ', extractedSignature);

							if (
								element.name === 'tokenMint' ||
								element.name === 'mint' ||
								element.name === 'initialize2' ||
								element.name === 'initialize' ||
								element.name === 'configInit'
							) {
								mintInstructionArr.push({
									name: element.name || 'Unknown',
									txnId: extractedSignature
								});

								isMintInstructionFound = true;
							}

							if (isMintInstructionFound) {
								console.log('Mint Instruction: ', mintInstructionArr);
								console.log('Extracted mint signature: ', extractedSignature);

								let splMintAddress = ''; // Mint

								let curveAddress = ''; // PDA

								let mintMetadata = ''; // Mint Metadata

								let mplTokenMetadata = ''; // MPL Token Metadata

								accountsArr.forEach((account) => {
									if (account.name === 'mint') {
										splMintAddress = account.pubKey;
									}

									if (account.name === 'curveAccount') {
										curveAddress = account.pubKey;
									}

									if (account.name === 'mintMetadata') {
										mintMetadata = account.pubKey;
									}

									if (account.name === 'mplTokenMetadata') {
										mplTokenMetadata = account.pubKey;
									}
								});

								if (splMintAddress && curveAddress && mintMetadata && mplTokenMetadata) {
									const dataToLog = {
										mint: splMintAddress,
										pda: curveAddress,
										metadataMint: mintMetadata,
										mplMetadata: mplTokenMetadata
									};

									console.log(dataToLog);

									// Always handle mint regardless of autoSnipe state
									handleMint(extractedSignature, splMintAddress, curveAddress, mplTokenMetadata);
								}
							}
						}
					});
				}
			},
			'confirmed'
		);
	} catch (error) {
		console.log(error);
		isListenerRunning.set(false); // Set the store to false if an error occurs
	}
};

export async function stopListener() {
	runListener = false;
	isListenerRunning.set(false); // Set the store to false
	console.log('Listener stopped.');
}
