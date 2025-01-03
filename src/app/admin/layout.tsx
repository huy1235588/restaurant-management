'use client'

import Aside from '@/components/aside';
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
        <div>
            <button className="toggle-aside" onClick={toggleAside}>
                <FiSidebar size={20} />
            </button>
            <Aside
                className={`aside-content ${isExpanded ? 'expanded' : 'collapsed'}`}
            />
            
            <main>
                {children}
            </main>

            <footer>
                <p>© 2023 Restaurant Management</p>
            </footer>
        </div>
    );
};

export default Layout;