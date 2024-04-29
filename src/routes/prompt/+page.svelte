<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Counter from '$lib/components/Counter.svelte';
	import { timer, time, isRunning, isComplete } from '$lib/stores/timer-prompt';
	import { onMount } from 'svelte';

	let refTextarea: HTMLTextAreaElement;

	let id: string | null;
	let value = '';
	let name: string;
	let initiated = false;

	onMount(() => {
		id = $page.url.searchParams.get('id');
		name = sessionStorage.getItem(id as string) || 'Anonymous';
	});

	$: if ($isComplete) {
		setTimeout(() => {
			$isRunning = false;
			$isComplete = false;
			timer.reset();
			goto(`/scribble?id=${id}&prompt=${value}`);
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
<div id="prompt" class="relative">
	<textarea
		id="prompt-area"
		name="prompt"
		class="relative w-full h-full focus:outline-none p-6"
		maxlength="75"
		autocorrect="off"
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
		<p id="prompt-length" class="h-[51px] flex items-center" class:full={value.length === 75}>
			{value.length < 10 ? `0${value.length}` : value.length} / 75
		</p>
		<div id="prompter" class="px-2">{name}</div>
	</div>
</div>

<style lang="scss">
	#prompt {
		width: 1856px;
		height: 940px;
		border: 2px solid #6eebea;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-image: linear-gradient(to bottom, transparent, black);
			z-index: 1;
			pointer-events: none;
		}

		&::after {
			content: 'PROMPT';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: rgba(255, 255, 255, 0.075);
			text-align: center;
			font-family: 'JetBrains Mono';
			font-size: 376px;
			font-style: normal;
			font-weight: 800;
			line-height: normal;
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
				animation: pulse 0.75s linear infinite;
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
