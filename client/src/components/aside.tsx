import '@/style/aside.css';
import { SvgIconComponent } from '@mui/icons-material';
import PointOfSaleOutlined from '@mui/icons-material/PointOfSaleOutlined';
import { useTheme } from '@mui/material';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { AiOutlineHome } from 'react-icons/ai';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { FaKitchenSet, FaTableCells } from 'react-icons/fa6';

interface AsideProps {
    className?: string;
}
interface Sidebar {
    icon: IconType | SvgIconComponent;
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
        icon: PointOfSaleOutlined,
        text: "Point of Sale",
        href: "/admin/table",
    },
    {
        icon: FaKitchenSet,
        text: "Kitchen",
        href: "/admin/kitchen",
    },
    {
        icon: BiSolidFoodMenu,
        text: "Menu",
        href: "/admin/menu",
    },
    {
        icon: FaTableCells,
        text: "Table",
        href: "/admin/table-panel",
    }
];

const Aside: React.FC<AsideProps> = ({
    className
}) => {
    const theme = useTheme();

    return (
        <aside className={`navbar-vertical-aside ${className} ${theme}`}>
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
                                    <Link
                                        className="sidebar-item-link sidebar-link"
                                        href={item.href}
                                    >
                                        <span className="sidebar-item-icon">
                                            <item.icon />
                                        </span>
                                        <span className="sidebar-item-text">
                                            {item.text}
                                        </span>
                                    </Link>
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