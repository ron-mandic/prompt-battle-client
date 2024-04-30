<script>
	import './styles.scss';
	import '@fontsource/jetbrains-mono/100.css';
	import '@fontsource/jetbrains-mono/400.css';
	import '@fontsource/jetbrains-mono/700.css';
	import '@fontsource/jetbrains-mono/800.css';
	import Marquee from '$lib/components/Marquee.svelte';
	import { fly } from 'svelte/transition';

	export let data;
</script>

<!-- TODO: Custom transitions (see https://joyofcode.xyz/sveltekit-page-transitions#custom-transitions) -->
{#key data.url}
	<div
		id="app"
		class="w-full h-screen flex justify-center items-center"
		in:fly={{ x: window.innerWidth / 4, duration: 300, delay: 300 }}
		out:fly={{ x: -window.innerWidth / 4, duration: 300 }}
	>
		<Marquee />
		<main class="flex justify-center items-center w-full h-full">
			<slot />
		</main>
		<Marquee position="bottom" direction="right" />
	</div>
{/key}

<style>
	main {
		width: min(100dvw, 1920px);
		height: min(100dvh, 1080px);
	}
</style>
