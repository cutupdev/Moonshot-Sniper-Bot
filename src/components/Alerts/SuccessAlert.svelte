<script>
	import { Alert } from 'flowbite-svelte';

	export let successMessage;
	export let showSuccessAlert;
</script>

{#if showSuccessAlert}
	<Alert color="green">
		<span class="font-medium">Success!</span>
		{successMessage}
	</Alert>
{/if}
