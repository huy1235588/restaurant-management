"use client";
import Link from "next/link";
import { motion } from "framer-motion";

interface NotFoundContentProps {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonHref?: string;
}

export function NotFoundContent({
    title = "Page not found",
    description = "Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or doesn't exist anymore.",
    buttonText = "Go to homepage",
    buttonHref = "/",
}: NotFoundContentProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md text-center"
        >
            <motion.h1
                className="text-4xl md:text-5xl font-black mb-4 bg-linear-to-r from-[#3d6aff] to-[#00ADFF] bg-clip-text text-transparent py-2"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                {title}
            </motion.h1>
            <motion.p
                className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                {description}
            </motion.p>

            {/* Button with advanced hover effects */}
            <motion.div
                animate={{
                    boxShadow: [
                        "0 0 0px rgba(61,106,255,0.0)",
                        "0 0 30px 10px rgba(61,106,255,0.5)",
                        "0 0 0px rgba(61,106,255,0.0)",
                    ],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                }}
                className="inline-block"
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <Link
                        href={buttonHref}
                        className="group inline-block px-8 py-4 rounded-lg border-2 border-[#3d6aff] text-sm font-bold uppercase tracking-wider bg-linear-to-r from-[#3d6aff]/10 to-[#00ADFF]/10 hover:from-[#3d6aff] hover:to-[#00ADFF] transition-all duration-300 relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-white group-hover:text-white">
                            {buttonText}
                            <motion.span
                                className="inline-block"
                                whileHover={{ x: 4 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                →
                            </motion.span>
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-[#3d6aff] to-[#00ADFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
