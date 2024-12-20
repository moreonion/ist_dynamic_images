// @ts-check
import { defineConfig } from 'astro/config';

import netlify from "@astrojs/netlify";

import svelte from "@astrojs/svelte";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: netlify(),
  integrations: [svelte(), tailwind()],
});