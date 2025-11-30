"use client";

import { useState, useEffect, useCallback } from "react";

interface UseScrollSpyOptions {
    sectionIds: string[];
    offset?: number;
}

export function useScrollSpy({ sectionIds, offset = 100 }: UseScrollSpyOptions) {
    const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || "");

    const handleScroll = useCallback(() => {
        const scrollPosition = window.scrollY + offset;

        // Find the current section
        for (let i = sectionIds.length - 1; i >= 0; i--) {
            const section = document.getElementById(sectionIds[i]);
            if (section && section.offsetTop <= scrollPosition) {
                setActiveSection(sectionIds[i]);
                return;
            }
        }

        // Default to first section if at top
        setActiveSection(sectionIds[0] || "");
    }, [sectionIds, offset]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    const scrollToSection = useCallback((sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const top = section.offsetTop - offset + 20;
            window.scrollTo({
                top,
                behavior: "smooth",
            });
        }
    }, [offset]);

    return {
        activeSection,
        scrollToSection,
    };
}
