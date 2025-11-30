/**
 * Restaurant configuration
 * Contains all restaurant information displayed on the landing page
 * Easy to modify for demo purposes
 */

export interface RestaurantInfo {
    name: string;
    tagline: string;
    description: string;
    about: {
        title: string;
        paragraphs: string[];
        highlights: {
            icon: string;
            label: string;
            value: string;
        }[];
    };
    contact: {
        address: string;
        phone: string;
        email: string;
        mapEmbedUrl?: string;
    };
    operatingHours: {
        day: string;
        hours: string;
    }[];
    socialLinks: {
        platform: string;
        url: string;
        icon: string;
    }[];
    heroImage: string;
    aboutImage: string;
    logoUrl?: string;
}

export const restaurantConfig: RestaurantInfo = {
    name: "Nhà Hàng Việt Nam",
    tagline: "Hương vị truyền thống - Phong cách hiện đại",
    description: "Trải nghiệm ẩm thực Việt Nam đích thực với không gian sang trọng và dịch vụ tận tâm",
    about: {
        title: "Chào mừng đến với Nhà Hàng Việt Nam",
        paragraphs: [
            "Được thành lập từ năm 2010, Nhà Hàng Việt Nam tự hào là điểm đến ẩm thực hàng đầu, nơi hội tụ tinh hoa ẩm thực truyền thống Việt Nam với phong cách phục vụ hiện đại.",
            "Với đội ngũ đầu bếp giàu kinh nghiệm và nguyên liệu tươi ngon được chọn lọc kỹ càng mỗi ngày, chúng tôi cam kết mang đến cho quý khách những món ăn ngon miệng, đẹp mắt và đậm đà hương vị.",
            "Không gian nhà hàng được thiết kế tinh tế, kết hợp giữa nét đẹp truyền thống và sự tiện nghi hiện đại, tạo nên bầu không khí ấm cúng và sang trọng cho mọi dịp sum họp."
        ],
        highlights: [
            { icon: "🏆", label: "Năm kinh nghiệm", value: "15+" },
            { icon: "👨‍🍳", label: "Đầu bếp chuyên nghiệp", value: "10+" },
            { icon: "⭐", label: "Khách hàng hài lòng", value: "50K+" },
            { icon: "🍽️", label: "Món ăn đặc sắc", value: "100+" }
        ]
    },
    contact: {
        address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        phone: "028-1234-5678",
        email: "info@nhahangvietnam.com",
        // Google Maps embed URL (optional)
        mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674198045!2d106.70142631533417!3d10.77644439231945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670640625%3A0xd28b9f60b2d2f4c0!2zMTIzIE5ndXnhu4VuIEh14buHLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1234567890"
    },
    operatingHours: [
        { day: "Thứ Hai - Thứ Sáu", hours: "10:00 - 22:00" },
        { day: "Thứ Bảy - Chủ Nhật", hours: "09:00 - 23:00" },
        { day: "Ngày lễ", hours: "09:00 - 23:00" }
    ],
    socialLinks: [
        { platform: "Facebook", url: "https://facebook.com/nhahangvietnam", icon: "facebook" },
        { platform: "Instagram", url: "https://instagram.com/nhahangvietnam", icon: "instagram" },
        { platform: "TikTok", url: "https://tiktok.com/@nhahangvietnam", icon: "tiktok" }
    ],
    heroImage: "/images/hero-restaurant.jpg",
    aboutImage: "/images/about-restaurant.jpg"
};

// Navigation sections for the landing page
export const navSections = [
    { id: "home", label: "Trang chủ" },
    { id: "about", label: "Giới thiệu" },
    { id: "menu", label: "Thực đơn" },
    { id: "reservation", label: "Đặt bàn" },
    { id: "contact", label: "Liên hệ" }
] as const;

export type NavSectionId = typeof navSections[number]["id"];
