<script>
	import P5 from 'p5-svelte';

	const sketch = (p5) => {
		let t = 0; // time variable

		p5.setup = () => {
			p5.createCanvas(865, 400);
			p5.noStroke();
			p5.fill('#ed225d');
		};

		p5.draw = () => {
			p5.background(10, 0.5); // translucent background (creates trails)

			if (p5.mouseIsPressed) {
				p5.fill(255);
				p5.strokeWeight(5);
				p5.stroke(255);
				//canvas.ellipse(mouseX, mouseY, 10, 10);
				p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
			}
		};
	};
</script>

<P5 {sketch} />
