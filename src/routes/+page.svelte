<script>
	import { Heading, Card } from 'flowbite-svelte';
	import { WalletSolid, UserSettingsSolid, EyeSolid } from 'flowbite-svelte-icons';
</script>

<div
	class="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center font-orbitron text-text"
>
	<div class="text-center mb-4">
		<Heading
			tag="h1"
			class="mb-4 text-text"
			customSize="text-4xl font-extrabold md:text-5xl lg:text-6xl"
		>
			Moonshot <span
				class="text-primary font-bold"
				style="text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 4px rgba(0, 0, 0, 0.5);"
				>Sniper</span
			>
		</Heading>
	</div>
	<div class="mb-8 text-center">
		<h2 class="text-text text-4xl font-extrabold md:text-5xl lg:text-6xl">
			Snipe & <span
				class="text-primary font-bold"
				style="text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 4px rgba(0, 0, 0, 0.5);"
				>Earn</span
			>
			profits with precision
		</h2>
	</div>

	<div
		class="flex flex-col lg:flex-row gap-5 justify-center lg:justify-between items-center w-full max-w-5xl"
	>
		<Card class="w-80 h-52 bg-white">
			<WalletSolid class="w-8 h-8 mb-3 text-primary" />
			<a href="/">
				<h5 class="mb-2 text-2xl font-semibold tracking-tight text-text">
					Step 1 - Navigate to Wallet
				</h5>
			</a>
			<p class="mb-3 font-normal text-secondary">Create and set up a new wallet.</p>
		</Card>
		<Card class="w-80 h-52 bg-white">
			<UserSettingsSolid class="w-8 h-8 mb-3 text-primary" />
			<a href="/">
				<h5 class="mb-2 text-2xl font-semibold tracking-tight text-text">Step 2 - Open settings</h5>
			</a>
			<p class="mb-3 font-normal text-secondary">Adjust settings to your liking.</p>
		</Card>
		<Card class="w-80 h-52 bg-white">
			<EyeSolid class="w-8 h-8 mb-3 text-primary" />
			<a href="/">
				<h5 class="mb-2 text-2xl font-semibold tracking-tight text-text">Step 3 - Start sniper</h5>
			</a>
			<p class="mb-3 font-normal text-secondary">Go to latest and click on "start".</p>
		</Card>
	</div>
</div>
