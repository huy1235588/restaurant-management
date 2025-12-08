"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "./MenuItemCard";
import { homeApi } from "../services/home.service";
import type { FeaturedMenuItem } from "../types";
import { useScrollSpy } from "../hooks/useScrollSpy";

export function MenuSection() {
    const { t } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { scrollToSection } = useScrollSpy({ sectionIds: ["reservation"] });

    const [menuItems, setMenuItems] = useState<FeaturedMenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMenuItems = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await homeApi.getFeaturedMenuItems(12);
            setMenuItems(items);
        } catch (err) {
            console.error("Failed to fetch menu items:", err);
            setError(t("home.menu.loadError", { defaultValue: "Không thể tải thực đơn" }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <section id="menu" ref={ref} className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        {t("home.menu.title", { defaultValue: "Thực Đơn Đặc Sắc" })}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t("home.menu.subtitle", {
                            defaultValue: "Khám phá những món ăn ngon nhất của chúng tôi",
                        })}
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-4" />
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <p className="text-muted-foreground">{error}</p>
                        <Button variant="outline" onClick={fetchMenuItems}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("common.tryAgain", { defaultValue: "Thử lại" })}
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && menuItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <span className="text-6xl">🍽️</span>
                        <p className="text-muted-foreground text-lg">
                            {t("home.menu.empty", { defaultValue: "Thực đơn đang được cập nhật..." })}
                        </p>
                    </div>
                )}

                {/* Menu Grid */}
                {!isLoading && !error && menuItems.length > 0 && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {menuItems.map((item, index) => (
                            <MenuItemCard key={item.itemId} item={item} index={index} />
                        ))}
                    </motion.div>
                )}

                {/* CTA Button */}
                {!isLoading && !error && menuItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-center mt-12"
                    >
                        <Button
                            size="lg"
                            onClick={() => scrollToSection("reservation")}
                            className="px-8"
                        >
                            {t("home.menu.bookNow", { defaultValue: "Đặt Bàn Ngay" })}
                        </Button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
