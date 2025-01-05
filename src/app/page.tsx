'use client'

import Footer from '@/components/footer';
import Header from '@/components/header';
import '@/style/index.css';
import { Category, MenuFood } from '@/types/types';
import axios from '@/config/axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid2, Menu, MenuItem, Typography } from '@mui/material';
import Map from '@/components/addres/map';
import AddressList from '@/components/addres/addressList';

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

// Address list
const addresses = [
    {
        name: '6F, 東京都渋谷区宇田川町 31-1 HURIC & new shibuya, Tokyo 150-0042, Nhật Bản',
        location: "!1m18!1m12!1m3!1d25933.017781037543!2d139.66160991083981!3d35.661554999999986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188da99d636e93%3A0x152defa6742dcef!2zQ0hVUlJBU0NPIEdBTkcg5riL6LC35pys5bqX44CQ44K344Ol44Op44K544Kz44Ku44Oj44Oz44Kw44CR!5e0!3m2!1svi!2s!4v1736068678682!5m2!1svi!2s",
    },
    {
        name: '56-13 KR 서울특별시 용산구 3F, 56-13 Itaewon-dong 3층',
        location: '!1m18!1m12!1m3!1d25308.94609480401!2d126.9626165178456!3d37.540495003191374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca37ae1df2b6b%3A0x727c210f4e0f0a2c!2sHojiBobo%20Restaurant%20%7C%20Itaewon%20Seoul!5e0!3m2!1svi!2s!4v1736071391858!5m2!1svi!2s',
    },
    {
        name: 'Via Corcianese, 260, 06132 Perugia PG, Italy',
        location: '!1m18!1m12!1m3!1d372913.3570019396!2d11.7402255734375!3d43.09641070000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132ea710a73c1e03%3A0x5eece0bd07102084!2sIl%20Vizio!5e0!3m2!1svi!2s!4v1736071960147!5m2!1svi!2s',
    },
    {
        name: "2 Rue d'Argentine, 21210 Saulieu, Pháp",
        location: '!1m18!1m12!1m3!1d1399437.6758564524!2d1.464302986474972!3d46.75944194692608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f205f1a6f2244b%3A0x4adb3bdea3828439!2sLe%20Relais%20Bernard%20Loiseau!5e0!3m2!1svi!2s!4v1736072008850!5m2!1svi!2s',
    },
    {
        name: 'Berlepsch 1, 37218 Witzenhausen, Đức',
        location: '!1m18!1m12!1m3!1d320050.4239279785!2d9.573421441732377!3d51.19339247697995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bb33203eb8c279%3A0x4eede2153cb368ff!2sSchloss%20Berlepsch!5e0!3m2!1svi!2s!4v1736072062995!5m2!1svi!2s',
    },
    {
        name: '176 N Canon Dr, Beverly Hills, CA 90210, Hoa Kỳ',
        location: '!1m18!1m12!1m3!1d423049.324435104!2d-118.97435402656248!3d34.067646800000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bbfed96ef75b%3A0x6595937c3757fbed!2sSpago!5e0!3m2!1svi!2s!4v1736072124587!5m2!1svi!2s',
    },
];

export default function Home() {
    const [selectedSource, setSelectedSource] = useState<Source>(sourceOptions[0]);
    // Fetch menu items
    const [menuItems, setMenuItems] = useState<MenuFood[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<Category[]>([{ id: 0, categoryName: 'All' }]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Map
    const [selectedLocation, setSelectedLocation] = useState(addresses[0].location);

    // Lấy ra các category từ menuItems
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Hàm này sẽ lọc ra các category từ menuItems
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // Hàm này sẽ đóng menu category
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Hàm này sẽ chọn category
    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category.categoryName);

        fetchMenuItems(category.id);

        handleClose();
    };

    // Lấy ra các category từ menuItems
    const fetchCategoryOptions = async () => {
        try {
            const response = await axios.get('/api/category/all');
            setCategoryOptions([...categoryOptions, ...response.data]);

        } catch (error) {
            console.error('Error fetching category options:', error);
            setError('Failed to load category options.');
        }
        finally {
            setLoading(false);
        }
    };

    // Lấy ra các món ăn từ api
    const fetchMenuItems = async (category: number) => {
        try {
            setLoading(true);

            // Nếu category là 'All' thì lấy tất cả các món ăn
            if (category === 0) {
                const response = await axios.get('/api/menu/all');
                setMenuItems(response.data);
            } else {
                const response = await axios.get(`/api/menu/${category}`);
                setMenuItems(response.data);
            }

        } catch (err) {
            console.error('Error fetching menu items:', err);
            setError('Failed to load menu items.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategoryOptions();
        fetchMenuItems(0);
    }, []);

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
                        <span>
                            SAIGON
                        </span>
                        <br/>
                        <span>
                            RESTAURANT
                        </span>
                    </h1>

                    <a href="#menu" className="cta">
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
                <section id='menu' className='section-container menu-section'>
                    <h2 className='menu-title'>Menu</h2>

                    {/* Source selector */}
                    <div className="menu-selector">
                        {/* Hiển thị category */}
                        <Button className="menu-button"
                            variant="contained"
                            onClick={handleClick}
                        >
                            {selectedCategory}
                        </Button>

                        {/* Hiển thị menu category */}
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
                            {loading ? <p>Loading...</p> : (
                                categoryOptions.map((category) => (
                                    <MenuItem
                                        className="menu-category-item"
                                        key={category.id}
                                        onClick={() => handleSelectCategory(category)}>
                                        {category.categoryName}
                                    </MenuItem>
                                ))
                            )}
                        </Menu>
                    </div>

                    <Grid2
                        container
                        spacing={3}
                        height="515px"
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
                    <h2>
                        Contact
                    </h2>

                    <div className='address-container'>
                        <div className='address-info'>
                            <AddressList
                                addresses={addresses}
                                onSelect={(location) => setSelectedLocation(location)}
                            />
                        </div>

                        <div className='address-map'>
                            <Map
                                location={selectedLocation}
                            />
                        </div>
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
