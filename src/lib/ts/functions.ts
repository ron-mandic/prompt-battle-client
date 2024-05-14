export function handleImageClick(event: MouseEvent) {
	const refElement = event.currentTarget! as HTMLButtonElement;
	const i = refElement.dataset.i!;
	return i;
}
