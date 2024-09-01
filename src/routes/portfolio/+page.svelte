<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { ClipboardSolid } from 'flowbite-svelte-icons';
	import SuccessAlert from '../../components/Alerts/SuccessAlert.svelte';
	import ErrorAlert from '../../components/Alerts/ErrorAlert.svelte';
	import { settingsStore } from '../../stores/settings';
	import { loadTokensFromLocalStorage } from '../../stores/token-store';

	export const allAssetsData: {
		info: { image: string; name: string; symbol: string };
		address: string;
		balance: number;
	}[] = [];

	export let data;

	$: if (data) console.log(data, 'data found');

	let tableData = [] as any;
	let userPublicKey = '';
	let unsubscribe: () => void;

	$: if (allAssetsData !== null && allAssetsData !== undefined && allAssetsData.length > 0) {
		console.log(allAssetsData, 'all found assets');
	}

	let successMessage = '';
	let showSuccessAlert = false;
	let errorMessage = '';
	let showErrorAlert = false;

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

	onMount(async () => {
		// Load user settings
		unsubscribe = settingsStore.subscribe(($settings) => {
			userPublicKey = $settings.publicKey || '';
		});

		// Load tokens from localStorage
		loadTokensFromLocalStorage();

		if (data && data.allAssetsData && data.allAssetsData.result !== undefined) {
			// Filter and map the assets data
			tableData = data.allAssetsData.result
				.filter((asset: any) => asset.balance > 0) // Filter out tokens with 0 balance
				.map((asset: any) => {
					return {
						image: asset.info.image || '',
						name: asset.info.name || '',
						symbol: asset.info.symbol || '',
						address: asset.address || '',
						balance: asset.balance || 0
					};
				});

			console.log('Filtered and mapped tableData:', tableData);
		} else {
			console.log('No asset data available');
		}
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

<SuccessAlert {successMessage} {showSuccessAlert} />
<ErrorAlert {errorMessage} {showErrorAlert} />

<div class="w-full p-12">
	<div>
		<h2 class="mb-4 text-2xl font-bold text-text">Your Holdings:</h2>
	</div>
	<div>
		<Table hoverable={true} bordered={true} shadow={true} class="table-auto">
			<TableHead>
				<TableHeadCell>Image</TableHeadCell>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Symbol</TableHeadCell>
				<TableHeadCell>Address</TableHeadCell>
				<TableHeadCell>Balance</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y">
				{#each tableData as asset}
					<TableBodyRow>
						<TableBodyCell class="!p-2">
							<div class="w-16 h-16 min-w-[4rem] min-h-[4rem] flex items-center justify-center">
								<img
									class="object-contain max-w-full max-h-full"
									src={asset.image}
									alt="token_image"
								/>
							</div>
						</TableBodyCell>
						<TableBodyCell>{asset.name}</TableBodyCell>
						<TableBodyCell>{asset.symbol}</TableBodyCell>
						<TableBodyCell>
							<button
								class="flex items-center w-full text-left"
								on:click={() => copyToClipboard(asset.address)}
								on:keydown={(e) => e.key === 'Enter' && copyToClipboard(asset.address)}
								title="Click to copy address"
							>
								<ClipboardSolid class="mr-2 text-secondary hover:text-primary" size="sm" />
								<span>{`${asset.address.slice(0, 7)}...`}</span>
							</button>
						</TableBodyCell>
						<TableBodyCell>{asset.balance}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>
