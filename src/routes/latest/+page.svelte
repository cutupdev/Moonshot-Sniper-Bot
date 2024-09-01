<script lang="ts">
	import { settingsStore, type Settings } from './../../stores/settings';
	import ErrorAlert from './../../components/Alerts/ErrorAlert.svelte';
	import SuccessAlert from '../../components/Alerts/SuccessAlert.svelte';
	import { startListener, stopListener, isListenerRunning } from '$lib/listener';
	import { onDestroy, onMount } from 'svelte';
	import { handleSwap } from '$lib/swapUtils';
	import { ClipboardSolid } from 'flowbite-svelte-icons';

	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Button,
		Spinner,
		Modal
	} from 'flowbite-svelte';
	import {
		newMoonShotTokensArr,
		loadTokensFromLocalStorage,
		clearTokens
	} from '../../stores/token-store';
	import {
		CaretRightOutline,
		CirclePauseOutline,
		InfoCircleOutline,
		CashOutline
	} from 'flowbite-svelte-icons';

	let clickOutsideModal = false;
	let showConfirmationModal = false;
	let showBuyConfirmationModal = false;
	let selectedTokenForBuy: any;

	let modalInfo = [] as any;

	let isStarted = false;

	let successMessage = '';
	let showSuccessAlert = false;

	let errorMessage = '';
	let showErrorAlert = false;

	let currentSettings: Settings;

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

	function formatTimestampToTime(timestamp?: string): string {
		if (!timestamp) return 'N/A'; // Handle undefined or empty timestamp
		const date = new Date(timestamp);
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');
		return `${hours}:${minutes}:${seconds}`;
	}

	let unsubscribeSettings: () => void;

	onMount(() => {
		// Load tokens from local storage
		loadTokensFromLocalStorage();

		const unsubscribeListener = isListenerRunning.subscribe((value) => {
			isStarted = value;
		});

		unsubscribeSettings = settingsStore.subscribe((value) => {
			currentSettings = value;
		});

		return () => {
			if (unsubscribeListener) unsubscribeListener();
			if (unsubscribeSettings) unsubscribeSettings();
		};
	});

	const handleStartListener = () => {
		if (!currentSettings.shyftApiKey) {
			errorMessage = 'Please enter a Shyft API key first.';
			showErrorAlert = true;
			return;
		}

		startListener().then(() => {
			successMessage = 'Listener started';
			showSuccessAlert = true;
		});
	};

	const handleStopListener = () => {
		stopListener().then(() => {
			successMessage = 'Listener stopped';
			showSuccessAlert = true;
		});
	};

	const handleOpenModal = async (token: any) => {
		if (!token) return;
		modalInfo = [];

		console.log(token, 'token modal data');

		clickOutsideModal = true;

		modalInfo = modalInfo.concat(token);

		console.log(modalInfo, 'modal');
	};
	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			successMessage = 'Address copied to clipboard';
			showSuccessAlert = true;
		} catch (err) {
			console.error('Failed to copy: ', err);
			errorMessage = 'Failed to copy address';
			showErrorAlert = true;
		}
	};

	const handleClearTokens = () => {
		clearTokens();
		successMessage = 'All tokens cleared';
		showSuccessAlert = true;
		showConfirmationModal = false;
	};

	const openBuyConfirmationModal = (token: any) => {
		selectedTokenForBuy = token;
		showBuyConfirmationModal = true;
	};

	const confirmBuy = () => {
		if (selectedTokenForBuy) {
			handleSwap({ mintAddress: selectedTokenForBuy.address, swapArg: 'buy' });
		}
		showBuyConfirmationModal = false;
	};
</script>

<div class="flex flex-col items-center justify-center overflow-hidden">
	<SuccessAlert {successMessage} {showSuccessAlert} />

	<ErrorAlert {errorMessage} {showErrorAlert} />

	<div
		class="flex flex-col items-center justify-center w-full px-20 py-8 xs:px-1 sm:px-2 md:px-2 lg:px-20"
	>
		<div class="flex flex-row justify-between w-full mb-10">
			<div class="flex-1"></div>
			<div class="flex flex-row gap-10">
				<div>
					{#if !isStarted}
						<Button
							color="light"
							shadow
							class="text-white bg-primary hover:bg-accent"
							size="md"
							on:click={() => handleStartListener()}
							><CaretRightOutline class="w-5 h-5 me-2" />Start</Button
						>
					{:else}
						<Button disabled color="light" class=" text-accent" size="md"
							><CaretRightOutline class="w-5 h-5 me-2" />Start</Button
						>
					{/if}
				</div>
				<div>
					{#if isStarted}
						<Button
							shadow
							color="light"
							class="text-white bg-primary hover:bg-accent"
							size="md"
							on:click={() => handleStopListener()}
							><CirclePauseOutline class="w-5 h-5 me-2" />Stop</Button
						>
					{:else}
						<Button shadow disabled color="light" class="text-accent" size="md"
							><CirclePauseOutline class="w-5 h-5 me-2" />Stop</Button
						>
					{/if}
				</div>
			</div>
			<div class="flex justify-end flex-1">
				<Button
					color="light"
					shadow
					class="text-white bg-primary hover:bg-accent"
					size="md"
					on:click={() => (showConfirmationModal = true)}
				>
					Clean
				</Button>
			</div>
		</div>
		<div class="w-full">
			<Table hoverable={true} bordered={true} shadow={true}>
				<TableHead>
					<TableHeadCell>Name</TableHeadCell>
					<TableHeadCell class="hidden md:table-cell">Symbol</TableHeadCell>
					<TableHeadCell class="hidden sm:table-cell">Address</TableHeadCell>
					<TableHeadCell>Launch Time</TableHeadCell>
					<TableHeadCell>Details</TableHeadCell>
					<TableHeadCell>Actions</TableHeadCell>
				</TableHead>
				<TableBody tableBodyClass="divide-y">
					{#if $newMoonShotTokensArr.length === 0}
						<TableBodyRow>
							<TableBodyCell colspan="6">
								<Spinner size={10} color="blue" class="text-center" />
								<span class="text-accent">Waiting...</span>
							</TableBodyCell>
						</TableBodyRow>
					{:else}
						{#each $newMoonShotTokensArr as token}
							<TableBodyRow>
								<TableBodyCell>{token.name}</TableBodyCell>
								<TableBodyCell class="hidden md:table-cell">{token.symbol}</TableBodyCell>
								<TableBodyCell class="hidden sm:table-cell">
									<button
										class="flex items-center w-full text-left"
										on:click={() => copyToClipboard(token.address)}
										on:keydown={(e) => e.key === 'Enter' && copyToClipboard(token.address)}
										title="Click to copy address"
									>
										<ClipboardSolid class="mr-2 text-secondary hover:text-primary" size="sm" />
										<span>{`${token.address.slice(0, 7)}...`}</span>
									</button>
								</TableBodyCell>
								<TableBodyCell>{formatTimestampToTime(token.timestamp)}</TableBodyCell>
								<TableBodyCell>
									<div>
										<Button on:click={() => handleOpenModal(token)} class="px-0 py-2 text-text">
											<InfoCircleOutline class="w-5 h-5 me-2" />{token.name}
										</Button>
									</div>
								</TableBodyCell>
								<TableBodyCell>
									<div class="flex flex-row m-0">
										<div class="mr-5">
											<Button
												class="px-0 py-2 text-accent"
												on:click={() => openBuyConfirmationModal(token)}
											>
												<CashOutline class="w-5 h-5 me-2" />Buy
											</Button>
										</div>
									</div>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					{/if}
				</TableBody>
			</Table>
		</div>
	</div>
</div>

<Modal title="Token Details" bind:open={clickOutsideModal} autoclose outsideclose>
	{#each modalInfo as selectedToken}
		<p class="text-base leading-relaxed text-text dark:text-gray-400">
			<b>Name</b> - {selectedToken.name}
		</p>
		<p class="text-base leading-relaxed text-text dark:text-gray-400">
			<b>Symbol</b> - {selectedToken.symbol}
		</p>
		<p class="text-base leading-relaxed text-text dark:text-gray-400">
			<b>Supply</b> - {selectedToken.current_supply}
		</p>
		<p class="text-base leading-relaxed text-text dark:text-gray-400">
			<b>Address</b> - {selectedToken.address}
		</p>

		<p class="text-base leading-relaxed text-text dark:text-gray-400">
			<b>Description</b> - {selectedToken.description}
		</p>
		<p class="text-base leading-relaxed text-text dark:text-gray-400">
			<b>DexScreener</b> -
			<a
				class="text-primary"
				target="blank"
				href={`https://dexscreener.com/solana/${selectedToken.address}`}>Link</a
			>
		</p>
	{/each}

	<svelte:fragment slot="footer">
		<Button color="primary">Close</Button>
	</svelte:fragment>
</Modal>

<Modal title="Confirmation" bind:open={showConfirmationModal} autoclose outsideclose>
	<p class="text-base leading-relaxed text-text dark:text-gray-400">
		Do you want to delete all mints?
	</p>
	<svelte:fragment slot="footer">
		<Button color="light" on:click={() => (showConfirmationModal = false)}>Cancel</Button>
		<Button color="red" on:click={handleClearTokens}>Delete</Button>
	</svelte:fragment>
</Modal>

<Modal title="Buy Confirmation" bind:open={showBuyConfirmationModal} autoclose outsideclose>
	<p class="text-base leading-relaxed text-text dark:text-gray-400">
		<b>Slippage:</b>
		{currentSettings.slippage / 100}%
	</p>
	<p class="text-base leading-relaxed text-text dark:text-gray-400">
		<b>SOL Amount:</b>
		{currentSettings.quoteAmount} SOL
	</p>
	<svelte:fragment slot="footer">
		<Button color="light" on:click={() => (showBuyConfirmationModal = false)}>Cancel</Button>
		<Button color="green" on:click={confirmBuy}>Buy</Button>
	</svelte:fragment>
</Modal>
