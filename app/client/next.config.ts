import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    // Use `standalone` output for production builds on non-Windows platforms
    // because creating the standalone output copies many node_modules entries
    // and on Windows this can attempt to create symlinks which often fail
    // with EPERM (unless Developer Mode or admin privileges are enabled).
    // Avoid `standalone` on Windows to prevent EPERM symlink errors during
    // local builds. Production CI / Docker (Linux) builds will still use
    // standalone when run on non-Windows runners.
    output:
        process.env.NODE_ENV === "production" && process.platform !== "win32"
            ? "standalone"
            : undefined,

    // Image optimization for Docker
    images: {
        unoptimized: process.env.NODE_ENV === "production",
        remotePatterns: process.env.NEXT_PUBLIC_IMAGE_DOMAINS
            ? process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(",").map(
                  (domain) => ({
                      protocol: "https",
                      hostname: domain.trim(),
                      port: "",
                      pathname: "/**",
                  })
              )
            : [],
    },

    // Webpack configuration to handle Node.js modules
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Don't resolve these modules on client-side
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
                child_process: false,
                vm: false,
            };
        }
        return config;
    },

    // Mark packages that use Node.js APIs as external for client
    experimental: {
        serverComponentsExternalPackages: [
            "qrcode",
            "canvas",
            "konva",
            "i18next",
            "i18next-browser-languagedetector",
        ],
    },

    // Transpile specific packages if needed
    transpilePackages: ["i18next", "react-i18next"],
};

export default nextConfig;
