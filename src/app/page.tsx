'use client'

import Footer from '@/components/footer';
import Header from '@/components/header';
import '@/style/index.css';
import { MenuFood } from '@/types/types';
import axios from '@/config/axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid2, Menu, MenuItem, Typography } from '@mui/material';

export type Source = {
    label?: string,
    type: 'video' | 'iframe',
    src: string,
};

const sourceOptions: Array<Source> = [
    { type: 'video', label: 'Sleepy fish', src: '/videos/boucle-1_V2.mp4' },
    { type: 'video', label: 'Furina', src: '/videos/Furina-FHD.mp4' },
    { type: 'video', label: 'felly', src: '/videos/CR226.mp4' },
    { type: 'iframe', label: 'Just mazes', src: '/iframe/maze/index.html' },
    { type: 'iframe', label: 'Periodic Table', src: '/iframe/periodic-table/index.html' },
];

const categoryOptions = [
    'All',
    'Appetizers',
    'Main course',
    'Desserts',
];

export default function Home() {
    const [selectedSource, setSelectedSource] = useState<Source>(sourceOptions[0]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectCategory = (category: string) => {
        setSelectedCategory(category);
        handleClose();
    };

    // Fetch menu items
    const [menuItems, setMenuItems] = useState<MenuFood[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await axios.get('/api/menu/all');
                setMenuItems(response.data);
            } catch (err) {
                console.error('Error fetching menu items:', err);
                setError('Failed to load menu items.');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
                <Typography variant="h6">Loading...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <>
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className='main-container'>
                {/* Video banner */}
                {selectedSource.type === 'video' ? (
                    <div className='video-banner-container'>
                        <video
                            src={selectedSource.src}
                            autoPlay
                            loop
                            muted
                            className='video-banner'
                        ></video>
                        <div className='overlay'></div>
                    </div>
                ) : (
                    <div className='video-banner-container'>
                        <iframe className='video-banner'
                            src={selectedSource.src}
                        ></iframe>
                    </div>
                )}

                {/* Hero section */}
                <div className="hero-container">
                    <h1 className="text-center">
                        SAIGON
                        <br />
                        RESTAURANT
                    </h1>

                    <a href="#projects" className="cta">
                        MENU
                    </a>
                </div>

                {/* Home overview */}
                <section className='section-container home-overview-section'>
                    {/* Info */}
                    <div className='overview-info'>
                        <h1 className='overview-title'>
                            TRẢI NGHIỆM ẨM THỰC QUẢNG ĐÔNG CHÍNH HIỆU TẠI Sài Gòn Restaurant
                        </h1>
                        <div className='overview-description'>
                            {/* Giới thiệu nhà hàng */}
                            <p className='overview-text'>
                                Sài Gòn Restaurant là nhà hàng chuyên phục vụ các món ăn chính hiệu từ Quảng Đông, thành phố Hồ Chí Minh.
                                Với đội ngũ đầu bếp chuyên nghiệp,
                                chúng tôi cam kết mang đến cho quý khách hàng những món ăn ngon nhất, hấp dẫn nhất.
                            </p>

                            <ul className='overview-list'>
                                <li className='overview-item'>
                                    <span className='overview-text'>
                                        <strong>
                                            Thực đơn gọi món:
                                        </strong>
                                        Nếu bạn là người thích thưởng thức từng món ăn riêng lẻ, hãy thử ngay thực đơn gọi món của chúng tôi.
                                        Từ những món khai vị và dimsum đủ đầy đến những món chính hấp dẫn, cùng trải nghiệm hành trình ẩm thực được dẫn dắt bởi những người đầu bếp với hơn 30 năm kinh nghiệm trong nghề.
                                    </span>
                                </li>
                                <li className='overview-item'>
                                    <span className='overview-text'>
                                        <strong>
                                            Món ăn đặc trưng:
                                        </strong>
                                        Món Vịt quay Bắc Kinh với thịt vịt thả đồng từ đồng bằng Sông Cửu Long được ủ khô trong 10 ngày, là một món đặc trưng cho những ai yêu thích ẩm thực Trung Hoa. Chúng tôi còn có nhiều sự lựa chọn khác như các món thịt nướng đặc sản, hải sản tươi sống, súp và những món ngọt tráng miệng.
                                    </span>
                                </li>
                                <li className='overview-item'>
                                    <span className='overview-text'>
                                        <strong>
                                            Không gian ấm cúng:
                                        </strong>
                                        Với không gian trang nhã, ấm cúng, Sài Gòn Restaurant là nơi lý tưởng để tụ tập gia đình, bạn bè, đồng nghiệp trong những dịp lễ, tết, hay đơn giản là những buổi gặp gỡ, họp mặt thân mật
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* Image */}
                    <div className='overview-image'>
                        <Image
                            src='/images/home/pekingduck.webp'
                            alt='Home 1'
                            width={1050}
                            height={700}
                        />
                    </div>
                </section>

                {/* Menu food */}
                <section className='section-container menu-section'>
                    <h2 className='menu-title'>Menu</h2>

                    {/* Source selector */}
                    <div className="menu-selector">
                        <Button className="menu-button"
                            variant="contained"
                            onClick={handleClick}
                        >
                            {selectedCategory}
                        </Button>
                        <Menu
                            className="menu-category"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            disableScrollLock={true}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "center",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "center",
                            }}
                        >
                            {categoryOptions.map((category) => (
                                <MenuItem
                                    className="source-option"
                                    key={category}
                                    onClick={() => handleSelectCategory(category)}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>

                    <Grid2
                        container
                        spacing={3}
                        height="500px"
                        justifyContent="center"
                        overflow={'auto'}
                    >
                        {menuItems.map((item) => (
                            <Grid2
                                key={item.itemId}
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 4,
                                    lg: 3,
                                }}
                            >
                                <Card sx={{ maxWidth: 300, height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6" className="menu-item-title">
                                            {item.itemName}
                                        </Typography>
                                        <Typography variant="body2" className="menu-item-description" sx={{ margin: '0.5rem 0' }}>
                                            {item.description}
                                        </Typography>
                                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                                            {item.price.toLocaleString()} USD
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid2>
                        ))}
                    </Grid2>
                </section>

                {/* Contact info */}
                <section className='contact-info-container'>
                    <div className='contact-info'>

                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer
                sourceOptions={sourceOptions}
                selectedSource={selectedSource}
                setSelectedSource={setSelectedSource}
            />
        </>
    );
}
