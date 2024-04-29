import type { Sketch } from '$lib/types';
import { Automatic1111 } from '$lib/api/auto1111';
import { P5_FRAME_RATE, P5_HEIGHT, P5_WIDTH } from './constants';
import type { Graphics } from 'p5';
import { auto1111Process } from '$lib/stores/auto1111-process';

export let canvas: Graphics;
export let auto1111: Automatic1111;
export let state = 'showCanvas';

export async function generateImages(prompt: string, setState = true) {
	if (setState) state = 'showImage';
	return await auto1111.txtToImg(prompt, canvas, 'control_v11p_sd15_scribble [d4ba51ff]');
}

export function clearCanvas() {
	canvas.clear();
	canvas.background(0);
}

export const sketch: Sketch = (p5) => {
	p5.setup = () => {
		p5.createCanvas(P5_WIDTH, P5_HEIGHT);
		p5.frameRate(P5_FRAME_RATE);

		//Communication to Automatic1111
		auto1111 = new Automatic1111(
			p5,
			'https://companion-noble-diving-introducing.trycloudflare.com/'
		);

		auto1111.getControlnetInfo();

		canvas = p5.createGraphics(p5.width, p5.height);
		canvas.clear();
		canvas.background(0);
	};

	p5.draw = () => {
		switch (state) {
			case 'showCanvas': {
				if (p5.mouseIsPressed) {
					canvas.fill(255);
					canvas.strokeWeight(5);
					canvas.stroke('#6EEBEA');
					//canvas.ellipse(mouseX, mouseY, 10, 10);
					canvas.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
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
