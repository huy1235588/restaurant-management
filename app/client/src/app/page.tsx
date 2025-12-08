import type { Metadata } from "next";
import {
    Header,
    HeroSection,
    AboutSection,
    MenuSection,
    ReservationSection,
    ContactSection,
    Footer,
    RestaurantSettingsProvider,
} from "@/modules/home";
import { restaurantConfig } from "@/modules/home/config/restaurant.config";
import { homeApi } from "@/modules/home/services/home.service";

/**
 * Generate metadata dynamically from API
 * Falls back to static config if API fails
 */
export async function generateMetadata(): Promise<Metadata> {
    try {
        const settings = await homeApi.getRestaurantSettings();

        if (settings) {
            return {
                title: `${settings.name} - ${settings.tagline}`,
                description: settings.description,
                openGraph: {
                    title: settings.name,
                    description: settings.description || "",
                    type: "website",
                    locale: "vi_VN",
                },
            };
        }
    } catch (error) {
        console.error("Failed to fetch restaurant settings for metadata:", error);
    }

    // Fallback to static config
    return {
        title: `${restaurantConfig.name} - ${restaurantConfig.tagline}`,
        description: restaurantConfig.description,
        openGraph: {
            title: restaurantConfig.name,
            description: restaurantConfig.description,
            type: "website",
            locale: "vi_VN",
        },
    };
}

export default function HomePage() {
    return (
        <RestaurantSettingsProvider>
            <div className="min-h-screen">
                <Header />
                <main>
                    <HeroSection />
                    <AboutSection />
                    <MenuSection />
                    <ReservationSection />
                    <ContactSection />
                </main>
                <Footer />
            </div>
        </RestaurantSettingsProvider>
    );
}
