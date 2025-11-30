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

export const metadata: Metadata = {
    title: `${restaurantConfig.name} - ${restaurantConfig.tagline}`,
    description: restaurantConfig.description,
    openGraph: {
        title: restaurantConfig.name,
        description: restaurantConfig.description,
        type: "website",
        locale: "vi_VN",
    },
};

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
