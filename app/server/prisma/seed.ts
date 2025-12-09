/// <reference types="node" />
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Bắt đầu seed dữ liệu...');

    // ============================================
    // XÓA DỮ LIỆU CŨ
    // ============================================
    console.log('🗑️  Xóa dữ liệu cũ...');
    await prisma.payment.deleteMany();
    await prisma.billItem.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.kitchenOrder.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.reservationAudit.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.restaurantTable.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.account.deleteMany();
    await prisma.restaurantSettings.deleteMany();

    // ============================================
    // TẠO TÀI KHOẢN VÀ NHÂN VIÊN
    // ============================================
    console.log('👤 Tạo tài khoản và nhân viên...');

    // Mật khẩu: admin123 (đã được hash)
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminAccount = await prisma.account.create({
        data: {
            username: 'admin',
            email: 'admin@restaurant.com',
            phoneNumber: '0901234567',
            password: hashedPassword,
            isActive: true,
        },
    });

    const managerAccount = await prisma.account.create({
        data: {
            username: 'manager01',
            email: 'manager@restaurant.com',
            phoneNumber: '0901234568',
            password: hashedPassword,
            isActive: true,
        },
    });

    const waiter1Account = await prisma.account.create({
        data: {
            username: 'waiter01',
            email: 'waiter1@restaurant.com',
            phoneNumber: '0901234569',
            password: hashedPassword,
            isActive: true,
        },
    });

    const waiter2Account = await prisma.account.create({
        data: {
            username: 'waiter02',
            email: 'waiter2@restaurant.com',
            phoneNumber: '0901234570',
            password: hashedPassword,
            isActive: true,
        },
    });

    const chef1Account = await prisma.account.create({
        data: {
            username: 'chef01',
            email: 'chef1@restaurant.com',
            phoneNumber: '0901234571',
            password: hashedPassword,
            isActive: true,
        },
    });

    const chef2Account = await prisma.account.create({
        data: {
            username: 'chef02',
            email: 'chef2@restaurant.com',
            phoneNumber: '0901234572',
            password: hashedPassword,
            isActive: true,
        },
    });

    const cashierAccount = await prisma.account.create({
        data: {
            username: 'cashier01',
            email: 'cashier@restaurant.com',
            phoneNumber: '0901234573',
            password: hashedPassword,
            isActive: true,
        },
    });

    // Tạo nhân viên
    await prisma.staff.create({
        data: {
            accountId: adminAccount.accountId,
            fullName: 'Nguyễn Văn Admin',
            address: '123 Đường Lê Lợi, Q1, TP.HCM',
            dateOfBirth: new Date('1985-01-15'),
            hireDate: new Date('2020-01-01'),
            salary: 25000000,
            role: 'admin',
            isActive: true,
        },
    });

    await prisma.staff.create({
        data: {
            accountId: managerAccount.accountId,
            fullName: 'Trần Thị Manager',
            address: '456 Đường Nguyễn Huệ, Q1, TP.HCM',
            dateOfBirth: new Date('1988-05-20'),
            hireDate: new Date('2020-03-01'),
            salary: 20000000,
            role: 'manager',
            isActive: true,
        },
    });

    await prisma.staff.create({
        data: {
            accountId: waiter1Account.accountId,
            fullName: 'Lê Văn Waiter 1',
            address: '789 Đường Pasteur, Q3, TP.HCM',
            dateOfBirth: new Date('1995-08-10'),
            hireDate: new Date('2021-06-15'),
            salary: 8000000,
            role: 'waiter',
            isActive: true,
        },
    });

    await prisma.staff.create({
        data: {
            accountId: waiter2Account.accountId,
            fullName: 'Phạm Thị Waiter 2',
            address: '321 Đường Võ Văn Tần, Q3, TP.HCM',
            dateOfBirth: new Date('1996-12-25'),
            hireDate: new Date('2021-07-01'),
            salary: 8000000,
            role: 'waiter',
            isActive: true,
        },
    });

    await prisma.staff.create({
        data: {
            accountId: chef1Account.accountId,
            fullName: 'Hoàng Văn Chef 1',
            address: '654 Đường Hai Bà Trưng, Q1, TP.HCM',
            dateOfBirth: new Date('1990-03-30'),
            hireDate: new Date('2020-02-15'),
            salary: 15000000,
            role: 'chef',
            isActive: true,
        },
    });

    await prisma.staff.create({
        data: {
            accountId: chef2Account.accountId,
            fullName: 'Đặng Thị Chef 2',
            address: '987 Đường Cách Mạng Tháng 8, Q3, TP.HCM',
            dateOfBirth: new Date('1992-07-18'),
            hireDate: new Date('2020-05-20'),
            salary: 14000000,
            role: 'chef',
            isActive: true,
        },
    });

    await prisma.staff.create({
        data: {
            accountId: cashierAccount.accountId,
            fullName: 'Võ Văn Cashier',
            address: '147 Đường Lý Thường Kiệt, Q10, TP.HCM',
            dateOfBirth: new Date('1994-11-05'),
            hireDate: new Date('2021-01-10'),
            salary: 9000000,
            role: 'cashier',
            isActive: true,
        },
    });

    // ============================================
    // TẠO DANH MỤC
    // ============================================
    console.log('📋 Tạo danh mục...');

    const categories = await Promise.all([
        prisma.category.create({
            data: {
                categoryName: 'Khai vị',
                description: 'Món ăn khai vị nhẹ nhàng',
                displayOrder: 1,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                categoryName: 'Súp',
                description: 'Các loại súp nóng hổi',
                displayOrder: 2,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                categoryName: 'Salad',
                description: 'Salad tươi ngon',
                displayOrder: 3,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                categoryName: 'Món chính',
                description: 'Các món ăn chính phong phú',
                displayOrder: 4,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                categoryName: 'Hải sản',
                description: 'Hải sản tươi sống',
                displayOrder: 5,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                categoryName: 'Mì & Cơm',
                description: 'Món cơm và mì đặc sản',
                displayOrder: 6,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                categoryName: 'Tráng miệng',
                description: 'Các món tráng miệng ngọt ngào',
                displayOrder: 7,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                categoryName: 'Đồ uống',
                description: 'Nước giải khát',
                displayOrder: 8,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                categoryName: 'Rượu & Bia',
                description: 'Đồ uống có cồn',
                displayOrder: 9,
                isActive: true,
            },
        }),
    ]);

    // ============================================
    // TẠO MÓN ĂN
    // ============================================
    console.log('🍽️  Tạo món ăn...');

    // Khai vị
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'KV001',
                itemName: 'Gỏi cuốn tôm thịt',
                categoryId: categories[0].categoryId,
                price: 45000,
                cost: 20000,
                description: 'Gỏi cuốn tươi với tôm, thịt và rau thơm',
                isAvailable: true,
                preparationTime: 5,
                spicyLevel: 0,
                isVegetarian: false,
                calories: 150,
                imagePath: 'menu/goi-cuon-tom-thit.jpg',
            },
            {
                itemCode: 'KV002',
                itemName: 'Chả giò chiên',
                categoryId: categories[0].categoryId,
                price: 50000,
                cost: 22000,
                description: 'Chả giò giòn rụm với nhân thịt',
                isAvailable: true,
                preparationTime: 10,
                spicyLevel: 0,
                isVegetarian: false,
                calories: 200,
                imagePath: 'menu/cha-gio-chien.jpg',
            },
            {
                itemCode: 'KV003',
                itemName: 'Nem nướng',
                categoryId: categories[0].categoryId,
                price: 55000,
                cost: 25000,
                description: 'Nem nướng thơm ngon với nước chấm đặc biệt',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 1,
                isVegetarian: false,
                calories: 180,
                imagePath: 'menu/nem-nuong.jpg',
            },
        ],
    });

    // Súp
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'SP001',
                itemName: 'Súp cua',
                categoryId: categories[1].categoryId,
                price: 65000,
                cost: 30000,
                description: 'Súp cua thịt thơm ngon',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 0,
                isVegetarian: false,
                imagePath: 'menu/sup-cua.jpg',
            },
            {
                itemCode: 'SP002',
                itemName: 'Súp hải sản',
                categoryId: categories[1].categoryId,
                price: 75000,
                cost: 35000,
                description: 'Súp hải sản tươi ngon',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 0,
                isVegetarian: false,
                imagePath: 'menu/sup-hai-san.jpg',
            },
        ],
    });

    // Salad
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'SL001',
                itemName: 'Salad Caesar',
                categoryId: categories[2].categoryId,
                price: 85000,
                cost: 40000,
                description: 'Salad Caesar truyền thống',
                isAvailable: true,
                preparationTime: 8,
                isVegetarian: false,
                imagePath: 'menu/salad-caesar.jpg',
            },
            {
                itemCode: 'SL002',
                itemName: 'Salad rau củ',
                categoryId: categories[2].categoryId,
                price: 70000,
                cost: 35000,
                description: 'Salad rau củ tươi mát',
                isAvailable: true,
                preparationTime: 8,
                isVegetarian: true,
                imagePath: 'menu/salad-rau-cu.jpg',
            },
            {
                itemCode: 'SL003',
                itemName: 'Salad tôm',
                categoryId: categories[2].categoryId,
                price: 95000,
                cost: 45000,
                description: 'Salad với tôm tươi',
                isAvailable: true,
                preparationTime: 10,
                isVegetarian: false,
                imagePath: 'menu/salad-tom.jpg',
            },
        ],
    });

    // Món chính
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'MC001',
                itemName: 'Bò lúc lắc',
                categoryId: categories[3].categoryId,
                price: 185000,
                cost: 90000,
                description: 'Thịt bò lúc lắc với khoai tây chiên',
                isAvailable: true,
                preparationTime: 20,
                spicyLevel: 1,
                imagePath: 'menu/bo-luc-lac.jpg',
            },
            {
                itemCode: 'MC002',
                itemName: 'Gà nướng mật ong',
                categoryId: categories[3].categoryId,
                price: 145000,
                cost: 70000,
                description: 'Gà nướng mật ong thơm ngon',
                isAvailable: true,
                preparationTime: 25,
                spicyLevel: 0,
                imagePath: 'menu/ga-nuong-mat-ong.jpg',
            },
            {
                itemCode: 'MC003',
                itemName: 'Sườn nướng BBQ',
                categoryId: categories[3].categoryId,
                price: 165000,
                cost: 80000,
                description: 'Sườn nướng sốt BBQ',
                isAvailable: true,
                preparationTime: 30,
                spicyLevel: 1,
                imagePath: 'menu/suon-nuong-bbq.jpg',
            },
            {
                itemCode: 'MC004',
                itemName: 'Bít tết bò Úc',
                categoryId: categories[3].categoryId,
                price: 285000,
                cost: 140000,
                description: 'Bít tết bò Úc cao cấp',
                isAvailable: true,
                preparationTime: 25,
                spicyLevel: 0,
                imagePath: 'menu/bit-tet-bo-uc.jpg',
            },
            {
                itemCode: 'MC005',
                itemName: 'Vịt quay Bắc Kinh',
                categoryId: categories[3].categoryId,
                price: 195000,
                cost: 95000,
                description: 'Vịt quay kiểu Bắc Kinh',
                isAvailable: true,
                preparationTime: 35,
                spicyLevel: 0,
                imagePath: 'menu/vit-quay-bac-kinh.jpg',
            },
        ],
    });

    // Hải sản
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'HS001',
                itemName: 'Tôm hùm nướng',
                categoryId: categories[4].categoryId,
                price: 550000,
                cost: 280000,
                description: 'Tôm hùm nướng bơ tỏi',
                isAvailable: true,
                preparationTime: 30,
                spicyLevel: 0,
                imagePath: 'menu/tom-hum-nuong.jpg',
            },
            {
                itemCode: 'HS002',
                itemName: 'Cua rang me',
                categoryId: categories[4].categoryId,
                price: 285000,
                cost: 140000,
                description: 'Cua rang me đặc biệt',
                isAvailable: true,
                preparationTime: 25,
                spicyLevel: 2,
                imagePath: 'menu/cua-rang-me.jpg',
            },
            {
                itemCode: 'HS003',
                itemName: 'Cá hồi nướng',
                categoryId: categories[4].categoryId,
                price: 245000,
                cost: 120000,
                description: 'Cá hồi nướng sốt teriyaki',
                isAvailable: true,
                preparationTime: 20,
                spicyLevel: 0,
                imagePath: 'menu/ca-hoi-nuong.jpg',
            },
            {
                itemCode: 'HS004',
                itemName: 'Mực xào sa tế',
                categoryId: categories[4].categoryId,
                price: 165000,
                cost: 80000,
                description: 'Mực tươi xào sa tế cay',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 3,
                imagePath: 'menu/muc-xao-sa-te.jpg',
            },
            {
                itemCode: 'HS005',
                itemName: 'Nghêu hấp sả',
                categoryId: categories[4].categoryId,
                price: 145000,
                cost: 70000,
                description: 'Nghêu hấp sả cay',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 2,
                imagePath: 'menu/ngheu-hap-sa.jpg',
            },
        ],
    });

    // Mì & Cơm
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'MR001',
                itemName: 'Cơm chiên Dương Châu',
                categoryId: categories[5].categoryId,
                price: 75000,
                cost: 35000,
                description: 'Cơm chiên truyền thống',
                isAvailable: true,
                preparationTime: 12,
                spicyLevel: 0,
                imagePath: 'menu/com-chien-duong-chau.jpg',
            },
            {
                itemCode: 'MR002',
                itemName: 'Phở bò đặc biệt',
                categoryId: categories[5].categoryId,
                price: 85000,
                cost: 40000,
                description: 'Phở bò tái nạm gầu gân',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 0,
                imagePath: 'menu/pho-bo-dac-biet.jpg',
            },
            {
                itemCode: 'MR003',
                itemName: 'Mì xào hải sản',
                categoryId: categories[5].categoryId,
                price: 95000,
                cost: 45000,
                description: 'Mì xào với hải sản tươi',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 1,
                imagePath: 'menu/mi-xao-hai-san.jpg',
            },
            {
                itemCode: 'MR004',
                itemName: 'Cơm gà Hải Nam',
                categoryId: categories[5].categoryId,
                price: 85000,
                cost: 40000,
                description: 'Cơm gà Hải Nam đặc biệt',
                isAvailable: true,
                preparationTime: 20,
                spicyLevel: 0,
                imagePath: 'menu/com-ga-hai-nam.jpg',
            },
            {
                itemCode: 'MR005',
                itemName: 'Bún bò Huế',
                categoryId: categories[5].categoryId,
                price: 80000,
                cost: 38000,
                description: 'Bún bò Huế cay',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 3,
                imagePath: 'menu/bun-bo-hue.jpg',
            },
        ],
    });

    // Tráng miệng
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'TM001',
                itemName: 'Bánh flan caramel',
                categoryId: categories[6].categoryId,
                price: 35000,
                cost: 15000,
                description: 'Bánh flan caramel mềm mịn',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 180,
                imagePath: 'menu/banh-flan-caramel.jpg',
            },
            {
                itemCode: 'TM002',
                itemName: 'Kem dừa',
                categoryId: categories[6].categoryId,
                price: 40000,
                cost: 18000,
                description: 'Kem dừa tươi mát',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 200,
                imagePath: 'menu/kem-dua.jpg',
            },
            {
                itemCode: 'TM003',
                itemName: 'Chè ba màu',
                categoryId: categories[6].categoryId,
                price: 30000,
                cost: 12000,
                description: 'Chè ba màu truyền thống',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 150,
                imagePath: 'menu/che-ba-mau.jpg',
            },
            {
                itemCode: 'TM004',
                itemName: 'Tiramisu',
                categoryId: categories[6].categoryId,
                price: 55000,
                cost: 25000,
                description: 'Tiramisu Ý đặc biệt',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 250,
                imagePath: 'menu/tiramisu.jpg',
            },
        ],
    });

    // Đồ uống
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'DU001',
                itemName: 'Trà đá',
                categoryId: categories[7].categoryId,
                price: 10000,
                cost: 3000,
                description: 'Trá đá mát lạnh',
                isAvailable: true,
                preparationTime: 2,
                isVegetarian: true,
                calories: 0,
                imagePath: 'menu/tra-da.jpg',
            },
            {
                itemCode: 'DU002',
                itemName: 'Nước chanh',
                categoryId: categories[7].categoryId,
                price: 20000,
                cost: 8000,
                description: 'Nước chanh tươi',
                isAvailable: true,
                preparationTime: 3,
                isVegetarian: true,
                calories: 50,
                imagePath: 'menu/nuoc-chanh.jpg',
            },
            {
                itemCode: 'DU003',
                itemName: 'Cà phê đen',
                categoryId: categories[7].categoryId,
                price: 25000,
                cost: 10000,
                description: 'Cà phê đen truyền thống',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 5,
                imagePath: 'menu/ca-phe-den.jpg',
            },
            {
                itemCode: 'DU004',
                itemName: 'Cà phê sữa',
                categoryId: categories[7].categoryId,
                price: 28000,
                cost: 12000,
                description: 'Cà phê sữa đá',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 120,
                imagePath: 'menu/ca-phe-sua.jpg',
            },
            {
                itemCode: 'DU005',
                itemName: 'Nước cam',
                categoryId: categories[7].categoryId,
                price: 35000,
                cost: 15000,
                description: 'Nước cam vắt tươi',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 110,
                imagePath: 'menu/nuoc-cam.jpg',
            },
            {
                itemCode: 'DU006',
                itemName: 'Sinh tố bơ',
                categoryId: categories[7].categoryId,
                price: 45000,
                cost: 20000,
                description: 'Sinh tố bơ sánh mịn',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 220,
                imagePath: 'menu/sinh-to-bo.jpg',
            },
            {
                itemCode: 'DU007',
                itemName: 'Trà sữa truyền thống',
                categoryId: categories[7].categoryId,
                price: 38000,
                cost: 16000,
                description: 'Trà sữa truyền thống thơm ngon',
                isAvailable: true,
                preparationTime: 5,
                isVegetarian: true,
                calories: 180,
                imagePath: 'menu/tra-sua-truyen-thong.jpg',
            },
        ],
    });

    // Rượu & Bia
    await prisma.menuItem.createMany({
        data: [
            {
                itemCode: 'RB001',
                itemName: 'Bia Heineken',
                categoryId: categories[8].categoryId,
                price: 35000,
                cost: 18000,
                description: 'Bia Heineken lon',
                isAvailable: true,
                preparationTime: 2,
                isVegetarian: true,
                calories: 150,
                imagePath: 'menu/bia-heineken.jpg',
            },
            {
                itemCode: 'RB002',
                itemName: 'Bia Tiger',
                categoryId: categories[8].categoryId,
                price: 30000,
                cost: 15000,
                description: 'Bia Tiger lon',
                isAvailable: true,
                preparationTime: 2,
                isVegetarian: true,
                calories: 140,
                imagePath: 'menu/bia-tiger.jpg',
            },
            {
                itemCode: 'RB003',
                itemName: 'Bia Sài Gòn',
                categoryId: categories[8].categoryId,
                price: 25000,
                cost: 12000,
                description: 'Bia Sài Gòn lon',
                isAvailable: true,
                preparationTime: 2,
                isVegetarian: true,
                calories: 135,
                imagePath: 'menu/bia-sai-gon.jpg',
            },
            {
                itemCode: 'RB004',
                itemName: 'Rượu vang đỏ',
                categoryId: categories[8].categoryId,
                price: 450000,
                cost: 250000,
                description: 'Rượu vang đỏ nhập khẩu',
                isAvailable: true,
                preparationTime: 3,
                isVegetarian: true,
                calories: 600,
                imagePath: 'menu/ruou-vang-do.jpg',
            },
            {
                itemCode: 'RB005',
                itemName: 'Rượu vang trắng',
                categoryId: categories[8].categoryId,
                price: 420000,
                cost: 230000,
                description: 'Rượu vang trắng nhập khẩu',
                isAvailable: true,
                preparationTime: 3,
                isVegetarian: true,
                calories: 580,
                imagePath: 'menu/ruou-vang-trang.jpg',
            },
        ],
    });

    // ============================================
    // TẠO BÀN ĂN
    // ============================================
    console.log('🪑 Tạo bàn ăn...');

    await prisma.restaurantTable.createMany({
        data: [
            // Tầng 1 - Khu vực chính
            {
                tableNumber: 'T01',
                tableName: 'Bàn 1',
                capacity: 4,
                minCapacity: 2,
                floor: 1,
                section: 'Indoor',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'T02',
                tableName: 'Bàn 2',
                capacity: 4,
                minCapacity: 2,
                floor: 1,
                section: 'Indoor',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'T03',
                tableName: 'Bàn 3',
                capacity: 6,
                minCapacity: 4,
                floor: 1,
                section: 'Indoor',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'T04',
                tableName: 'Bàn 4',
                capacity: 2,
                minCapacity: 1,
                floor: 1,
                section: 'Indoor',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'T05',
                tableName: 'Bàn 5',
                capacity: 4,
                minCapacity: 2,
                floor: 1,
                section: 'Indoor',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'T06',
                tableName: 'Bàn 6',
                capacity: 8,
                minCapacity: 6,
                floor: 1,
                section: 'Indoor',
                status: 'available',
                isActive: true,
            },

            // Tầng 1 - Khu vực ngoài trời
            {
                tableNumber: 'O01',
                tableName: 'Outdoor 1',
                capacity: 4,
                minCapacity: 2,
                floor: 1,
                section: 'Outdoor',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'O02',
                tableName: 'Outdoor 2',
                capacity: 4,
                minCapacity: 2,
                floor: 1,
                section: 'Outdoor',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'O03',
                tableName: 'Outdoor 3',
                capacity: 6,
                minCapacity: 4,
                floor: 1,
                section: 'Outdoor',
                status: 'available',
                isActive: true,
            },

            // Tầng 2 - Khu VIP
            {
                tableNumber: 'V01',
                tableName: 'VIP 1',
                capacity: 10,
                minCapacity: 6,
                floor: 2,
                section: 'VIP',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'V02',
                tableName: 'VIP 2',
                capacity: 12,
                minCapacity: 8,
                floor: 2,
                section: 'VIP',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'V03',
                tableName: 'VIP 3',
                capacity: 8,
                minCapacity: 6,
                floor: 2,
                section: 'VIP',
                status: 'available',
                isActive: true,
            },

            // Tầng 2 - Khu vườn
            {
                tableNumber: 'G01',
                tableName: 'Garden 1',
                capacity: 4,
                minCapacity: 2,
                floor: 2,
                section: 'Garden',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'G02',
                tableName: 'Garden 2',
                capacity: 6,
                minCapacity: 4,
                floor: 2,
                section: 'Garden',
                status: 'available',
                isActive: true,
            },
            {
                tableNumber: 'G03',
                tableName: 'Garden 3',
                capacity: 4,
                minCapacity: 2,
                floor: 2,
                section: 'Garden',
                status: 'available',
                isActive: true,
            },
        ],
    });

    // ============================================
    // TẠO KHÁCH HÀNG MẪU
    // ============================================
    // console.log('👥 Tạo khách hàng mẫu...');

    // const customers = await Promise.all([
    //     prisma.customer.create({
    //         data: {
    //             name: 'Nguyễn Nhật Minh',
    //             phoneNumber: '0905000001',
    //             email: 'minh.nguyen@example.com',
    //             birthday: new Date('1988-03-15'),
    //             preferences: { seating: 'window', favoriteTable: 'T05' },
    //             notes: 'Ưu tiên bàn gần cửa sổ cho các dịp kỷ niệm.',
    //             isVip: true,
    //         },
    //     }),
    //     prisma.customer.create({
    //         data: {
    //             name: 'Trần Khánh Vy',
    //             phoneNumber: '0905000002',
    //             email: 'vy.tran@example.com',
    //             birthday: new Date('1992-07-22'),
    //             preferences: { dietary: ['vegetarian'], favoriteFloor: 2 },
    //             notes: 'Ăn chay, tránh đậu phộng.',
    //             isVip: false,
    //         },
    //     }),
    //     prisma.customer.create({
    //         data: {
    //             name: 'Lê Quốc Huy',
    //             phoneNumber: '0905000003',
    //             email: 'huy.le@example.com',
    //             birthday: new Date('1985-11-02'),
    //             preferences: { seating: 'garden', drinks: ['red-wine'] },
    //             notes: 'Ưu tiên khu vườn, nhóm khách doanh nhân.',
    //             isVip: true,
    //         },
    //     }),
    //     prisma.customer.create({
    //         data: {
    //             name: 'Phạm Diễm Quỳnh',
    //             phoneNumber: '0905000004',
    //             email: 'quynh.pham@example.com',
    //             birthday: new Date('1996-01-18'),
    //             preferences: { favoriteSlot: '18:30', dessert: 'cheesecake' },
    //             notes: 'Thường đặt trước 1 tuần.',
    //             isVip: false,
    //         },
    //     }),
    //     prisma.customer.create({
    //         data: {
    //             name: 'Võ Anh Tú',
    //             phoneNumber: '0905000005',
    //             email: 'tu.vo@example.com',
    //             birthday: new Date('1990-09-09'),
    //             preferences: { seating: 'vip', specialOccasion: true },
    //             notes: 'Khách doanh nghiệp, thường đi nhóm lớn.',
    //             isVip: true,
    //         },
    //     }),
    // ]);

    // ============================================
    // TẠO ĐẶT BÀN MẪU
    // ============================================
    // console.log('📅 Tạo đặt bàn mẫu...');

    // const tables = await prisma.restaurantTable.findMany();
    // const staffMembers = await prisma.staff.findMany();
    // const manager = staffMembers.find((member) => member.role === 'manager');
    // const host = staffMembers.find((member) => member.role === 'waiter');

    // const daysFromNow = (offset: number) => {
    //     const date = new Date();
    //     date.setDate(date.getDate() + offset);
    //     date.setHours(0, 0, 0, 0);
    //     return date;
    // };

    // const timeOfDay = (hour: number, minute: number = 0) => {
    //     const time = new Date();
    //     time.setHours(hour, minute, 0, 0);
    //     return time;
    // };

    // type SeedStatus =
    //     | 'pending'
    //     | 'confirmed'
    //     | 'seated'
    //     | 'completed'
    //     | 'cancelled'
    //     | 'no_show';

    // const reservationSeeds: Array<{
    //     customer: Awaited<typeof customers>[number];
    //     table: (typeof tables)[number];
    //     dateOffset: number;
    //     time: { hour: number; minute?: number };
    //     partySize: number;
    //     status: SeedStatus;
    //     duration?: number;
    //     specialRequest?: string;
    //     depositAmount?: number;
    //     notes?: string;
    //     tags?: string[];
    //     createdBy?: number;
    //     confirmedAt?: Date;
    //     seatedAt?: Date;
    //     completedAt?: Date;
    //     cancelledAt?: Date;
    //     cancellationReason?: string;
    // }> = [
    //     {
    //         customer: customers[0]!,
    //         table: tables[0]!,
    //         dateOffset: 1,
    //         time: { hour: 18 },
    //         partySize: 4,
    //         status: 'pending',
    //         specialRequest: 'Cần bàn gần cửa sổ',
    //         tags: ['window'],
    //         createdBy: host?.staffId,
    //     },
    //     {
    //         customer: customers[1]!,
    //         table: tables[5]!,
    //         dateOffset: 2,
    //         time: { hour: 19 },
    //         partySize: 6,
    //         status: 'confirmed',
    //         specialRequest: 'Bữa tối gia đình, cần ghế trẻ em',
    //         tags: ['family'],
    //         createdBy: manager?.staffId,
    //         confirmedAt: new Date(),
    //     },
    //     {
    //         customer: customers[2]!,
    //         table: tables[11]!,
    //         dateOffset: 0,
    //         time: { hour: 20, minute: 30 },
    //         partySize: 8,
    //         status: 'seated',
    //         tags: ['vip'],
    //         createdBy: manager?.staffId,
    //         confirmedAt: new Date(),
    //         seatedAt: new Date(),
    //     },
    //     {
    //         customer: customers[3]!,
    //         table: tables[2]!,
    //         dateOffset: -1,
    //         time: { hour: 12, minute: 30 },
    //         partySize: 2,
    //         status: 'completed',
    //         notes: 'Khách hài lòng, tip cao',
    //         createdBy: host?.staffId,
    //         confirmedAt: new Date(),
    //         seatedAt: new Date(),
    //         completedAt: new Date(),
    //     },
    //     {
    //         customer: customers[4]!,
    //         table: tables[10]!,
    //         dateOffset: 3,
    //         time: { hour: 19, minute: 30 },
    //         partySize: 10,
    //         status: 'cancelled',
    //         specialRequest: 'Tiệc doanh nghiệp',
    //         tags: ['business'],
    //         createdBy: manager?.staffId,
    //         confirmedAt: new Date(),
    //         cancelledAt: new Date(),
    //         cancellationReason: 'Khách hủy do thay đổi lịch',
    //     },
    //     {
    //         customer: customers[1]!,
    //         table: tables[3]!,
    //         dateOffset: -2,
    //         time: { hour: 18 },
    //         partySize: 2,
    //         status: 'no_show',
    //         notes: 'Không liên lạc được khách',
    //         tags: ['follow-up'],
    //         createdBy: host?.staffId,
    //         confirmedAt: new Date(),
    //     },
    //     {
    //         customer: customers[0]!,
    //         table: tables[7]!,
    //         dateOffset: 5,
    //         time: { hour: 21 },
    //         partySize: 4,
    //         status: 'confirmed',
    //         tags: ['vip', 'anniversary'],
    //         specialRequest: 'Trang trí hoa cho lễ kỷ niệm',
    //         createdBy: manager?.staffId,
    //         confirmedAt: new Date(),
    //     },
    //     {
    //         customer: customers[2]!,
    //         table: tables[8]!,
    //         dateOffset: 4,
    //         time: { hour: 17, minute: 30 },
    //         partySize: 6,
    //         status: 'pending',
    //         depositAmount: 300000,
    //         tags: ['team-dinner'],
    //         createdBy: host?.staffId,
    //     },
    //     {
    //         customer: customers[3]!,
    //         table: tables[1]!,
    //         dateOffset: 0,
    //         time: { hour: 13 },
    //         partySize: 3,
    //         status: 'completed',
    //         notes: 'Bữa trưa công sở',
    //         createdBy: host?.staffId,
    //         confirmedAt: new Date(),
    //         seatedAt: new Date(),
    //         completedAt: new Date(),
    //     },
    //     {
    //         customer: customers[4]!,
    //         table: tables[12]!,
    //         dateOffset: 7,
    //         time: { hour: 18 },
    //         partySize: 12,
    //         status: 'confirmed',
    //         tags: ['vip', 'corporate'],
    //         specialRequest: 'Cần máy chiếu mini',
    //         createdBy: manager?.staffId,
    //         confirmedAt: new Date(),
    //     },
    // ];

    // for (const seed of reservationSeeds) {
    //     await prisma.reservation.create({
    //         data: {
    //             customerName: seed.customer.name,
    //             phoneNumber: seed.customer.phoneNumber,
    //             email: seed.customer.email,
    //             customerId: seed.customer.customerId,
    //             tableId: seed.table.tableId,
    //             reservationDate: daysFromNow(seed.dateOffset),
    //             reservationTime: timeOfDay(
    //                 seed.time.hour,
    //                 seed.time.minute ?? 0,
    //             ),
    //             duration: seed.duration ?? 120,
    //             partySize: seed.partySize,
    //             specialRequest: seed.specialRequest,
    //             depositAmount: seed.depositAmount,
    //             status: seed.status,
    //             notes: seed.notes,
    //             tags: seed.tags ?? [],
    //             createdBy: seed.createdBy,
    //             confirmedAt: seed.confirmedAt,
    //             seatedAt: seed.seatedAt,
    //             completedAt: seed.completedAt,
    //             cancelledAt: seed.cancelledAt,
    //             cancellationReason: seed.cancellationReason,
    //         },
    //     });
    // }

    // ============================================
    // TẠO CÀI ĐẶT NHÀ HÀNG
    // ============================================
    console.log('⚙️  Tạo cài đặt nhà hàng...');

    await prisma.restaurantSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Nhà Hàng Việt Nam',
            tagline: 'Hương vị truyền thống - Phong cách hiện đại',
            description:
                'Trải nghiệm ẩm thực Việt Nam đích thực với không gian sang trọng và dịch vụ tận tâm',
            aboutTitle: 'Chào mừng đến với Nhà Hàng Việt Nam',
            aboutContent: `Được thành lập từ năm 2010, Nhà Hàng Việt Nam tự hào là điểm đến ẩm thực hàng đầu, nơi hội tụ tinh hoa ẩm thực truyền thống Việt Nam với phong cách phục vụ hiện đại.

Với đội ngũ đầu bếp giàu kinh nghiệm và nguyên liệu tươi ngon được chọn lọc kỹ càng mỗi ngày, chúng tôi cam kết mang đến cho quý khách những món ăn ngon miệng, đẹp mắt và đậm đà hương vị.

Không gian nhà hàng được thiết kế tinh tế, kết hợp giữa nét đẹp truyền thống và sự tiện nghi hiện đại, tạo nên bầu không khí ấm cúng và sang trọng cho mọi dịp sum họp.`,
            address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
            phone: '028-1234-5678',
            email: 'info@nhahangvietnam.com',
            mapEmbedUrl:
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674198045!2d106.70142631533417!3d10.77644439231945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670640625%3A0xd28b9f60b2d2f4c0!2zMTIzIE5ndXnhu4VuIEh14buHLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1234567890',
            heroImage: 'settings/hero-restaurant.jpg',
            aboutImage: 'settings/about-restaurant.jpg',
            logoUrl: 'settings/logo.png',
            operatingHours: [
                { day: 'Thứ Hai - Thứ Sáu', hours: '10:00 - 22:00' },
                { day: 'Thứ Bảy - Chủ Nhật', hours: '09:00 - 23:00' },
                { day: 'Ngày lễ', hours: '09:00 - 23:00' },
            ],
            socialLinks: [
                {
                    platform: 'Facebook',
                    url: 'https://facebook.com/nhahangvietnam',
                    icon: 'facebook',
                },
                {
                    platform: 'Instagram',
                    url: 'https://instagram.com/nhahangvietnam',
                    icon: 'instagram',
                },
                {
                    platform: 'TikTok',
                    url: 'https://tiktok.com/@nhahangvietnam',
                    icon: 'tiktok',
                },
            ],
            highlights: [
                { icon: '🏆', label: 'Năm kinh nghiệm', value: '15+' },
                { icon: '👨‍🍳', label: 'Đầu bếp chuyên nghiệp', value: '10+' },
                { icon: '⭐', label: 'Khách hàng hài lòng', value: '50K+' },
                { icon: '🍽️', label: 'Món ăn đặc sắc', value: '100+' },
            ],
        },
    });

    console.log('✅ Seed dữ liệu hoàn tất!');
    console.log(`
📊 Tổng kết:
- ${await prisma.account.count()} tài khoản
- ${await prisma.staff.count()} nhân viên
- ${await prisma.category.count()} danh mục
- ${await prisma.menuItem.count()} món ăn
- ${await prisma.restaurantTable.count()} bàn ăn
- ${await prisma.customer.count()} khách hàng
- ${await prisma.reservation.count()} đặt bàn
- ${await prisma.restaurantSettings.count()} cài đặt nhà hàng

🔑 Thông tin đăng nhập:
Username: admin, manager01, waiter01, waiter02, chef01, chef02, cashier01
Password: admin123 (cho tất cả tài khoản)
  `);
}

main()
    .catch((e) => {
        console.error('❌ Lỗi khi seed dữ liệu:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
