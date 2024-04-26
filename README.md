# Project

## [Missing exports condition](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md#missing-exports-condition)

```json
{
	// ....
	"type": "module",
	"svelte": "index.js",
	"exports": {
		"./package.json": "./package.json",
		"./P5.svelte": "./P5.svelte",
		".": {
			"svelte": "./index.js"
		}
	}
}
```
