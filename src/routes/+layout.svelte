<script lang="ts">
	import * as styles from '../styles/global.css';
	import Nav from './../components/Nav.svelte';
	import { Drawer, Input, Label, Helper, Toggle } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { settingsStore, updateSettingsStore } from '../stores/settings';

	let autoSnipe: boolean;
	let shyftApiKey: string;
	let quoteAmount: string;
	let publicKey: string;
	let privateKey: string;
	let slippage: string;
	let customFee: string;

	settingsStore.subscribe(($settings) => {
		autoSnipe = $settings.autoSnipe;
		shyftApiKey = $settings.shyftApiKey;
		quoteAmount = $settings.quoteAmount.toString();
		publicKey = $settings.publicKey;
		privateKey = $settings.privateKey;
		slippage = ($settings.slippage / 100).toString();
		customFee = ($settings.customFee / 1_000_000_000).toString();
	});

	onMount(() => {
		settingsStore.subscribe(() => {});
	});

	export let hidden1: boolean = true;

	export let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};

	let shyftApiKeyError = false;
	let slippageError = false;
	let customFeeError = false;

	$: shyftApiKeyError = shyftApiKey === '';
	$: slippageError = parseFloat(slippage) > 100;
	$: customFeeError = isNaN(parseFloat(customFee)) || parseFloat(customFee) < 0;

	function handleQuoteAmountInput(event: Event) {
		const input = event.target as HTMLInputElement;
		quoteAmount = input.value;
	}

	function handleQuoteAmountBlur() {
		const newValue = parseFloat(quoteAmount);
		if (isNaN(newValue) || newValue < 0.005) {
			quoteAmount = '0.005';
		} else {
			quoteAmount = newValue.toString();
		}
		updateSettingsStore(
			autoSnipe,
			shyftApiKey,
			parseFloat(quoteAmount),
			publicKey,
			privateKey,
			parseFloat(slippage) * 100,
			parseFloat(customFee) * 1_000_000_000
		);
	}

	function handleSlippageInput(event: Event) {
		const input = event.target as HTMLInputElement;
		let newValue = parseInt(input.value);

		if (!isNaN(newValue)) {
			if (newValue < 1) {
				newValue = 1;
			} else if (newValue > 100) {
				newValue = 100;
			}
			slippage = newValue.toString();
			updateSettingsStore(
				autoSnipe,
				shyftApiKey,
				parseFloat(quoteAmount),
				publicKey,
				privateKey,
				newValue * 100,
				parseFloat(customFee) * 1_000_000_000
			);
		} else {
			slippage = '';
		}
	}

	function handleSlippageBlur() {
		let newValue = parseInt(slippage);
		if (isNaN(newValue) || newValue < 1) {
			slippage = '1';
			newValue = 1;
		} else if (newValue > 100) {
			slippage = '100';
			newValue = 100;
		}
		updateSettingsStore(
			autoSnipe,
			shyftApiKey,
			parseFloat(quoteAmount),
			publicKey,
			privateKey,
			newValue * 100,
			parseFloat(customFee) * 1_000_000_000
		);
	}

	function handleCustomFeeInput(event: Event) {
		const input = event.target as HTMLInputElement;
		customFee = input.value.replace(/[^0-9.]/g, '');
	}

	function handleCustomFeeBlur() {
		let newValue = parseFloat(customFee);
		if (isNaN(newValue) || newValue < 0.00005) {
			customFee = '0.00005';
		} else if (customFee.split('.')[1]?.length > 9) {
			customFee = newValue.toFixed(9);
		}
		updateSettingsStore(
			autoSnipe,
			shyftApiKey,
			parseFloat(quoteAmount),
			publicKey,
			privateKey,
			parseFloat(slippage) * 100,
			parseFloat(customFee) * 1_000_000_000
		);
	}

	$: customFeeError = isNaN(parseFloat(customFee)) || parseFloat(customFee) < 0;
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin="anonymous" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Drawer transitionType="fly" {transitionParams} bind:hidden={hidden1} id="sidebar1">
	<div class="flex flex-col items-center w-full gap-12 p-12 mt-4 font-orbitron text-text">
		<div class="flex justify-start w-full">
			<Toggle
				color="green"
				checked={autoSnipe}
				on:change={() =>
					updateSettingsStore(
						!autoSnipe,
						shyftApiKey,
						parseFloat(quoteAmount),
						publicKey,
						privateKey,
						parseFloat(slippage) * 100,
						parseFloat(customFee) * 1_000_000_000
					)}
				classDiv="bg-red-700"
			>
				Auto snipe
			</Toggle>
		</div>

		<div>
			<Label for="custom_rpc" class="mb-2">Shyft API Key</Label>
			<Input
				type="text"
				id="custom_rpc"
				bind:value={shyftApiKey}
				on:input={() =>
					updateSettingsStore(
						autoSnipe,
						shyftApiKey,
						parseFloat(quoteAmount),
						publicKey,
						privateKey,
						parseFloat(slippage) * 100,
						parseFloat(customFee) * 1_000_000_000
					)}
				placeholder="Shyft API key"
				required
				class="bg-white text-primary"
			/>
			{#if shyftApiKeyError}
				<Helper class="text-red-500">Shyft API key is required</Helper>
			{/if}
		</div>

		<div>
			<Label for="auto_snipe_quote" class="mb-2">Quote Amount (SOL)</Label>
			<Input
				type="number"
				id="auto_snipe_quote"
				bind:value={quoteAmount}
				on:input={handleQuoteAmountInput}
				on:blur={handleQuoteAmountBlur}
				step="0.001"
				placeholder="Quote Amount"
				required
				class="bg-white text-primary"
			/>
			<Helper class="mt-2">Minimum amount: 0.005 SOL</Helper>
		</div>

		<div>
			<Label for="slippage" class="mb-2">Slippage %</Label>
			<Input
				type="number"
				id="slippage"
				bind:value={slippage}
				on:input={handleSlippageInput}
				on:blur={handleSlippageBlur}
				min="1"
				max="100"
				placeholder="Slippage Amount"
				required
				class="bg-white text-primary"
			/>
			{#if slippageError}
				<Helper class="text-red-500">Slippage cannot exceed 100%</Helper>
			{/if}
			<Helper class="mt-2">Below 5% may result in failed transactions.</Helper>
		</div>

		<div>
			<Label for="custom_fee" class="mb-2">Custom Fee (SOL)</Label>
			<Input
				type="number"
				id="custom_fee"
				bind:value={customFee}
				on:input={handleCustomFeeInput}
				on:blur={handleCustomFeeBlur}
				step="0.00001"
				placeholder="Custom Fee"
				required
				class="bg-white text-primary"
			/>
			{#if customFeeError}
				<Helper class="text-red-500">Custom Fee must be a positive number</Helper>
			{/if}
		</div>
	</div>
</Drawer>

<div class="font-orbitron">
	<Nav bind:hidden1 />
</div>

<div
	class="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-secondary to-background overflow-x-hidden h-screen orbitron-font"
>
	<slot></slot>
</div>
