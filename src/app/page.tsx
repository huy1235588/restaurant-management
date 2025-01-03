import Footer from '@/components/footer';
import Header from '@/components/header';
import '@/style/index.css';
import Image from 'next/image';

export default function Home() {
    return (
        <>
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className='main-container'>
                <video
                    src="/videos/banner.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className='video-banner'
                ></video>

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

                {/* Contact info */}
                <section className='contact-info-container'>
                    <div className='contact-info'>
                        
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </>
    );
}
