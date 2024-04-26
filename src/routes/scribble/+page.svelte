<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { timer, time, isComplete } from '$lib/stores/timer-scribble';
	import Counter from '$lib/components/Counter.svelte';
	import P5 from 'p5-svelte';
	import type { Sketch } from '$lib/types';
	import { Simple1111Api } from '$lib/api/auto1111';

	let interval: number;
	let isTriggered = false;

	let initiated = false;
	let id: string;
	let prompt: string;
	let name: string;

	let video;
	let predictions = [];
	let canvas;
	let auto1111;
	let state = 'showCanvas';
	let myInput;
	let autoImgReady = false;
	let res = 512;

	const sketch: Sketch = (p5) => {
		p5.setup = () => {
			p5.createCanvas(res, res);
			p5.frameRate(60);

			//Communication to Automatic1111
			auto1111 = new Simple1111Api(
				p5,
				'https://companion-noble-diving-introducing.trycloudflare.com/'
			);

			auto1111.getControlnetInfo();

			canvas = p5.createGraphics(p5.width, p5.height);
			canvas.clear();
			canvas.background(0);

			// UI elemets
			myInput = p5.createInput('Type your prompt here ...');
			myInput.position(0, p5.height);
			myInput.size(p5.width);
			print(myInput);

			myInput.height = 25;

			// Button for generating the image
			let GenerateImagebutton = p5.createButton('Generate Image');
			GenerateImagebutton.position(0, p5.height + myInput.height); // set the x y position of the Button -> button.position(x,y);
			GenerateImagebutton.mousePressed(generateImage); // Which function to be called if clicked

			// Button to show the canvas again
			let togglebutton = p5.createButton('Show Canvas');
			togglebutton.position(GenerateImagebutton.width, p5.height + myInput.height);
			togglebutton.mousePressed(toggleCanvas);

			// Button to clear the canvas for a new drawing
			let clearCanvasbutton = p5.createButton('Clear Canvas');
			clearCanvasbutton.position(
				GenerateImagebutton.width + togglebutton.width,
				p5.height + myInput.height
			);
			clearCanvasbutton.mousePressed(clearCanvas);
		};

		p5.draw = () => {
			switch (state) {
				// Zeichnen Modus:
				case 'showCanvas':
					// Zeichne auf einem seperaten Canvas ellipse -> für Controlnet als Inputbild
					if (p5.mouseIsPressed) {
						canvas.fill(255);
						canvas.strokeWeight(5);
						canvas.stroke(255);
						//canvas.ellipse(mouseX, mouseY, 10, 10);
						canvas.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
					}

					p5.image(canvas, 0, 0);

					// Zeige die Position der Maus aus dem Canvas
					p5.fill(128);
					p5.noStroke();
					p5.ellipse(p5.mouseX, p5.mouseY, 10, 10);
					break;

				// Zeige Generiertes Bild Modus:
				case 'showImage':
					if (auto1111.img) {
						if (auto1111.isProcessing) {
							infoText();
						} else {
							p5.image(auto1111.img, 0, 0, res, res);
						}
					}
					break;
			}
		};

		function infoText() {
			// Infotext so you know that Stable Diffusion is doing somthing
			p5.noStroke();
			p5.fill(255, 255, 0);
			p5.rect(15, p5.height / 2 - 13, 200, 20);
			p5.fill(0);
			p5.text('generating Image please wait ...', 20, p5.height / 2);
		}

		function generateImage() {
			// read the prompt from the inputfield
			let prompt = myInput.value();
			// auto1111.txtToImg("prompt", ImageForControlnet, "TpyeOfControlnet")
			auto1111.txtToImg(prompt, canvas, 'control_v11p_sd15_scribble [d4ba51ff]');
			// switch the state to show the final generated image
			state = 'showImage';
		}

		function toggleCanvas() {
			// switch the state to show the Canvas
			state = 'showCanvas';
		}

		function clearCanvas() {
			canvas.clear();
			canvas.background(0);
		}
	};

	onMount(() => {
		id = $page.url.searchParams.get('id')!;
		name = sessionStorage.getItem(id as string) || 'Anonymous';
		prompt = $page.url.searchParams.get('prompt')!;

		interval = setInterval(() => {
			isTriggered = !isTriggered;
		}, 6500);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<Counter
	end="Scribble!"
	onEnd={() => {
		initiated = true;
		setTimeout(() => {
			timer.start();
			document.querySelectorAll('.marquee').forEach((marquee) => {
				marquee.classList.add('fade');
			});
		}, 1500);
	}}
/>
<div id="scribble" class="relative grid p-4">
	<div id="prompt-text" class="relative w-full h-[152px] p-4">
		<p>{prompt}</p>
		<div class="absolute left-0 bottom-0">Prompt</div>
	</div>
	<div id="canvas" class="relative flex justify-center items-end" class:jello={isTriggered}>
		<P5 {sketch} />
	</div>
	<div id="prompt-footer" class="flex justify-between items-end">
		<div id="prompt-clock" class="flex flex-col justify-center">
			<p>time remaining:</p>
			<p class:completing={+$time.slice(3) <= 10 && $time[1] !== '1'} class:complete={$isComplete}>
				{$time}
			</p>
		</div>
		<div id="prompter" class="px-2">{name}</div>
	</div>
</div>

<style lang="scss">
	#scribble {
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

	#prompt-text {
		margin: 0 auto;
		flex-shrink: 0;
		border: 2px solid #6eebea;
		background: #000;
		color: #6eebea;
		font-size: 21px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
		user-select: none;

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

		div {
			width: 260px;
			height: 51px;
			flex-shrink: 0;
			border-top: 2px solid #6eebea;
			border-right: 2px solid #6eebea;
			color: #fff;
			text-align: center;
			font-size: 36px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
			background-color: #1c1f22;
			z-index: 2;
		}
	}

	#canvas {
		padding-bottom: 124px;
		z-index: 1;

		&.jello::after {
			animation: jello 1s ease-in-out;
		}

		&::after {
			content: 'SCRIBBLE';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: rgba(255, 255, 255, 0.05);
			text-align: center;
			font-size: 89px;
			font-style: normal;
			font-weight: 800;
			line-height: normal;
			transform-origin: center center;
			pointer-events: none;
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

			&.completing {
				animation: pulse 0.75s linear infinite;
			}

			&.complete {
				color: #ff3838;
				animation: shakeX 1s linear;
			}
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
