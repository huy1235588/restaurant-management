"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Flame, Leaf } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import type { FeaturedMenuItem } from "../types";

interface MenuItemCardProps {
    item: FeaturedMenuItem;
    index?: number;
}

export function MenuItemCard({ item, index = 0 }: MenuItemCardProps) {
    const { t } = useTranslation();

    // Format price to VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Get spicy level display
    const getSpicyLevel = (level: number | null | undefined) => {
        if (!level || level === 0) return null;
        return Array.from({ length: Math.min(level, 5) }, (_, i) => (
            <Flame key={i} className="h-3 w-3 text-red-500 fill-red-500" />
        ));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group bg-background rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300"
        >
            {/* Image */}
            <div className="relative aspect-4/3 overflow-hidden bg-muted">
                {getImageUrl(item.imagePath) ? (
                    <Image
                        src={getImageUrl(item.imagePath)!}
                        alt={item.itemName}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl">🍴</span>
                    </div>
                )}
                
                {/* Category badge */}
                {item.category && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
                            {item.category.categoryName}
                        </span>
                    </div>
                )}

                {/* Vegetarian badge */}
                {item.isVegetarian && (
                    <div className="absolute top-3 right-3">
                        <span className="p-1.5 bg-green-500/90 backdrop-blur-sm rounded-full">
                            <Leaf className="h-3 w-3 text-white" />
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {item.itemName}
                    </h3>
                    {/* Spicy indicator */}
                    {item.spicyLevel && item.spicyLevel > 0 && (
                        <div className="flex items-center gap-0.5 shrink-0">
                            {getSpicyLevel(item.spicyLevel)}
                        </div>
                    )}
                </div>

                {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.description}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                        {formatPrice(item.price)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
