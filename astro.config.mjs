// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

// The site is statically generated. Keystatic injects two on-demand routes
// (`/keystatic` admin UI + `/api/keystatic`) that need a server runtime, which
// on Vercel run as Functions via the @astrojs/vercel adapter.
//
// `astro dev` serves those routes natively WITHOUT an adapter, so we only
// attach the adapter for `astro build` (Astro requires one to bundle the
// on-demand routes). We deliberately skip the adapter during `dev` because the
// server adapter's session-driver virtual module currently breaks Vite 7's dev
// import-analysis (it throws a bogus "invalid JS syntax / name with .jsx/.tsx"
// error on `virtual:astro:session-driver`).
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  output: 'static',
  ...(isDev ? {} : { adapter: vercel() }),
  integrations: [
    react(),
    keystatic(),
  ],
});
