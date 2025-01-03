'use client'

import ThemeToggleButton from "@/components/themeToggleButton";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {


    return (
        <>           
            {children}

            {/* Toggle theme */}
            <ThemeToggleButton />
        </>
    );
}
