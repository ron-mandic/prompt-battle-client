<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auto1111Images } from '$lib/stores/auto1111-images';
	import Loader from '$lib/components/Loader.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import Counter from '$lib/components/Counter.svelte';
	import { BATCH_SIZE } from '$lib/ts/constants';
	import { onMount, tick } from 'svelte';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { handleImageClick } from '$lib/ts/functions';
	import { Confetti } from 'svelte-confetti';
	import { socket } from '$lib/ts/variables';
	import { EBannerText } from '$lib/ts/enums';

	let id: string, name: string, prompt: string;
	let selected = false;
	let visible = false;
	let selectedIndex: number;

	let hasAwarded = false;
	let haveWon: undefined | -1 | 0 | 1;
	let isRedirecting = false;
	let mode: string;

	let message: string;

	onMount(async () => {
		id = $page.url.searchParams.get('id')!;
		mode = $page.url.searchParams.get('mode')!;
		prompt = $page.url.searchParams.get('prompt')!;

		socket.on('connect', () => {
			socket.emit('c:initClient', id).emit('c:requestEvent', 's:sendPromptBattle');
		});
		socket.on('s:sendPromptBattle', ({ player0, player1 }) => {
			name = id === '1' ? player0 : player1;
		});

		socket.on('s:sendGameStats', (_id) => {
			setTimeout(() => {
				switch (_id) {
					case undefined: {
						haveWon = -1;
						break;
					}
					default: {
						haveWon = _id === id ? 1 : 0;
						setTimeout(() => {
							hasAwarded = true;
						}, 6000);
						break;
					}
				}

				console.log(_id, id, haveWon); // undefined '2' 0
			}, 2000);
		});

		socket.on('s:prepareClient', (_message) => {
			message = _message;
			isRedirecting = true;
		});

		setTimeout(() => {
			document.querySelectorAll('.marquee').forEach((marquee) => {
				marquee.classList.add('fade');
			});
		}, 1500);
	});
</script>

<svelte:head>
	<title>Results for {name}</title>
</svelte:head>

<div id="results" class="relative">
	<div id="prompt-results" class="relative flex justify-center items-center" class:selected>
		{#if isRedirecting}
			<Counter
				--background-overlay="transparent"
				end="Carry on!"
				onEnd={() => {
					console.log(message);

					switch (message) {
						case 'round=current': {
							console.log("I'm here. Current");

							goto(`/prompt?${$page.url.searchParams.toString()}`);
							break;
						}
						case 'round=new': {
							console.log("I'm here. New");

							goto('/');
							break;
						}
						default:
							break;
					}
				}}
			/>
		{:else if haveWon === undefined && !hasAwarded && !isRedirecting}
			{#await $auto1111Images}
				{#each new Array(BATCH_SIZE) as _, i}
					<div class="image loader bg-black flex justify-center items-center">
						<Loader --delay={i} />
					</div>
				{/each}
			{:then images}
				{#if !selected}
					{@const args =
						mode === 'p' ? images.slice(0, images.length - 1) : images.slice(0, images.length - 2)}
					{#each args as image, i}
						<button
							class="image bg-black flex justify-center items-center"
							data-i={i}
							on:click={(e) => {
								selectedIndex = +handleImageClick(e);
								selected = true;

								setTimeout(async () => {
									visible = true;
									await tick();

									socket.emit('c:sendImageInfo/results', {
										id,
										imageIndex: i
									});
									socket.emit('c:sendImage/results', {
										id,
										image
									});

									setTimeout(() => {
										visible = false;
									}, 3500);
								}, 1500);
							}}
						>
							{#if images.length}
								<img
									class="w-full h-full"
									src={`data:image/png;base64,${image}`}
									alt={`${prompt} (${i})`}
									in:scale={{
										duration: 500,
										delay: 500,
										opacity: 0.5,
										start: 0.5,
										easing: quintOut
									}}
								/>
							{/if}
						</button>
					{/each}
				{:else}
					{#if visible}
						<div id="confetti" class="pointer-events-none">
							<Confetti
								x={[-5, 5]}
								y={[-5, 5]}
								xSpread={0.125}
								size={30}
								duration={3500}
								amount={250}
								fallDistance="400px"
								colorArray={['#ED3A4F', '#0091B5', '#FDB913']}
							/>
						</div>
					{/if}
					<div
						class="image-large bg-black flex justify-center items-center"
						in:scale={{ duration: 500, delay: 150, opacity: 0.5, start: 0.5, easing: quintOut }}
					>
						<img
							src={`data:image/png;base64,${images[selectedIndex]}`}
							alt={`${prompt} (${selectedIndex})`}
						/>
					</div>
				{/if}
			{/await}
		{:else if haveWon === -1 && !hasAwarded && !isRedirecting}
			<Banner innerText={EBannerText.ROUND} />
		{:else if haveWon === 0 && !hasAwarded && !isRedirecting}
			<Banner innerText={EBannerText.LOSS} />
		{:else if haveWon === 1 && !hasAwarded && !isRedirecting}
			<Banner innerText={EBannerText.WIN} />
		{:else if haveWon === 0 && hasAwarded && !isRedirecting}
			<Banner innerText={EBannerText.ROUND} />
		{:else if haveWon === 1 && hasAwarded && !isRedirecting}
			<Banner innerText={EBannerText.ROUND} />
		{/if}
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

	#confetti {
		width: 100px;
		height: 100px;
		top: 50%;
		left: 50%;
		transform: translate(calc(-50% + 50px), calc(-50% + 50px));
		position: absolute;
		background-color: transparent;
	}

	#prompt-results {
		width: 100%;
		height: 816px;
		gap: 2rem;

		&.selected {
			height: 100%;
		}
	}

	button {
		all: unset;
	}

	.image {
		width: 528px;
		height: 528px;
		padding: 0.5rem;
		aspect-ratio: 1 / 1;
		flex-shrink: 0;
		border: 2px solid #6eebea;
		transition: translate 0.5s ease-in-out;

		&:not(.loader):hover {
			cursor: pointer;
			translate: 0 -10px;
			transition: translate 0.25s cubic-bezier(0.86, 0, 0.07, 1);
		}
	}

	.image-large {
		width: 876px;
		height: 876px;
		padding: 0.5rem;
		aspect-ratio: 1 / 1;
		flex-shrink: 0;
		border: 2px solid #6eebea;

		img {
			width: 100%;
			height: auto;
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
