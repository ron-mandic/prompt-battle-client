<script>
	import { TEXT_P } from '$lib/ts/constants';

	// Credits: https://codepen.io/hexagoncircle/pen/eYMrGwW
	export let position = 'top';
	export let direction = 'left';

	let arrMarquee = Array(6).fill(TEXT_P);
</script>

<div class={`marquee pos-${position}`}>
	<ul class={`marquee__content dir-${direction}`}>
		{#each arrMarquee as item}
			<li>{@html item}</li>
		{/each}
	</ul>

	<ul class={`marquee__content dir-${direction}`} aria-hidden="true">
		{#each arrMarquee as item}
			<li>{@html item}</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.marquee {
		--gap: 4rem; // 64px

		position: fixed;
		display: flex;
		overflow: hidden;
		user-select: none;
		max-width: 1920px;
		gap: var(--gap);

		&.pos-top {
			top: 0;
		}
		&.pos-bottom {
			bottom: 0;
		}
	}

	.marquee__content {
		flex-shrink: 0;
		display: flex;
		justify-content: space-around;
		gap: var(--gap);
		min-width: 100%;
		list-style: none;
		will-change: transform;

		&.dir-left {
			animation: scroll-left 50s linear infinite;
		}
		&.dir-right {
			animation: scroll-right 50s linear infinite;
		}
	}

	.marquee__content li {
		text-transform: uppercase;
		color: #fff;
		font-size: 36.25px;
		font-style: normal;
		font-weight: 800;
		line-height: normal;
	}

	@keyframes scroll-left {
		from {
			transform: translate3D(0, 0, 0);
		}
		to {
			transform: translate3D(calc(-100% - var(--gap)), 0, 0);
		}
	}

	@keyframes scroll-right {
		from {
			transform: translate3D(calc(-100% - var(--gap)), 0, 0);
		}
		to {
			transform: translate3D(0, 0, 0);
		}
	}
</style>
