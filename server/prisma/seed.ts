/// <reference types="node" />
import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
    await prisma.reservation.deleteMany();
    await prisma.restaurantTable.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.account.deleteMany();

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
            },
            {
                itemCode: 'KV004',
                itemName: 'Gỏi cuốn chay',
                categoryId: categories[0].categoryId,
                price: 40000,
                cost: 18000,
                description: 'Gỏi cuốn chay với đậu hũ và rau củ',
                isAvailable: true,
                preparationTime: 5,
                spicyLevel: 0,
                isVegetarian: true,
                calories: 120,
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
            },
            {
                itemCode: 'SP003',
                itemName: 'Súp gà nấm',
                categoryId: categories[1].categoryId,
                price: 60000,
                cost: 28000,
                description: 'Súp gà nấm bổ dưỡng',
                isAvailable: true,
                preparationTime: 15,
                spicyLevel: 0,
                isVegetarian: false,
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
            { tableNumber: 'T01', tableName: 'Bàn 1', capacity: 4, minCapacity: 2, floor: 1, section: 'Indoor', status: 'available', isActive: true },
            { tableNumber: 'T02', tableName: 'Bàn 2', capacity: 4, minCapacity: 2, floor: 1, section: 'Indoor', status: 'available', isActive: true },
            { tableNumber: 'T03', tableName: 'Bàn 3', capacity: 6, minCapacity: 4, floor: 1, section: 'Indoor', status: 'available', isActive: true },
            { tableNumber: 'T04', tableName: 'Bàn 4', capacity: 2, minCapacity: 1, floor: 1, section: 'Indoor', status: 'available', isActive: true },
            { tableNumber: 'T05', tableName: 'Bàn 5', capacity: 4, minCapacity: 2, floor: 1, section: 'Indoor', status: 'available', isActive: true },
            { tableNumber: 'T06', tableName: 'Bàn 6', capacity: 8, minCapacity: 6, floor: 1, section: 'Indoor', status: 'available', isActive: true },

            // Tầng 1 - Khu vực ngoài trời
            { tableNumber: 'O01', tableName: 'Outdoor 1', capacity: 4, minCapacity: 2, floor: 1, section: 'Outdoor', status: 'available', isActive: true },
            { tableNumber: 'O02', tableName: 'Outdoor 2', capacity: 4, minCapacity: 2, floor: 1, section: 'Outdoor', status: 'available', isActive: true },
            { tableNumber: 'O03', tableName: 'Outdoor 3', capacity: 6, minCapacity: 4, floor: 1, section: 'Outdoor', status: 'available', isActive: true },

            // Tầng 2 - Khu VIP
            { tableNumber: 'V01', tableName: 'VIP 1', capacity: 10, minCapacity: 6, floor: 2, section: 'VIP', status: 'available', isActive: true },
            { tableNumber: 'V02', tableName: 'VIP 2', capacity: 12, minCapacity: 8, floor: 2, section: 'VIP', status: 'available', isActive: true },
            { tableNumber: 'V03', tableName: 'VIP 3', capacity: 8, minCapacity: 6, floor: 2, section: 'VIP', status: 'available', isActive: true },

            // Tầng 2 - Khu vườn
            { tableNumber: 'G01', tableName: 'Garden 1', capacity: 4, minCapacity: 2, floor: 2, section: 'Garden', status: 'available', isActive: true },
            { tableNumber: 'G02', tableName: 'Garden 2', capacity: 6, minCapacity: 4, floor: 2, section: 'Garden', status: 'available', isActive: true },
            { tableNumber: 'G03', tableName: 'Garden 3', capacity: 4, minCapacity: 2, floor: 2, section: 'Garden', status: 'available', isActive: true },
        ],
    });

    // ============================================
    // TẠO ĐẶT BÀN MẪU
    // ============================================
    console.log('📅 Tạo đặt bàn mẫu...');

    const tables = await prisma.restaurantTable.findMany();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await prisma.reservation.create({
        data: {
            customerName: 'Nguyễn Văn A',
            phoneNumber: '0912345678',
            email: 'nguyenvana@example.com',
            tableId: tables[0]!.tableId,
            reservationDate: tomorrow,
            reservationTime: new Date('2024-01-01T18:00:00'),
            duration: 120,
            headCount: 4,
            specialRequest: 'Cần bàn gần cửa sổ',
            depositAmount: 200000,
            status: 'confirmed',
        },
    });

    await prisma.reservation.create({
        data: {
            customerName: 'Trần Thị B',
            phoneNumber: '0923456789',
            email: 'tranthib@example.com',
            tableId: tables[9]!.tableId, // VIP table
            reservationDate: tomorrow,
            reservationTime: new Date('2024-01-01T19:00:00'),
            duration: 180,
            headCount: 8,
            specialRequest: 'Tiệc sinh nhật, cần bánh kem',
            depositAmount: 500000,
            status: 'confirmed',
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
- ${await prisma.reservation.count()} đặt bàn

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
    });
