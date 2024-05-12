<script lang="ts">
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { goto } from '$app/navigation';
	import { TEXT_H1 } from '$lib/ts/constants';
	import { Socket, io } from 'socket.io-client';
	// Load unique ID from environment variable

	const id = uuidv4();
	let socket: Socket = io('http://localhost:3000', {
		reconnection: true
	});

	let refTerminal: HTMLDivElement;
	let refInput: HTMLInputElement;

	let hasEntered = false;
	let isStarting = false;

	let playerName;
	let playerNumber = '?';

	// TODO: Delete when done
	const getPort = () => {
		// return window.location.port;
		const port = uuidv4().slice(0, 4);
		sessionStorage.setItem('0', port);

		return port;
	};

	onMount(() => {
		// TODO: Delete when done
		sessionStorage.clear();

		socket.on('connect', () => {
			socket.emit('c:initClient', getPort());
		});

		socket.on('s:setPlayerNumber', (data) => {
			playerNumber = data;
		});

		refInput.focus();

		return () => {
			socket.disconnect();
		};
	});
</script>

<svelte:head>
	<title>AI + D Lab - Prompt Battle</title>
</svelte:head>

<div class="w-full max-w-[1419px] m-auto">
	<h1 class="uppercase text-center w-full">{@html TEXT_H1}</h1>
	<section id="terminal" class="p-2">
		<p>/Player {playerNumber} &gt; ./Prompt_Battle</p>
		<p>Prompt_Battle loading...</p>
		<p>Loading complete!</p>

		<p class="mt-16">Enter your name!</p>

		<div
			id="terminal-input"
			class="relative mt-16"
			class:changed={isStarting}
			bind:this={refTerminal}
		>
			<label>
				<span>/Player {playerNumber} &gt;</span>
				<input
					type="text"
					name="player"
					maxlength="20"
					autocomplete="off"
					autocorrect="off"
					on:blur={() => {
						refInput.focus();
						return false;
					}}
					on:input={() => {
						refTerminal.style.setProperty('--offset', `${refInput.value.length * 30}px`);
					}}
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							hasEntered = true;
						}
						playerName = refInput.value;
						socket.emit('c:setPlayerNames', { playerNumber, playerName });
					}}
					bind:this={refInput}
				/>
			</label>
		</div>
		{#if hasEntered && !isStarting}
			<p id="terminal-indicator" class="w-full">waiting</p>
		{:else if hasEntered && isStarting}
			<p id="terminal-indicator" class="w-full">starting</p>
		{/if}
	</section>
</div>

<style lang="scss">
	h1 {
		font-size: clamp(4rem, 12vw, 170px);
	}

	#terminal {
		border: 2px solid #6eebea;
		background-color: #1c1f22;
		animation: slide-in-up 1s ease;
		will-change: transform;

		p,
		label {
			color: #6eebea;
			font-family: 'JetBrains Mono';
			font-size: 50px;
			font-style: normal;
			font-weight: 700;
			line-height: normal;
		}
	}

	#terminal-input {
		input {
			position: relative;
			color: #fff;
			background-color: transparent;
			font-family: 'JetBrains Mono';
			font-size: 50px;
			font-style: normal;
			font-weight: 700;
			line-height: normal;

			caret-color: transparent;

			&::after {
				content: '|';
				animation: blink 1s infinite;
			}

			&:focus {
				outline: none;
			}
		}

		&:not(.changed)::after {
			content: '';
			position: absolute;
			top: 0;
			left: calc(22.5rem + var(--offset, 0px));
			display: inline-block;
			background-color: #fff;
			vertical-align: top;
			width: 27.5px;
			height: 66px;
			-webkit-animation: blink 1s step-end infinite;
			animation: blink 1s step-end infinite;
			border: none;
		}
	}

	// #terminal-indicator {
	// 	animation: blink 1s infinite;
	// }

	@keyframes slide-in-up {
		0% {
			transform: translateY(-5rem);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
