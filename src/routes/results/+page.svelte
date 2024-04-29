<script lang="ts">
	import { page } from '$app/stores';
	import { auto1111Images } from '$lib/stores/auto1111-images';
	import Loader from '$lib/components/Loader.svelte';
	import { BATCH_SIZE } from '$lib/ts/constants';
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let id, name: string, prompt: string;

	onMount(async () => {
		id = $page.url.searchParams.get('id')!;
		name = sessionStorage.getItem(id as string) || 'Anonymous';
		prompt = $page.url.searchParams.get('prompt')!;
	});
</script>

<svelte:head>
	<title>Scribble by {name}</title>
</svelte:head>

<div id="results" class="relative">
	<div id="prompt-results" class="flex justify-center items-center">
		{#await $auto1111Images}
			{#each new Array(BATCH_SIZE) as _, i}
				<div class="sd image bg-black flex justify-center items-center">
					<Loader --delay={i} />
				</div>
			{/each}
		{:then images}
			{#each images.slice(0, images.length - 2) as image, i}
				<div class="sd image bg-black flex justify-center items-center">
					{#if images.length}
						<img
							src={`data:image/png;base64,${image}`}
							alt={`${prompt} (${i})`}
							in:scale={{ duration: 500, delay: 500, opacity: 0.5, start: 0.5, easing: quintOut }}
						/>
					{/if}
				</div>
			{/each}
		{/await}
	</div>
	<div id="prompt-footer" class="flex justify-between items-end">
		<div id="prompt-clock" class="flex flex-col justify-center">
			<p>time remaining:</p>
			<p>--:--</p>
		</div>
		<div id="prompter" class="px-2">{name}</div>
	</div>
</div>

<style lang="scss">
	#results {
		width: 1856px;
		height: 940px;
		border: 2px solid #6eebea;
		background-color: #1c1f22;
		row-gap: 1rem;
		grid-template-rows: 152px auto;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			pointer-events: none;
		}
	}

	#prompt-results {
		width: 100%;
		height: 816px;
		gap: 2rem;
	}

	.image {
		width: 528px;
		height: 528px;
		padding: 0.5rem;
		aspect-ratio: 1 / 1;
		flex-shrink: 0;
		border: 2px solid #6eebea;
		transition: translate 0.5s ease-in-out;

		&.sd:hover {
			cursor: pointer;
			translate: 0 -10px;
			transition: translate 0.25s cubic-bezier(0.86, 0, 0.07, 1);
		}
	}

	#prompt-footer {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 124px;
		flex-shrink: 0;
		background-color: transparent;
		z-index: 100;
		user-select: none;
	}

	#prompt-clock {
		width: 245px;
		height: 124px;
		flex-shrink: 0;
		border-top: 2px solid #6eebea;
		border-right: 2px solid #6eebea;
		background: #1c1f22;
		padding: 8px 12px 0;

		p:nth-child(1) {
			color: #fff;
			text-align: center;
			font-size: 24px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
		}

		p:nth-child(2) {
			color: #fff;
			text-align: center;
			font-size: 68px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
		}
	}

	#prompter {
		width: 260px;
		height: 51px;
		flex-shrink: 0;
		border-top: 2px solid #6eebea;
		border-left: 2px solid #6eebea;
		color: #fff;
		text-align: center;
		font-size: 36px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		background-color: #1c1f22;
	}

	@keyframes jello {
		from,
		11.1%,
		to {
			transform: translate3d(-50%, -50%, 0);
		}

		22.2% {
			transform: skewX(-12.5deg) skewY(-12.5deg) translate3d(-50%, -50%, 0);
		}

		33.3% {
			transform: skewX(6.25deg) skewY(6.25deg) translate3d(-50%, -50%, 0);
		}

		44.4% {
			transform: skewX(-3.125deg) skewY(-3.125deg) translate3d(-50%, -50%, 0);
		}

		55.5% {
			transform: skewX(1.5625deg) skewY(1.5625deg) translate3d(-50%, -50%, 0);
		}

		66.6% {
			transform: skewX(-0.78125deg) skewY(-0.78125deg) translate3d(-50%, -50%, 0);
		}

		77.7% {
			transform: skewX(0.390625deg) skewY(0.390625deg) translate3d(-50%, -50%, 0);
		}

		88.8% {
			transform: skewX(-0.1953125deg) skewY(-0.1953125deg) translate3d(-50%, -50%, 0);
		}
	}

	@keyframes pulse {
		from {
			transform: scale3d(1, 1, 1);
		}

		50% {
			transform: scale3d(1.05, 1.05, 1.05);
		}

		to {
			transform: scale3d(1, 1, 1);
		}
	}

	@keyframes shakeX {
		from,
		to {
			transform: translate3d(0, 0, 0);
		}

		10%,
		30%,
		50%,
		70%,
		90% {
			transform: translate3d(-10px, 0, 0);
		}

		20%,
		40%,
		60%,
		80% {
			transform: translate3d(10px, 0, 0);
		}
	}
</style>
