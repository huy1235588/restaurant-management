import Image from "next/image";
import Link from "next/link";

function Header() {
    return (
        <header className='header-container'>
            {/* Logo */}
            <div className='logo-container'>
                <Link href='/' className='logo-link'>
                    <Image
                        src='/images/logo/logo.png'
                        alt='Logo'
                        width={40}
                        height={40} />
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
                        <Link href='/admin/staff'>
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