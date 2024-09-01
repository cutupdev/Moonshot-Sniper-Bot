<script>
	import { Alert } from 'flowbite-svelte';

	export let errorMessage;
	export let showErrorAlert;
</script>

{#if showErrorAlert}
	<Alert color="red">
		<span class="font-medium">Error!</span>
		{errorMessage}
	</Alert>
{/if}
