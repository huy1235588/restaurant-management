"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { useRestaurantSettingsContext } from "../context";

export function HeroSection() {
    const { t } = useTranslation();
    const { settings } = useRestaurantSettingsContext();
    const { scrollToSection } = useScrollSpy({ sectionIds: ["menu", "reservation"] });

    const heroImageUrl = settings.heroImage;

    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background Image */}
            {heroImageUrl ? (
                <>
                    <div className="absolute inset-0">
                        <Image
                            src={heroImageUrl}
                            alt={settings.name}
                            fill
                            priority
                            className="object-cover"
                            sizes="100vw"
                        />
                    </div>
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/50" />
                </>
            ) : (
                <>
                    {/* Fallback gradient background */}
                    <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-background to-background" />
                    
                    {/* Decorative elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
                    </div>
                </>
            )}

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Restaurant Name */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 ${
                            heroImageUrl 
                                ? "text-white drop-shadow-lg" 
                                : "bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
                        }`}
                    >
                        {settings.name || t("home.hero.title")}
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className={`text-xl sm:text-2xl md:text-3xl mb-4 ${
                            heroImageUrl ? "text-white/90" : "text-muted-foreground"
                        }`}
                    >
                        {settings.tagline || t("home.hero.tagline")}
                    </motion.p>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className={`text-base sm:text-lg mb-10 max-w-2xl mx-auto ${
                            heroImageUrl ? "text-white/80" : "text-muted-foreground/80"
                        }`}
                    >
                        {settings.description || t("home.hero.description")}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Button
                            size="lg"
                            onClick={() => scrollToSection("reservation")}
                            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            {t("home.hero.bookTable", { defaultValue: "Đặt Bàn Ngay" })}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => scrollToSection("menu")}
                            className="text-lg px-8 py-6"
                        >
                            {t("home.hero.viewMenu", { defaultValue: "Xem Thực Đơn" })}
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.button
                        onClick={() => scrollToSection("about")}
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronDown className="h-8 w-8" />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}
