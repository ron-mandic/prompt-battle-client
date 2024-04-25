<script>
	import Marquee from '$lib/components/Marquee.svelte';
	import './styles.scss';
	import '@fontsource/jetbrains-mono/100.css';
	import '@fontsource/jetbrains-mono/800.css';
</script>

<div id="app" class="debug">
	<Marquee />
	<main>
		<slot />
	</main>
	<Marquee position="bottom" direction="right" />
</div>

<style>
	#app {
		margin: 0 auto;
		width: min(100dvw, 1920px);
		height: min(100dvh, 1080px);
	}

	main {
		width: 100%;
		height: 100%;
	}
</style>
