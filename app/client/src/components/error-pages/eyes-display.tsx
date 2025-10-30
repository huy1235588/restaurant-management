"use client";
import { motion } from "framer-motion";
import { ErrorEye } from "./error-eye";

interface EyesDisplayProps {
    number?: string;
    onNumberHover?: (rotate: number) => void;
}

export function EyesDisplay({ number = "404" }: EyesDisplayProps) {
    return (
        <motion.div
            className="flex gap-6 md:gap-12 items-center justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 100 }}
            >
                <ErrorEye size="md" />
            </motion.div>

            {/* Number with enhanced hover shake and glow */}
            <motion.div
                className="text-6xl md:text-8xl font-black select-none leading-none cursor-default"
                whileHover={{
                    rotate: [0, -5, 5, -3, 3, 0],
                    scale: [1, 1.02, 1.02, 1.02, 1.02, 1],
                    transition: { duration: 0.6 },
                }}
                animate={{
                    textShadow: [
                        "0 0 0px rgba(61,106,255,0.0), 0 0 0px rgba(0,173,255,0.0)",
                        "0 0 20px 2px rgba(61,106,255,0.6), 0 0 30px 3px rgba(0,173,255,0.4)",
                        "0 0 0px rgba(61,106,255,0.0), 0 0 0px rgba(0,173,255,0.0)",
                    ],
                }}
                transition={{
                    textShadow: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                    },
                }}
            >
                {number}
            </motion.div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15, type: "spring", stiffness: 100 }}
            >
                <ErrorEye size="md" />
            </motion.div>
        </motion.div>
    );
}
