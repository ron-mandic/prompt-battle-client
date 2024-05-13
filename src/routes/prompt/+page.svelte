<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Counter from '$lib/components/Counter.svelte';
	import { timer, time, isRunning, isComplete, resetTimer } from '$lib/stores/timer-prompt';
	import { promptValue } from '$lib/stores/prompt-value';
	import { auto1111Images } from '$lib/stores/auto1111-images';
	import { onDestroy, onMount } from 'svelte';
	import { Socket, io } from 'socket.io-client';
	import { BATCH_SIZE } from '$lib/ts/constants';

	const socket: Socket = io('http://localhost:3000', {
		reconnection: true
	});

	let refTextarea: HTMLTextAreaElement;

	let id: string | null;
	let value: string;
	let name: string;
	let initiated = false;

	let dataPrompt: string;
	let dataGUUID: string;
	let maxLength = 1500;

	let uuid: string;
	let mode: string;
	const URL = 'https://companion-noble-diving-introducing.trycloudflare.com/sdapi/v1/txt2img/';

	let payload;
	let requestOptions;

	async function generateImages(url: string, requestoptions: RequestInit) {
		return await fetch(url, requestoptions)
			.then((res) => res.json())
			.then((data) => {
				return data.images;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	function handleInput(event: InputEvent) {
		value = (event.target as HTMLTextAreaElement).value;

		socket.emit('c:sendClientPrompt', { id, value });
	}

	onMount(() => {
		id = $page.url.searchParams.get('id')!;
		uuid = $page.url.searchParams.get('uuid')!;
		mode = $page.url.searchParams.get('mode')!;

		socket.on('connect', () => {
			socket.emit('c:initClient', id).emit('c:requestEvent', 's:sendPromptBattle');
		});

		socket.on('s:sendPromptBattle', ({ guuid, player0, player1, prompts, currentRound }) => {
			name = id === '1' ? player0 : player1;
			dataPrompt = prompts[currentRound - 1];
			dataGUUID = guuid;

			$page.url.searchParams.set('guuid', dataGUUID);
			goto(`?${$page.url.searchParams.toString()}`); // ...&guuid=g-...
		});
	});

	onDestroy(() => {
		resetTimer();
	});

	$: if ($isComplete) {
		$promptValue = value;

		setTimeout(async () => {
			$isRunning = false;
			$isComplete = false;
			timer.reset();

			switch (mode) {
				case 'p': {
					payload = {
						prompt: value,
						steps: 20,
						cfg_scale: 6,
						width: 512,
						height: 512,
						batch_size: BATCH_SIZE + 1,
						alwayson_scripts: {}
					};

					requestOptions = {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(payload)
					};

					auto1111Images.set(generateImages(URL, requestOptions));
					goto(`results?id=${id}&uuid=${uuid}&mode=${mode}&guuid=${dataGUUID}`);
					break;
				}
				case 'ps': {
					goto(`scribble?id=${id}&uuid=${uuid}&mode=${mode}&guuid=${dataGUUID}`);
					break;
				}
			}
			socket.emit('c:sendRoute/prompt', id);
		}, 2000);
	}
</script>

<svelte:head>
	<title>Prompt by {name}</title>
</svelte:head>

<Counter
	onEnd={() => {
		initiated = true;
		refTextarea.focus();
		setTimeout(() => {
			timer.start();
			document.querySelectorAll('.marquee').forEach((marquee) => {
				marquee.classList.add('fade');
			});
		}, 1500);
	}}
/>
<div id="prompt" class="relative" data-prompt={dataPrompt}>
	<textarea
		id="prompt-area"
		name="prompt"
		class="relative w-full h-full focus:outline-none p-6"
		maxlength={maxLength}
		autocorrect="off"
		on:input={handleInput}
		bind:this={refTextarea}
		bind:value
	/>
	<div id="prompt-footer" class="flex justify-between items-end">
		<div id="prompt-clock" class="flex flex-col justify-center">
			<p>time remaining:</p>
			<p class:completing={+$time.slice(3) <= 10 && $time[1] !== '1'} class:complete={$isComplete}>
				{$time}
			</p>
		</div>
		<p
			id="prompt-length"
			class="h-[51px] flex items-center"
			class:full={value?.length === maxLength}
		>
			{value === undefined
				? 0
				: (value.length < 10 ? `0${value.length}` : value.length.toString()).padStart(4, '0')} / {maxLength}
		</p>
		<div id="prompter" class="px-2">{name || '...'}</div>
	</div>
</div>

<style lang="scss">
	#prompt {
		width: 1856px;
		height: 940px;
		border: 2px solid #6eebea;

		&::after {
			content: attr(data-prompt);
			position: absolute;
			top: 50%;
			left: 50%;
			width: 90%;
			transform: translate(-50%, -50%);
			color: rgba(255, 255, 255, 0.125);
			text-align: center;
			font-size: 4rem;
			font-style: normal;
			font-weight: 800;
			line-height: normal;
			text-wrap: balance;
			z-index: -1;
		}
	}

	#prompt-area {
		background-color: transparent;
		color: #6eebea;
		font-family: 'JetBrains Mono';
		font-size: 62px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
		resize: none;

		&::-webkit-scrollbar {
			width: 10px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			background: #6eebea;
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
			font-family: 'JetBrains Mono';
			font-size: 24px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
		}

		p:nth-child(2) {
			color: #fff;
			text-align: center;
			font-family: 'JetBrains Mono';
			font-size: 68px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;

			&.completing {
				animation: pulse 1s linear infinite;
			}

			&.complete {
				color: #ff3838;
				animation: shakeX 1s linear;
			}
		}
	}

	#prompt-length {
		color: #6eebea;
		font-size: 1.25rem;

		&.full {
			animation: shakeX 1s ease;
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
		font-family: 'JetBrains Mono';
		font-size: 36px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		background-color: #1c1f22;
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
