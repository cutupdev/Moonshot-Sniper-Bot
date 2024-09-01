<script lang="ts">
	import { Button, Spinner, Modal, Input, Label, Helper } from 'flowbite-svelte';
	import SuccessAlert from '../../components/Alerts/SuccessAlert.svelte';
	import ErrorAlert from '../../components/Alerts/ErrorAlert.svelte';
	import { settingsStore, updateSettingsStore, type Settings } from '../../stores/settings';
	import bs58 from 'bs58';

	let successMessage = '';
	let showSuccessAlert = false;

	let errorMessage = '';
	let showErrorAlert = false;

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

	let isAddingNewWallet = false;
	let isCreatingNewWallet = false;
	let isCheckingCurrentWallet = false;
	let showModalForNewlyCreatedWallet = false;

	let newPublicKey = '';
	let newPrivateKey = '';

	// Subscribe to the settings store
	let currentSettings: Settings;
	settingsStore.subscribe((value: Settings) => {
		currentSettings = value;
	});

	const handleNewWalletCreation = async () => {
		isCreatingNewWallet = true; // Set loading state to true
		try {
			const response = await fetch(
				'https://moonshot-txns-processor-public.up.railway.app/wallet/new-wallet',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (!response) return;

			const keypair = await response.json();

			if (!keypair || keypair.publicKey === undefined) return;

			newPublicKey = keypair.publicKey;
			const secretKeyArray = Object.values(keypair.secretKey).map(Number);
			newPrivateKey = bs58.encode(Uint8Array.from(secretKeyArray));

			successMessage = 'New wallet created';
			showSuccessAlert = true;
			showModalForNewlyCreatedWallet = true;

			await updateSettingsStore(
				currentSettings.autoSnipe,
				currentSettings.shyftApiKey,
				currentSettings.quoteAmount,
				newPublicKey,
				newPrivateKey,
				currentSettings.slippage,
				currentSettings.customFee
			);
		} catch (err) {
			console.log(err);
			errorMessage = 'Error while creating new wallet';
			showErrorAlert = true;
		} finally {
			isCreatingNewWallet = false; // Set loading state to false
		}
	};

	const handleAddWallet = async () => {
		try {
			const privateKeyArray = bs58.decode(newPrivateKey);
			const privateKeyBase58 = bs58.encode(Uint8Array.from(privateKeyArray));

			await updateSettingsStore(
				currentSettings.autoSnipe,
				currentSettings.shyftApiKey,
				currentSettings.quoteAmount,
				newPublicKey,
				privateKeyBase58,
				currentSettings.slippage,
				currentSettings.customFee
			);

			successMessage = 'New wallet added successfully';
			showSuccessAlert = true;
			isAddingNewWallet = false;
		} catch (err) {
			console.error(err);
			errorMessage = 'Error adding new wallet';
			showErrorAlert = true;
		}
	};

	const handleCloseModal = () => {
		showModalForNewlyCreatedWallet = false;
		newPublicKey = '';
		newPrivateKey = '';
	};
</script>

<SuccessAlert {successMessage} {showSuccessAlert} />
<ErrorAlert {errorMessage} {showErrorAlert} />

<div class="flex flex-col items-center justify-center p-24 overflow-hidden">
	<div class="flex flex-row items-center justify-center gap-4">
		<div class="">
			<Button
				shadow
				color="light"
				class="text-white bg-primary hover:bg-accent"
				size="md"
				on:click={() => (isAddingNewWallet = true)}
			>
				Add Wallet
			</Button>
		</div>
		<div class="">
			<Button
				shadow
				color="light"
				class="text-white bg-primary hover:bg-accent"
				size="md"
				on:click={() => (isCheckingCurrentWallet = true)}
			>
				Current Wallet
			</Button>
		</div>
		<div class="">
			<Button
				shadow
				color="light"
				class="text-white bg-primary hover:bg-accent"
				size="md"
				on:click={() => handleNewWalletCreation()}
			>
				Create New Wallet
			</Button>
		</div>
	</div>
</div>

{#if isCreatingNewWallet}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Spinner size={10} color="blue" class="text-center" />
	</div>
{/if}

<Modal title="New Wallet" bind:open={isAddingNewWallet} autoclose outsideclose>
	<div class="mb-4">
		<Label for="PublicKey" class="mb-2">PublicKey</Label>
		<Input type="text" id="PublicKey" placeholder="PublicKey" bind:value={newPublicKey} required />
	</div>
	<div>
		<Label for="PrivateKey" class="mb-2">PrivateKey</Label>
		<Input
			type="text"
			id="PrivateKey"
			placeholder="PrivateKey"
			bind:value={newPrivateKey}
			required
		/>
	</div>

	<svelte:fragment slot="footer">
		<Button class="text-white bg-accent" on:click={handleAddWallet}>Submit</Button>
		<Button class="text-white bg-primary" on:click={() => (isAddingNewWallet = false)}>Close</Button
		>
	</svelte:fragment>
</Modal>

<Modal title="Your current wallet" bind:open={isCheckingCurrentWallet} autoclose outsideclose>
	<div class="mb-4">
		<Label for="PublicKey" class="mb-2">PublicKey</Label>
		<Input disabled type="text" id="PublicKey" value={currentSettings.publicKey} required />
	</div>
	<div>
		<Label for="PrivateKey" class="mb-2">PrivateKey</Label>
		<Input disabled type="text" id="PrivateKey" value={currentSettings.privateKey} required />
	</div>

	<svelte:fragment slot="footer">
		<Button class="text-white bg-primary" on:click={() => (isCheckingCurrentWallet = false)}
			>Close</Button
		>
	</svelte:fragment>
</Modal>

<Modal
	title="Your NEW wallet"
	bind:open={showModalForNewlyCreatedWallet}
	autoclose
	outsideclose
	on:close={handleCloseModal}
>
	<div>
		<p class="text-secondary">
			<b>WARNING!</b> - Make sure to copy and save this info. When you close this pop up, this message
			will be deleted forever!
		</p>
	</div>
	<div class="mb-4">
		<Label for="PublicKey" class="mb-2">NEW PublicKey</Label>
		<Input type="text" id="PublicKey" value={newPublicKey} required />
	</div>
	<div>
		<Label for="PrivateKey" class="mb-2">NEW PrivateKey</Label>
		<Input type="text" id="PrivateKey" value={newPrivateKey} required />
	</div>

	<svelte:fragment slot="footer">
		<Button class="text-white bg-primary" on:click={handleCloseModal}>Close</Button>
	</svelte:fragment>
</Modal>
