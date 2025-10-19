import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

    // Image optimization for Docker
    images: {
        unoptimized: process.env.NODE_ENV === 'production',
    },
};

export default nextConfig;
