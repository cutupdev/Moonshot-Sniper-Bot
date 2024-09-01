<script lang="ts">
	import { handleUserSwap } from '$lib/swapUtils';
	import { settingsStore } from './../../stores/settings';
	import { onMount } from 'svelte';
	import { Select, Button, Input, Label, Helper, Spinner } from 'flowbite-svelte';
	import SuccessAlert from '../../components/Alerts/SuccessAlert.svelte';
	import ErrorAlert from '../../components/Alerts/ErrorAlert.svelte';

	export let data;

	export const allAssetsData: any = null;

	let successMessage = '';
	let showSuccessAlert = false;

	let errorMessage = '';
	let showErrorAlert = false;

	let isTransactionInProgress = false;

	$: if (showSuccessAlert) {
		setTimeout(() => {
			showSuccessAlert = false;
			successMessage = '';
		}, 3000);
	}

	$: if (showErrorAlert) {
		setTimeout(() => {
			showErrorAlert = false;
			errorMessage = '';
		}, 3000);
	}

	let selectSwapOption = 'sell';

	let possibleInputMints = [] as any;

	let userPublicKey = '';

	const getUserPublicKey = async () => {
		return new Promise<void>((resolve) => {
			settingsStore.subscribe(($settings) => {
				userPublicKey = $settings.publicKey || '';
				resolve();
			});
		});
	};

	$: if (userPublicKey) console.log(userPublicKey, 'public key found');

	let inputMint = '';
	let outputMint = 'So11111111111111111111111111111111111111112';

	let amount = 0;
	let decimalPlaces = 9;
	let amountInInteger = 0;

	$: amountInInteger = Math.floor(amount * Math.pow(10, decimalPlaces));

	$: if (amountInInteger) console.log(amountInInteger, 'formatted amount');

	let slippage = 5;

	$: slippageBps = Math.round(slippage * 100);

	$: if (slippageBps) console.log(slippageBps, 'slippage in basis points');

	$: filteredOutputMints = [{ name: 'SOL', value: 'So11111111111111111111111111111111111111112' }];

	$: if (outputMint && outputMint === inputMint) {
		outputMint = 'So11111111111111111111111111111111111111112';
	}

	$: if (inputMint !== '' && outputMint !== '') {
		console.log(inputMint, outputMint, 'both mints');
	}

	$: if (inputMint !== '') {
		const selectedAsset = possibleInputMints.find((asset: any) => asset.value === inputMint);
		if (selectedAsset) {
			amount = selectedAsset.balance;
		}
	}

	let customFee = '0.00001';
	let customFeeError = false;

	function handleCustomFeeInput(event: Event) {
		const input = event.target as HTMLInputElement;
		customFee = input.value.replace(/[^0-9.]/g, '');
		validateCustomFee();
	}

	function handleCustomFeeBlur() {
		let newValue = parseFloat(customFee);
		if (isNaN(newValue) || newValue < 0.00001) {
			customFee = '0.00001';
		} else if (customFee.split('.')[1]?.length > 9) {
			customFee = newValue.toFixed(9);
		}
		validateCustomFee();
	}

	function validateCustomFee() {
		customFeeError = isNaN(parseFloat(customFee)) || parseFloat(customFee) < 0;
	}

	const handleSwapTxns = async (selectedSwapOption: string) => {
		isTransactionInProgress = true;
		try {
			const swapResponse = await handleUserSwap({
				tokenAddress: inputMint,
				outputMint: outputMint,
				swapArg: selectSwapOption,
				amount: amount,
				slippage: slippageBps,
				customFee: parseFloat(customFee) * 1_000_000_000 // Convert SOL to lamports
			});

			if (!swapResponse) {
				throw new Error('No response from swap');
			}

			console.log(swapResponse, 'swap response');

			if (swapResponse.status === 'success') {
				successMessage = 'Tokens swapped successfully';
				showSuccessAlert = true;
			} else if (swapResponse.status === 'failed') {
				errorMessage = 'Failed to swap tokens. Please try again.';
				showErrorAlert = true;
			} else {
				errorMessage = 'Unexpected response from server. Please try again.';
				showErrorAlert = true;
			}
		} catch (err) {
			console.error(err);
			errorMessage = 'Failed to swap tokens. Please try again.';
			showErrorAlert = true;
		} finally {
			isTransactionInProgress = false;
		}
	};

	const setAmountPercentage = (percentage: number) => {
		const selectedAsset = possibleInputMints.find((asset: any) => asset.value === inputMint);
		if (selectedAsset) {
			amount = (selectedAsset.balance * percentage) / 100;
		}
	};

	onMount(() => {
		if (data && data.allAssetsData && data.allAssetsData.result !== undefined) {
			getUserPublicKey();

			possibleInputMints = data.allAssetsData.result

				.filter((asset: any) => asset.balance > 0)
				.map((asset: any) => {
					return {
						image: asset.info.image || '',
						name: asset.info.name || '',
						symbol: asset.info.symbol || '',
						value: asset.address || '',
						balance: asset.balance || 0
					};
				});
		}
	});
</script>

<SuccessAlert {successMessage} {showSuccessAlert} />

<ErrorAlert {errorMessage} {showErrorAlert} />

<div class="flex flex-col items-center justify-center p-24 overflow-hidden">
	<div class="flex flex-col mb-4 text-2xl font-bold text-center font-orbitron text-text">
		<h1>Sell your tokens for SOL</h1>
	</div>

	<div class="w-80">
		<Label class="mb-2 font-orbitron text-text">Select token to sell</Label>
		<Select class="w-full my-2" items={possibleInputMints} bind:value={inputMint} />
	</div>

	<div class="w-80">
		<Label class="mb-2 font-orbitron text-text">To</Label>
		<Input type="text" value="SOL" disabled class="w-full my-2" />
	</div>

	<div class="my-2 w-80">
		<Label for="amount_to_swap" class="mb-2 font-orbitron text-text">Amount</Label>
		<Input
			type="number"
			id="amount_to_swap"
			placeholder="Amount to swap"
			bind:value={amount}
			required
			class="w-full"
		/>
	</div>

	<div class="grid grid-cols-4 gap-2 my-2 w-80">
		<Button on:click={() => setAmountPercentage(25)} shadow color="light" class="p-2 text-text"
			>25%</Button
		>
		<Button on:click={() => setAmountPercentage(50)} shadow color="light" class="p-2 text-text"
			>50%</Button
		>
		<Button on:click={() => setAmountPercentage(75)} shadow color="light" class="p-2 text-text"
			>75%</Button
		>
		<Button on:click={() => setAmountPercentage(100)} shadow color="light" class="p-2 text-text"
			>100%</Button
		>
	</div>

	<div class="my-2 w-80">
		<Label for="slippage" class="mb-2 font-orbitron text-text">Slippage %</Label>
		<Input
			type="number"
			id="slippage"
			placeholder="Slippage %"
			bind:value={slippage}
			required
			class="w-full"
		/>
	</div>

	<div class="my-2 w-80">
		<Label for="customFee" class="mb-2 font-orbitron text-text">Custom Fee (SOL)</Label>
		<Input
			type="number"
			id="customFee"
			placeholder="Custom Fee"
			bind:value={customFee}
			on:input={handleCustomFeeInput}
			on:blur={handleCustomFeeBlur}
			step="0.00001"
			required
			class="w-full"
		/>
		{#if customFeeError}
			<Helper class="text-red-500">Custom Fee must be a positive number</Helper>
		{/if}
	</div>

	<div class="mt-6 w-80">
		<Button
			color="light"
			shadow
			class="w-full text-white bg-primary hover:bg-accent"
			size="md"
			on:click={() => handleSwapTxns(selectSwapOption)}
			disabled={isTransactionInProgress}
		>
			{#if isTransactionInProgress}
				<Spinner class="me-3" size="4" color="white" />
				Processing...
			{:else}
				Sell tokens for SOL
			{/if}
		</Button>
	</div>
</div>
