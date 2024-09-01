<script lang="ts">
	import DesktopNav from './Nav/DesktopNav.svelte';
	import MobileNav from './Nav/MobileNav.svelte';

	export let hidden1: boolean;
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin="anonymous" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- MobileNav will be shown on screens below 768px (md) -->
<div class="block md:hidden">
	<MobileNav bind:hidden1 />
</div>

<!-- DesktopNav will be shown on screens 768px (md) and larger -->
<div class="hidden md:block">
	<DesktopNav bind:hidden1 />
</div>
