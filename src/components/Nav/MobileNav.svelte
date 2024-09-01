<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, Button, NavUl, NavLi } from 'flowbite-svelte';
	import {
		FireSolid,
		ChartMixedDollarSolid,
		LandmarkSolid,
		AdjustmentsHorizontalSolid,
		WalletOutline,
		XSolid,
		DiscordSolid,
		GithubSolid
	} from 'flowbite-svelte-icons';

	export let hidden1: boolean;

	function toggleSettings() {
		hidden1 = !hidden1;
	}
</script>

<Navbar class="flex justify-between bg-primary text-text">
	<NavBrand href="/">
		<span class="self-center text-xl font-bold whitespace-nowrap">MS DEMO</span>
	</NavBrand>
	<div class="flex items-center space-x-4">
		<Button on:click={toggleSettings} title="Settings" shadow color="light" class="p-2 text-text">
			<AdjustmentsHorizontalSolid class="w-6 h-6" />
		</Button>
		<NavHamburger
			class="inline-flex items-center justify-center p-2 text-sm font-medium text-center bg-white border border-gray-300 rounded-lg shadow-lg focus-within:ring-4 focus-within:outline-none hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 shadow-gray-500/50 dark:shadow-gray-800/80 text-text"
		/>
	</div>
	<NavUl>
		<NavLi href="/latest">
			<Button color="light" class="flex items-center w-full">
				<FireSolid class="w-5 h-5 me-2.5" /> Latest
			</Button>
		</NavLi>
		<NavLi href="/swap">
			<Button color="light" class="flex items-center w-full">
				<ChartMixedDollarSolid class="w-5 h-5 me-2.5" /> Swap
			</Button>
		</NavLi>
		<NavLi href="/portfolio">
			<Button color="light" class="flex items-center w-full">
				<LandmarkSolid class="w-5 h-5 me-2.5" /> Portfolio
			</Button>
		</NavLi>
		<NavLi href="/wallet">
			<Button color="light" class="flex items-center w-full">
				<WalletOutline class="w-5 h-5 me-2.5" /> Wallet
			</Button>
		</NavLi>

		<div class="my-2 border-t border-gray-200 dark:border-gray-700"></div>

		<NavLi href="https://x.com/moonshot_sniper" target="_blank">
			<Button color="light" class="flex items-center w-full">
				<XSolid class="w-5 h-5 me-2.5" /> Twitter
			</Button>
		</NavLi>
		<NavLi href="https://discord.gg/J3dqEYsPNW" target="_blank">
			<Button color="light" class="flex items-center w-full">
				<DiscordSolid class="w-5 h-5 me-2.5" /> Discord
			</Button>
		</NavLi>
		<NavLi href="https://github.com/Dolphins-Lab" target="_blank">
			<Button color="light" class="flex items-center w-full">
				<GithubSolid class="w-5 h-5 me-2.5" /> GitHub
			</Button>
		</NavLi>
	</NavUl>
</Navbar>
