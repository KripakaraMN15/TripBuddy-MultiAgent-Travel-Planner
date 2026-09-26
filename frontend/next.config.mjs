/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion']
    },
    images: {
        remotePatterns: [],
    },
}

export default nextConfig
