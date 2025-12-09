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

    // Mark packages that use Node.js APIs as external (moved from experimental in Next.js 16)
    serverExternalPackages: [
        "qrcode",
        "canvas",
        "konva",
    ],

    // Transpile specific packages if needed
    transpilePackages: ["i18next", "react-i18next", "i18next-browser-languagedetector"],

    // Turbopack configuration (Next.js 16 uses Turbopack by default)
    // Empty config to suppress webpack warning
    turbopack: {},

    // Generate build ID based on git commit to force cache invalidation
    generateBuildId: async () => {
        // Use git commit hash as build ID, fallback to timestamp
        if (process.env.GITHUB_SHA) {
            return process.env.GITHUB_SHA.substring(0, 7);
        }
        return `build-${Date.now()}`;
    },

    // Headers for cache control
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: process.env.NODE_ENV === "production"
                            ? "public, max-age=0, must-revalidate"
                            : "no-store, must-revalidate",
                    },
                ],
            },
            {
                source: "/_next/static/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
