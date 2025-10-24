import { Metadata } from "next";
import { EyesDisplay, NotFoundContent } from "@/components/error-pages";

export const metadata: Metadata = {
    title: "404 - Page Not Found | Restaurant Management",
    description: "The page you're looking for doesn't exist. Return to the homepage.",
    robots: {
        index: false,
        follow: true,
    },
};

/**
 * Not Found (404) Page
 * Displays when a requested route doesn't exist
 * Features:
 * - Animated eyes that follow cursor
 * - Responsive design
 * - Proper SEO metadata
 */
export default function NotFound() {
    return (
        <>
            <script type="application/ld+json" suppressHydrationWarning>
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    name: "404 - Page Not Found",
                    description:
                        "The page you're looking for doesn't exist.",
                })}
            </script>
            <main className="min-h-screen relative bg-[#242424] text-white overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-[#3d6aff]/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00ADFF]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                </div>

                {/* Content container */}
                <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-12 text-center">
                        {/* Eyes with 404 number */}
                        <EyesDisplay number="404" />

                        {/* Content and CTA */}
                        <NotFoundContent />
                    </div>
                </div>
            </main>
        </>
    );
}
