"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useRestaurantSettingsContext } from "../context";

export function ContactSection() {
    const { t } = useTranslation();
    const { settings } = useRestaurantSettingsContext();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const contactInfo = [
        {
            icon: MapPin,
            label: t("home.contact.address", { defaultValue: "Địa chỉ" }),
            value: settings.contact.address,
            href: `https://maps.google.com/?q=${encodeURIComponent(settings.contact.address)}`,
        },
        {
            icon: Phone,
            label: t("home.contact.phone", { defaultValue: "Điện thoại" }),
            value: settings.contact.phone,
            href: `tel:${settings.contact.phone.replace(/-/g, "")}`,
        },
        {
            icon: Mail,
            label: t("home.contact.email", { defaultValue: "Email" }),
            value: settings.contact.email,
            href: `mailto:${settings.contact.email}`,
        },
    ];

    return (
        <section id="contact" ref={ref} className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        {t("home.contact.title", { defaultValue: "Liên Hệ" })}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t("home.contact.subtitle", {
                            defaultValue: "Hãy đến và trải nghiệm ẩm thực tuyệt vời"
                        })}
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-4" />
                </motion.div>

                <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Contact Items */}
                        {contactInfo.map((item, index) => (
                            <motion.a
                                key={item.label}
                                href={item.href}
                                target={item.icon === MapPin ? "_blank" : undefined}
                                rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-colors group"
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <item.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                                    <p className="font-medium group-hover:text-primary transition-colors">
                                        {item.value}
                                    </p>
                                </div>
                            </motion.a>
                        ))}

                        {/* Operating Hours */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="p-4 rounded-xl bg-muted/50"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <p className="font-medium">
                                    {t("home.contact.hours", { defaultValue: "Giờ mở cửa" })}
                                </p>
                            </div>
                            <div className="space-y-2 pl-16">
                                {settings.operatingHours.map((schedule, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{schedule.day}</span>
                                        <span className="font-medium">{schedule.hours}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="relative aspect-square md:aspect-auto md:h-full min-h-[300px] rounded-2xl overflow-hidden shadow-lg border"
                    >
                        {settings.contact.mapEmbedUrl ? (
                            <iframe
                                src={settings.contact.mapEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Restaurant Location"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-muted flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        {settings.contact.address}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
