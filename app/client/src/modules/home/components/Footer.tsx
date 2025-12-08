"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowUp, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navSections } from "../config/restaurant.config";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { useRestaurantSettingsContext } from "../context";

// TikTok icon component (not available in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
        >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    );
}

// Get icon component for social platform
function getSocialIcon(platform: string) {
    const iconClass = "h-5 w-5";
    switch (platform.toLowerCase()) {
        case "facebook":
            return <Facebook className={iconClass} />;
        case "instagram":
            return <Instagram className={iconClass} />;
        case "tiktok":
            return <TikTokIcon className={iconClass} />;
        default:
            return null;
    }
}

export function Footer() {
    const { t } = useTranslation();
    const { settings } = useRestaurantSettingsContext();
    const { scrollToSection } = useScrollSpy({ sectionIds: navSections.map(s => s.id) });

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/50 border-t">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-primary">
                            {settings.name || t("home.hero.title")}
                        </h3>
                        <p className="text-muted-foreground">
                            {settings.description || t("home.hero.description")}
                        </p>
                        
                        {/* Social Links */}
                        <div className="flex gap-3 pt-2">
                            {settings.socialLinks.map((social) => (
                                <motion.a
                                    key={social.platform}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border"
                                    title={social.platform}
                                >
                                    {getSocialIcon(social.icon)}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">
                            {t("home.footer.quickLinks") || "Liên kết nhanh"}
                        </h4>
                        <nav className="space-y-2">
                            {navSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className="block text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {t(`home.nav.${section.id}`) || section.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4">
                            {t("home.footer.contact") || "Thông tin liên hệ"}
                        </h4>
                        <address className="not-italic space-y-2 text-muted-foreground">
                            <p>{settings.address || t("home.contact.address")}</p>
                            <p>
                                <a
                                    href={`tel:${settings.phone.replace(/-/g, "")}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {settings.phone || t("home.contact.phone")}
                                </a>
                            </p>
                            <p>
                                <a
                                    href={`mailto:${settings.email}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {settings.email || t("home.contact.email")}
                                </a>
                            </p>
                        </address>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground text-center sm:text-left">
                        © {currentYear} {settings.name || t("home.hero.title")}.{" "}
                        {t("home.footer.copyright") || "Đã đăng ký bản quyền."}
                    </p>

                    {/* Back to Top */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={scrollToTop}
                        className="gap-2"
                    >
                        <ArrowUp className="h-4 w-4" />
                        {t("home.footer.backToTop") || "Về đầu trang"}
                    </Button>
                </div>
            </div>
        </footer>
    );
}
