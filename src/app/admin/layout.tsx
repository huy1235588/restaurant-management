'use client'

import Aside from '@/components/aside';
import ThemeToggleButton from '@/components/themeToggleButton';
import { ReactNode, useState } from 'react';
import { FiSidebar } from 'react-icons/fi';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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

            {/* Toggle theme */}
            <ThemeToggleButton />
        </>
    );
};

export default Layout;