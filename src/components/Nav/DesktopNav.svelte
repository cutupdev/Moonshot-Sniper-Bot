<script lang="ts">
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		Button,
		Dropdown,
		DropdownItem,
		Tooltip
	} from 'flowbite-svelte';
	import {
		FireSolid,
		ChartMixedDollarSolid,
		LandmarkSolid,
		AdjustmentsHorizontalSolid,
		XSolid,
		DiscordSolid,
		GithubSolid,
		WalletOutline,
		ChevronDownOutline
	} from 'flowbite-svelte-icons';

	export let hidden1: boolean;

	function toggleSettings() {
		hidden1 = !hidden1;
	}
</script>

<Navbar class="bg-primary text-text" let:NavContainer>
	<NavContainer class="flex items-center justify-between px-4 mx-auto  flex-nowrap md:px-0 lg:px-4">
		<NavUl
			ulClass="flex flex-col p-4 mt-4 md:flex-row md:space-x-2 rtl:space-x-reverse md:mt-0 lg:space-x-6 xl:space-x-8"
		>
			<NavLi href="/latest" class="cursor-pointer">
				<Button shadow color="light" class="p-2 text-text">
					<FireSolid class="w-5 h-5 lg:me-2" /> <span class="ms-2">Latest</span>
				</Button>
			</NavLi>
			<NavLi href="/swap" class="cursor-pointer">
				<Button shadow color="light" class="p-2 text-text">
					<ChartMixedDollarSolid class="w-5 h-5 lg:me-2" /> <span class="ms-2">Swap</span>
				</Button>
			</NavLi>
			<NavLi href="/portfolio" class="cursor-pointer">
				<Button shadow color="light" class="p-2 text-text">
					<LandmarkSolid class="w-5 h-5 lg:me-2" /> <span class="ms-2">Portfolio</span>
				</Button>
			</NavLi>
		</NavUl>
		<NavBrand href="/" class="mx-4">
			<div class="flex flex-col text-center">
				<div>
					<span class="self-center text-xl font-bold whitespace-nowrap">MS</span>
				</div>
				<div>
					<p>DEMO</p>
				</div>
			</div>
		</NavBrand>
		<NavUl
			ulClass="flex flex-col p-4 mt-4 md:flex-row md:space-x-2 rtl:space-x-reverse md:mt-0 lg:space-x-6 xl:space-x-8"
		>
			<NavLi class="cursor-pointer">
				<Button on:click={toggleSettings} shadow color="light" class="p-2 text-text">
					<AdjustmentsHorizontalSolid class="w-5 h-5" />
				</Button>
				<Tooltip>Settings</Tooltip>
			</NavLi>
			<NavLi href="/wallet" class="cursor-pointer">
				<Button shadow color="light" class="p-2 text-text">
					<WalletOutline class="w-5 h-5 lg:me-2" /> <span class="ms-2">Wallet</span>
				</Button>
			</NavLi>
			<NavLi class="cursor-pointer">
				<Button shadow color="light" class="p-2 text-text">
					<ChevronDownOutline class="w-5 h-5" /> <span class="ms-2 lg:me-2">Socials</span>
				</Button>
				<Dropdown class="z-20 w-44">
					<DropdownItem href="https://x.com/moonshot_sniper" target="_blank">
						<div class="flex items-center">
							<XSolid class="w-5 h-5 me-2.5" /> <span>Twitter</span>
						</div>
					</DropdownItem>
					<DropdownItem href="https://discord.gg/J3dqEYsPNW" target="_blank">
						<div class="flex items-center">
							<DiscordSolid class="w-5 h-5 me-2.5" /> <span>Discord</span>
						</div>
					</DropdownItem>
					<DropdownItem href="https://github.com/Dolphins-Lab" target="_blank">
						<div class="flex items-center">
							<GithubSolid class="w-5 h-5 me-2.5" /> <span>GitHub</span>
						</div>
					</DropdownItem>
				</Dropdown>
			</NavLi>
		</NavUl>
	</NavContainer>
</Navbar>
