import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// `next dev` and `next build` both write into distDir, so a single fixed value
// would make `npm run dev` overwrite the static export that `npm run start`
// serves. Point dev at .next and keep the export in dist/.
const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static export — outputs to dist/ for Render Static Site hosting
    output: 'export',
    distDir: isDev ? '.next' : 'dist',

    reactStrictMode: true,

    // Pin the trace root to this app. Without it Next walks up looking for a
    // lockfile and can pick a parent directory, which produces a spurious
    // "multiple lockfiles" warning and over-broad file tracing.
    outputFileTracingRoot: __dirname,

    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },

    images: {
        // Required when using output: 'export' — disable Next.js image optimisation
        // (it requires a Node server). Use plain <img> or set a custom loader.
        unoptimized: true,
        remotePatterns: [],
    },
}

export default nextConfig
