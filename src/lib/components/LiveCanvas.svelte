<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import P5 from 'p5-svelte';
	import type { Graphics } from 'p5';
	import type { Sketch } from '$lib/types';
	import { Automatic1111 } from '$lib/api/auto1111';
	import {
		CANVAS_SOCKET_EACH_SECONDS,
		P5_FRAME_RATE,
		P5_HEIGHT,
		P5_WIDTH,
		URL_SERVER_SD
	} from '$lib/ts/constants';
	import { auto1111Process } from '$lib/stores/auto1111-process';
	import { PUBLIC_ID } from '$env/static/public';
	import type { Socket } from 'socket.io-client';

	export let socket: Socket;
	export async function generateImages(prompt: string, setState = true) {
		if (setState) state = 'showImage';
		return await auto1111.txtToImg(prompt || ' ', canvas, 'control_v11p_sd15_scribble [d4ba51ff]');
	}
	export function sayHello() {
		console.log('Hello from LiveCanvas');
	}

	let sketch: Sketch;
	let canvas: Graphics;
	let auto1111: Automatic1111;
	let state = 'showCanvas';

	const arrLines: { x1: number; y1: number; x2: number; y2: number }[] = [];

	function createSketch() {
		sketch = (p5) => {
			p5.setup = () => {
				p5.createCanvas(P5_WIDTH, P5_HEIGHT);
				p5.frameRate(P5_FRAME_RATE);

				//Communication to Automatic1111
				auto1111 = new Automatic1111(p5, URL_SERVER_SD);

				auto1111.getControlnetInfo();

				canvas = p5.createGraphics(p5.width, p5.height);
				canvas.clear();
				canvas.background(0);
			};

			p5.draw = () => {
				if (arrLines.length > 0 && p5.frameCount % CANVAS_SOCKET_EACH_SECONDS === 0) {
					socket.emit('c:sendCanvasData', {
						id: PUBLIC_ID,
						data: arrLines
					});
				}

				switch (state) {
					case 'showCanvas': {
						if (p5.mouseIsPressed) {
							canvas.fill(255);
							canvas.strokeWeight(5);
							canvas.stroke('#6EEBEA');
							//canvas.ellipse(mouseX, mouseY, 10, 10);
							canvas.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);

							arrLines.push({
								x1: p5.mouseX,
								y1: p5.mouseY,
								x2: p5.pmouseX,
								y2: p5.pmouseY
							});
						}

						p5.image(canvas, 0, 0);

						// Zeige die Position der Maus aus dem Canvas
						p5.fill('#6EEBEA');
						p5.noStroke();
						p5.ellipse(p5.mouseX, p5.mouseY, 10, 10);
						break;
					}

					case 'showImage': {
						if (auto1111.img) {
							if (auto1111.isProcessing) {
								// TODO: Show loading indicator
								auto1111Process.set(0);
							} else {
								// p5.image(auto1111.img, 0, 0, P5_WIDTH, P5_HEIGHT);
								auto1111Process.set(1);
							}
						}
						break;
					}
				}
			};
		};
	}

	onMount(() => {
		createSketch();

		return () => {
			canvas.clear();
			canvas.background(0);
			console.log('LiveCanvas destroyed');
		};
	});

	onDestroy(() => {
		arrLines.length = 0;
	});
</script>

<P5 {sketch} />

<style lang="scss">
	:where(canvas) {
		background: black;
	}
</style>
