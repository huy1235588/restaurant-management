'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function Header() {
    const [scrollPosition, setScrollPosition] = useState(0);

    // Xử lý sự kiện cuộn
    const handleScroll = () => {
        setScrollPosition(window.scrollY);
    };

    // Thêm sự kiện cuộn khi component được tạo
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        // Xóa sự kiện cuộn khi component bị hủy
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Tính toán tỷ lệ cuộn (chỉ bắt đầu tính từ 30% chiều cao của viewport)
    const scrollThreshold = window.innerHeight * 0.3; // Ngưỡng 30% chiều cao viewport
    const scrollPercentage = Math.min((scrollPosition - scrollThreshold) / (window.innerHeight * 0.7), 1);

    // Chuyển đổi tỷ lệ cuộn thành màu nền
    const backgroundColor = `rgba(14, 109, 226, ${scrollPercentage})`;


    return (
        <header className='header-container' style={{ backgroundColor }}>
            {/* Logo */}
            <div className='logo-container'>
                <Link href='/' className='logo-link'>
                    <Image
                        src='/images/logo/logo.png'
                        alt='Logo'
                        width={30}
                        height={30} />
                    <h1>
                        Saigon restaurant
                    </h1>
                </Link>
            </div>

            {/* Nav */}
            <nav className='nav-container'>
                <ul className='nav-list'>
                    <li className='nav-item'>
                        <Link href='/'>
                            Home
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link href='/menu'>
                            Menu
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link href='/about'>
                            About
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link href='/contact'>
                            Contact
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link href='/admin/table'>
                            Staff
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link href='/login'>
                            Login
                        </Link>
                    </li>
                </ul>
            </nav>

        </header>
    );
}

export default Header;