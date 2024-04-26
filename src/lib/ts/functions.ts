import type { Sketch } from '$lib/types';
import { P5_WIDTH, P5_HEIGHT } from '$lib/ts/constants';
import type { Graphics } from 'p5';

const sketch: Sketch = (p5) => {
	let canvas: Graphics;

	p5.setup = () => {
		p5.createCanvas(P5_WIDTH, P5_HEIGHT);
		p5.frameRate(60);
		p5.noStroke();

		canvas = p5.createGraphics(P5_WIDTH, P5_HEIGHT);
		canvas.clear();
		canvas.background(0);
	};

	p5.draw = () => {
		p5.background('black');
		if (p5.millis() > 4000) {
			if (p5.mouseIsPressed) {
				p5.fill(255);
				p5.strokeWeight(5);
				p5.stroke(255);
				p5.ellipse(p5.mouseX, p5.mouseY, 10, 10);
			}

			p5.image(canvas, 0, 0);

			p5.fill(128);
			p5.noStroke();
			p5.ellipse(p5.mouseX, p5.mouseY, 10, 10);
		}
	};
};

export { sketch };
