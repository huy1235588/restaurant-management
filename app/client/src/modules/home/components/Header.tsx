"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { navSections } from "../config/restaurant.config";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { useRestaurantSettingsContext } from "../context";

export function Header() {
    const { t, i18n } = useTranslation();
    const { settings } = useRestaurantSettingsContext();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const sectionIds = navSections.map(s => s.id);
    const { activeSection, scrollToSection } = useScrollSpy({ sectionIds, offset: 80 });

    // Handle scroll for sticky header styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleNavClick = (sectionId: string) => {
        scrollToSection(sectionId);
        setIsMobileMenuOpen(false);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === "vi" ? "en" : "vi";
        i18n.changeLanguage(newLang);
    };

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled
                        ? "bg-background/95 backdrop-blur-md shadow-sm border-b"
                        : "bg-transparent"
                )}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <button
                            onClick={() => handleNavClick("home")}
                            className="font-bold text-xl md:text-2xl text-primary hover:opacity-80 transition-opacity"
                        >
                            {settings.name || t("home.hero.title")}
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => handleNavClick(section.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        activeSection === section.id
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    {t(`home.nav.${section.id}`) || section.label}
                                </button>
                            ))}
                        </nav>

                        {/* Right side actions */}
                        <div className="flex items-center gap-2">
                            {/* Language Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleLanguage}
                                className="hidden sm:flex"
                                title={i18n.language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
                            >
                                <Globe className="h-5 w-5" />
                                <span className="sr-only">
                                    {i18n.language === "vi" ? "EN" : "VI"}
                                </span>
                            </Button>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* CTA Button - Desktop */}
                            <Button
                                onClick={() => handleNavClick("reservation")}
                                className="hidden md:inline-flex"
                            >
                                {t("home.nav.bookTable", { defaultValue: "Đặt Bàn" })}
                            </Button>

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden"
                    >
                        <motion.nav
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col items-center justify-center h-full gap-4 pt-16"
                        >
                            {navSections.map((section, index) => (
                                <motion.button
                                    key={section.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    onClick={() => handleNavClick(section.id)}
                                    className={cn(
                                        "text-2xl font-medium py-3 px-6 rounded-lg transition-colors",
                                        activeSection === section.id
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {t(`home.nav.${section.id}`) || section.label}
                                </motion.button>
                            ))}

                            {/* Mobile Language Toggle */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-4 mt-4"
                            >
                                <Button
                                    variant="outline"
                                    onClick={toggleLanguage}
                                    className="flex items-center gap-2"
                                >
                                    <Globe className="h-4 w-4" />
                                    {i18n.language === "vi" ? "English" : "Tiếng Việt"}
                                </Button>
                            </motion.div>

                            {/* Mobile CTA */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.35 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={() => handleNavClick("reservation")}
                                    className="mt-4"
                                >
                                    {t("home.nav.bookTable") || "Đặt Bàn Ngay"}
                                </Button>
                            </motion.div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
