/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static export — outputs to dist/ for Render Static Site hosting
    output: 'export',
    distDir: 'dist',

    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion']
    },
    images: {
        // Required when using output: 'export' — disable Next.js image optimisation
        // (it requires a Node server). Use plain <img> or set a custom loader.
        unoptimized: true,
        remotePatterns: [],
    },
}

export default nextConfig
