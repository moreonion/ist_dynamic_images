<script lang="ts">
	let { origin } = $props();

	import { getAllAvailableFontFamilies } from "../utils/fonts";

	let formData = $state({
		url: "https://demo2.impact-stack.org/node/2",
		width: "",
		height: "",
		bg: "",
		bar_bg: "",
		bar: "",
		text_colour: "",
		text: "",
		font: "",
		weight: "",
		format: "",
	});

	const fonts = getAllAvailableFontFamilies();

	const formats = ["png", "svg"];

	let generatedUrl = $derived.by(() => {
		const baseUrl = `${origin}/progress`;
		const params = new URLSearchParams();

		for (const [key, value] of Object.entries(formData)) {
			if (value) {
				params.append(key, value);
			}
		}

		return `${baseUrl}?${params.toString()}`;
	});

	// Debounced URL for the image
	let lastPromise;
	let lastValue = "";

	let debouncedUrl = $derived.by(() => {
		// If the URL hasn't changed, return the existing promise
		if (generatedUrl === lastValue && lastPromise) {
			return lastPromise;
		}

		// Store the current value
		lastValue = generatedUrl;

		// Create a new promise
		lastPromise = new Promise((resolve) => {
			setTimeout(() => {
				// Resolve with the most recent URL at the time of resolution
				resolve(generatedUrl);
			}, 500);
		});

		return lastPromise;
	});

	const placeholderText =
		"Total is {total}. Needed is {needed}. Target is {target}.";
</script>

<form class="space-y-6">
	<div class="space-y-2">
		<label
			for="url"
			class="flex flex-col"
		>
			Enter the link you want to make a live image about
			<small class="text-gray-500"
				>https://act.your-organisation.org/node/123</small
			>
		</label>
		<input
			type="url"
			name="url"
			id="url"
			bind:value={formData.url}
			placeholder="https://demo2.impact-stack.org/node/2"
			class="w-full p-2 border rounded"
		/>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<label for="width">Width</label>
			<p class="text-sm text-gray-500">Leave blank for 300</p>
			<input
				type="number"
				name="width"
				id="width"
				bind:value={formData.width}
				placeholder="300"
				class="w-full p-2 border rounded"
			/>
		</div>
		<div class="space-y-2">
			<label for="height">Height <span class="text-sm"></span></label>
			<p class="text-sm text-gray-500">Leave blank for 169</p>
			<input
				type="number"
				name="height"
				id="height"
				bind:value={formData.height}
				placeholder="169"
				class="w-full p-2 border rounded"
			/>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<label for="bg">Background Color (hex without #) </label>
			<p class="text-sm text-gray-500">Leave blank for transparent</p>
			<input
				type="text"
				name="bg"
				id="bg"
				bind:value={formData.bg}
				placeholder="f8fafc"
				class="w-full p-2 border rounded"
			/>
		</div>
		<div class="space-y-2">
			<label for="bar">Progress Bar Color (hex without #) </label>
			<p class="text-sm text-gray-500">Leave blank for #826BA3 – purple</p>
			<input
				type="text"
				name="bar"
				id="bar"
				bind:value={formData.bar}
				placeholder="FF5F00"
				class="w-full p-2 border rounded"
			/>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<label for="bar_bg">Bar Background Color (hex without #) </label>
			<p class="text-sm text-gray-500">Leave blank for 000000 – black</p>

			<input
				type="text"
				name="bar_bg"
				id="bar_bg"
				bind:value={formData.bar_bg}
				placeholder="CDCFD0"
				class="w-full p-2 border rounded"
			/>
		</div>
		<div class="space-y-2">
			<label for="text_colour">Text Color (hex without #) </label>

			<p class="text-sm text-gray-500">Leave blank for 000000 – black</p>
			<input
				type="text"
				name="text_colour"
				id="text_colour"
				bind:value={formData.text_colour}
				placeholder="191919"
				class="w-full p-2 border rounded"
			/>
		</div>
	</div>

	<div class="space-y-2">
		<label for="text">Custom Text</label>
		<small
			>Leave blank for "&#123;total&#125; people have taken action so far. We
			need &#123;needed&#125; more to reach &#123;target&#125;"</small
		>
		<textarea
			name="text"
			id="text"
			bind:value={formData.text}
			placeholder={placeholderText}
			class="w-full p-2 border rounded"
		></textarea>
		<small class="text-gray-500">You could adapt this: {placeholderText}</small>
	</div>

	<div class="space-y-2">
		<label for="font">Font</label>
		<p class="text-sm text-gray-500">Leave blank for Inter</p>
		<select
			name="font"
			id="font"
			bind:value={formData.font}
			class="w-full p-2 border rounded"
		>
			<option value="">--- Select a font ---</option>
			{#each fonts as font}
				<option value={font}>{font}</option>
			{/each}
		</select>
	</div>

	<div class="space-y-2">
		<label for="format">Image Format</label>
		<p class="text-sm text-gray-500">Leave blank for PNG</p>
		<select
			name="format"
			id="format"
			bind:value={formData.format}
			class="w-full p-2 border rounded"
		>
			<option value="">--- Select an image format ---</option>
			{#each formats as format}
				<option value={format}>{format}</option>
			{/each}
		</select>
	</div>
</form>

<section class="mt-6 p-4 bg-gray-50 rounded space-y-4">
	<div>
		<h2 class="font-bold mb-2">Generated URL:</h2>
		<div class="break-all bg-white p-2 rounded border">
			<a
				href={generatedUrl}
				class="will-change-auto underline"
				target="_blank">{generatedUrl}</a
			>
		</div>
	</div>

	{#await debouncedUrl}
		<div class="animate-pulse h-40 w-full">Loading...</div>
	{:then url}
		<h2 class="font-bold mb-2">Preview:</h2>

		<img
			src={url}
			class="border will-change-auto"
			alt="Generated"
		/>
	{/await}
</section>
