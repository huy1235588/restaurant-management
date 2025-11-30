"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { useRestaurantSettingsContext } from "../context";
import { getImageUrl } from "@/lib/utils/image";

export function AboutSection() {
    const { t } = useTranslation();
    const { settings } = useRestaurantSettingsContext();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const aboutImageUrl = settings.aboutImage ? getImageUrl(settings.aboutImage) : null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const },
        },
    };

    return (
        <section
            id="about"
            ref={ref}
            className="py-20 md:py-32 bg-muted/30"
        >
            <div className="container mx-auto px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="max-w-6xl mx-auto"
                >
                    {/* Section Title */}
                    <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                            {t("home.about.title", { defaultValue: settings.about.title })}
                        </h2>
                        <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
                    </motion.div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                        {/* Image */}
                        <motion.div
                            variants={itemVariants}
                            className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xl"
                        >
                            {aboutImageUrl ? (
                                <Image
                                    src={aboutImageUrl}
                                    alt={settings.about.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5" />
                                    {/* Placeholder for restaurant image */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                        <span className="text-6xl">🍽️</span>
                                    </div>
                                </>
                            )}
                        </motion.div>

                        {/* Text Content */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            {settings.about.paragraphs.map((paragraph, index) => (
                                <p
                                    key={index}
                                    className="text-muted-foreground leading-relaxed text-base md:text-lg"
                                >
                                    {t(`home.about.paragraph${index + 1}`, { defaultValue: paragraph })}
                                </p>
                            ))}
                        </motion.div>
                    </div>

                    {/* Highlights */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
                    >
                        {settings.about.highlights.map((highlight, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                className="bg-background rounded-xl p-6 text-center shadow-sm border"
                            >
                                <span className="text-4xl mb-3 block">{highlight.icon}</span>
                                <p className="text-2xl md:text-3xl font-bold text-primary mb-1">
                                    {highlight.value}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t(`home.about.highlight${index + 1}`, { defaultValue: highlight.label })}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
