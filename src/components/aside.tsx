import '@/style/aside.css';
import { IconType } from 'react-icons';
import { AiOutlineHome } from 'react-icons/ai';
import { FaTable } from 'react-icons/fa';

interface AsideProps {
    className?: string;
}

interface Sidebar {
    icon: IconType;
    text: string;
    href: string;
}

const sidebarList: Sidebar[] = [
    {
        icon: AiOutlineHome,
        text: "Home",
        href: "/",
    },
    {
        icon: FaTable,
        text: "Table",
        href: "/waiter/table",
    },
];

const Aside: React.FC<AsideProps> = ({
    className
}) => {
    return (
        <aside className={`navbar-vertical-aside ${className}`}>
            <div className="sidebar-container">
                <div className="sidebar-offset">
                    {/*  START CONTENT  */}
                    <main className="sidebar-content">
                        <ul className="sidebar-list navbar-nav nav-tabs">
                            {sidebarList.map((item, index) => (
                                <li
                                    key={index}
                                    className="sidebar-item-has-menu"
                                >
                                    <a
                                        className="sidebar-item-link sidebar-link"
                                        href={item.href}
                                    >
                                        <span className="sidebar-item-icon">
                                            <item.icon />
                                        </span>
                                        <span className="sidebar-item-text">
                                            {item.text}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </main>
                    {/* <!-- END CONTENT --> */}

                    {/* <!-- START FOOTER --> */}
                    <div className="sidebar-footer">

                    </div>
                    {/* <!-- END FOOTER --> */}
                </div>
            </div>
        </aside>
    );
}

export default Aside;