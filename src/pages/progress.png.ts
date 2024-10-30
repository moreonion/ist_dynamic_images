// Test URLs
// http://localhost:4321/progress.png?url=https://act.youngminds.org.uk/node/136&bg=f8fafc&bar=FF5F00&bar_bg=CDCFD0&text_colour=191919

// http://localhost:4321/progress.png?url=https://act.youngminds.org.uk/node/136

// http://localhost:4321/progress.png?url=https://act.youngminds.org.uk/node/116&bg=f8fafc&bar=FF5F00&bar_bg=CDCFD0&text_colour=191919

// Says supporters instead of default
// Total%20is%20%7Btotal%7D.%20Needed%20is%20%7Bneeded%7D.%20Target%20is%20%7Btarget%7D.
// Total is {total}. Needed is {needed}. Target is {target}.

// http://localhost:4321/progress.png?url=https://act.youngminds.org.uk/node/116&text=Total%20is%20%7Btotal%7D.%20Needed%20is%20%7Bneeded%7D.%20Target%20is%20%7Btarget%7D.



import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import type { APIRoute } from "astro";
import { calculateTarget } from "../utils/calculateTarget";

const ralewayRegularFontFile = readFileSync(
	`${process.cwd()}/public/fonts/Raleway-Regular.ttf`,
);
const ralewayBoldFontFile = readFileSync(
	`${process.cwd()}/public/fonts/Raleway-Bold.ttf`,
);



const URLSchema = z
	.string()
	.url()
	.regex(/\/node\/\d+/, {
		message:
			"URL must end in /node/ followed by a number, eg `https://action.earthcharity.org.uk/node/123`",
	});

const hexColor = z.string().regex(/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
	message: "Hex code must be a valid hex colour code without the #",
});

const colorSchema = z.string().nullish()
	.transform((value) => {
		if (!value) return null;
		return hexColor.safeParse(value).success ? '#' + value : value;
	});

const colorsSchema = z.object({
	bg: colorSchema.transform(val => val ?? 'transparent'),
	barBg: colorSchema.transform(val => val ?? '#000000'),
	bar: colorSchema.transform(val => val ?? '#826BA3'),
	text: colorSchema.transform(val => val ?? '#000000')
});


const widthSchema = z.coerce
	.number()
	.min(1)
	.catch(300); // Default width

const heightSchema = z.coerce
	.number()
	.min(1)
	.catch(169); // Default height

export const GET: APIRoute = async ({ url }) => {

	const searchParams = url.searchParams;

	// url is for the action URL. Accepts an Impact Stack node URL such as https://action.earthcharity.org.uk/node/136. Does not accept https://action.earthcharity.org.uk/my-action-name or https://action.earthcharity.org.uk/node/136/polling (with /polling on the end)

	// width is for the width of the image. Accepts a number. Default is 300.

	// height is for the height of the image. Accepts a number. Default is 169.

	// bg is for the background of the whole image. Accepts a hex colour code without the #. Default is transparent.

	// bar_bg is for the background of the bar. Accepts a hex colour code without the #. Default is black.

	// bar is for the bar itself. Accepts a hex colour code without the #. Default is purple.

	// text_colour is for the text. Accepts a hex colour code without the #. Default is black.

	// text is for the text. Accepts an encoded URL string. You can use {total}, {needed} and {target} placeholders to display the corresponding values. Default is `${submissions.total} people have taken action so far. We need ${submissions.needed} more to reach ${submissions.target}.`

	// This checks if the colour provided is a hexcode without the #
	// If it is, it adds the # to the start of the string
	// If it isn't, it sets bg to the default colour



	const colours = colorsSchema.parse({
		bg: searchParams.get('bg'),
		barBg: searchParams.get('bar_bg'),
		bar: searchParams.get('bar'),
		text: searchParams.get('text_colour')
	});

	const dimensions = {
		height: heightSchema.parse(searchParams.get('height')),
		width: widthSchema.parse(searchParams.get('width'))
	};

	const actionURL = searchParams.get("url");

	if (!actionURL) {
		return new Response(
			"No URL provided. Use `?url=https://action.earthcharity.org.uk/node/123`",
			{ status: 400 },
		);
	}

	const validatedURL = URLSchema.safeParse(actionURL);

	if (validatedURL.success === false) {
		const messages = validatedURL.error.issues
			.map((issue) => issue.message)
			.join(", ");
		return new Response(messages, { status: 400 });
	}

	type Submissions = {
		total: number;
		target: number;
		needed: number;
		percentage: number;
	};

	const submissions: Submissions = {
		total: 0,
		target: 0,
		needed: 0,
		percentage: 0,
	};

	try {
		const actionData = await fetch(`${actionURL}/polling`).then((res) =>
			res.json(),
		);
		submissions.total = actionData?.pgbar?.pgbar_default?.[0] || 0;
		submissions.target = calculateTarget(submissions.total);
		submissions.needed = submissions.target - submissions.total;
		submissions.percentage = Math.round((submissions.total / submissions.target) * 100);

	} catch (error) {
		return new Response(
			`Failed to fetch polling data for ${actionURL}. Check that the URL is correct`,
			{ status: 500 },
		);
	}


	const encodedText = searchParams.get("text");

	let text = `${submissions.total} people have taken action so far. We need ${submissions.needed} more to reach ${submissions.target}.`;


	if (encodedText !== null) {
		// Decode the URL-encoded text
		const templateText = decodeURIComponent(encodedText);

		// Replace placeholders with actual values

		text = templateText.replace(/\{(\w+)\}/g, (match, key: keyof Submissions) => {
			return submissions[key]?.toString() ?? match;
		});
	}




	const markup = html(`
<div
style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: ${colours.bg};"
>
	<div
	style="display: flex; width: 95%; height: 48px; border-radius: 8px; background-color: ${colours.barBg};">
		<div
			style="display: flex; width: ${submissions.percentage}%; margin: 4px; border-radius: 4px; background-color: ${colours.bar};"></div>
		</div>
	<div style="display: flex; margin: 0 4px; color: ${colours.text};">
		<p>${text}</p>
	</div>
</div>
  `);

	try {
		const satoriOptions: SatoriOptions = {
			width: dimensions.width,
			height: dimensions.height,
			debug: false,
			fonts: [
				{
					name: "Raleway",
					data: ralewayRegularFontFile,
					weight: 400,
					style: "normal",
				},
				{
					name: "Raleway",
					data: ralewayBoldFontFile,
					weight: 700,
					style: "normal",
				},
			],
		};

		const svg = await satori(markup, satoriOptions);

		const resvgOptions: ResvgRenderOptions = {
			background: "transparent",

			font: {
				fontFiles: ['./public/fonts/Raleway-Regular.ttf'], // Load custom fonts.
				loadSystemFonts: false, // Faster to disable loading system fonts.
				defaultFontFamily: 'RalewayRegular', // Set the default font family.
			},
			imageRendering: 1, // 0: optimizeQuality, 1: optimizeSpeed,
			textRendering: 2, // 0: optimizeSpeed, 1: optimizeLegibility, 2: geometricPrecision
			shapeRendering: 2, // 0: optimizeSpeed, 1: crispEdges, 2: geometricPrecision
			logLevel: 'error', // 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
		};

		// Render PNG
		const resvg = new Resvg(svg, resvgOptions);
		const pngData = resvg.render();
		const pngBuffer = pngData.asPng();

		// Return the image
		return new Response(pngBuffer, {
			status: 200,
			headers: {
				"Content-Type": "image/png",
				// "Cache-Control": "public, max-age=31536000",
			},
		});

	} catch (error) {
		console.error("Error generating image:", error);
		return new Response("Error generating image", { status: 500 });
	}


};
