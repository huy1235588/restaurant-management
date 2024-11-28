'use client'

import Aside from "@/components/aside";
import { useState } from "react";
import { FiSidebar } from "react-icons/fi";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleAside = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            <button className="toggle-aside" onClick={toggleAside}>
                <FiSidebar size={20} />
            </button>
            <Aside
                className={`aside-content ${isExpanded ? 'expanded' : 'collapsed'}`}
            />
            {children}
        </>
    );
}
