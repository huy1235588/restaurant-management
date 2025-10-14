# 🎉 Backend TypeScript Setup Complete!

## ✅ Đã hoàn thành

### 1. **Cấu trúc dự án theo Clean Architecture**
```
server/src/
├── config/          # Database, Logger, Environment Config
├── types/           # TypeScript Interfaces & Types
├── validators/      # Zod Validation Schemas
├── utils/           # Auth, Errors, Response, Socket utilities
├── middlewares/     # Authentication, Validation, Error Handling
├── repositories/    # Data Access Layer (Prisma queries)
├── services/        # Business Logic Layer
├── controllers/     # HTTP Request Handlers
├── routes/          # API Route Definitions
├── app.ts           # Express Application Setup
└── index.ts         # Server Entry Point
```

### 2. **Công nghệ & Dependencies**
- ✅ TypeScript với strict mode
- ✅ Express.js với middleware stack đầy đủ
- ✅ Prisma ORM đã generate client
- ✅ JWT Authentication (access & refresh tokens)
- ✅ Zod Schema Validation
- ✅ Socket.IO cho real-time
- ✅ Winston Logger
- ✅ Security: Helmet, CORS, Rate Limiting

### 3. **Features đã implement**
- ✅ Authentication & Authorization
- ✅ Role-based Access Control (5 roles)
- ✅ Order Management (CRUD + Status tracking)
- ✅ Bill & Payment Processing
- ✅ Real-time WebSocket Events
- ✅ Error Handling với custom error classes
- ✅ Request Validation
- ✅ Database Transaction support

## 🚀 Cách chạy

### 1. Cấu hình database
Sửa file `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/restaurant_db"
JWT_SECRET="your-super-secret-key-change-in-production"
PORT=5000
```

### 2. Chạy migration database
```bash
pnpm dlx prisma migrate dev --name init
```

### 3. Chạy seed data
```bash
pnpm dlx prisma db seed
```

### 4. Khởi động server

**Development mode:**
```bash
npm run dev
# hoặc
pnpm dev
```

**Production:**
```bash
pnpm run build
pnpm start
```

### 4. Test API
Server sẽ chạy tại: `http://localhost:5000`

Health check: `http://localhost:5000/api/v1/health`

## 📡 API Endpoints

### Auth
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký (Admin only)
- `POST /api/v1/auth/staff` - Tạo nhân viên
- `POST /api/v1/auth/refresh` - Refresh token

### Orders
- `POST /api/v1/orders` - Tạo order mới
- `GET /api/v1/orders` - Lấy danh sách orders
- `GET /api/v1/orders/:id` - Lấy chi tiết order
- `PUT /api/v1/orders/:id` - Cập nhật order
- `PATCH /api/v1/orders/:id/status` - Cập nhật trạng thái
- `POST /api/v1/orders/:id/items` - Thêm món vào order
- `POST /api/v1/orders/:id/cancel` - Hủy order

### Bills
- `POST /api/v1/bills` - Tạo bill từ order
- `GET /api/v1/bills/:id` - Lấy chi tiết bill
- `POST /api/v1/bills/:id/payment` - Xử lý thanh toán
- `GET /api/v1/bills/revenue` - Thống kê doanh thu

## 🔐 Authentication

### Login Request
```json
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "accountId": 1,
      "staffId": 1,
      "username": "admin",
      "fullName": "Nguyễn Văn Admin",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Sử dụng token
```
Authorization: Bearer <accessToken>
```

## 🎭 User Roles

1. **admin** - Toàn quyền hệ thống
2. **manager** - Quản lý vận hành, xem báo cáo
3. **waiter** - Nhận order, quản lý bàn
4. **chef** - Xem và cập nhật order bếp
5. **cashier** - Xử lý thanh toán

## 👥 Test Accounts

Sau khi chạy seed data, hệ thống sẽ có các tài khoản test sau (mật khẩu chung: `admin123`):

| Username | Role | Full Name |
|----------|------|-----------|
| `admin` | admin | Nguyễn Văn Admin |
| `manager01` | manager | Trần Thị Manager |
| `waiter01` | waiter | Lê Văn Waiter 1 |
| `waiter02` | waiter | Phạm Thị Waiter 2 |
| `chef01` | chef | Hoàng Văn Chef 1 |
| `chef02` | chef | Đặng Thị Chef 2 |
| `cashier01` | cashier | Võ Văn Cashier |

## 🔌 WebSocket Events

### Kết nối
```javascript
import io from 'socket.io-client';
const socket = io('http://localhost:5000');
```

### Events
```javascript
// Join table room
socket.emit('join:table', tableId);

// Listen for order updates
socket.on('order:new', (data) => {
  console.log('New order:', data);
});

socket.on('order:status', (data) => {
  console.log('Order status updated:', data);
});
```

## 📝 Next Steps

### Các tính năng có thể thêm:

1. **Menu & Category Management**
   - CRUD operations cho menu items
   - Category management
   - Upload hình ảnh

2. **Table Management**
   - CRUD operations cho bàn
   - QR code generation
   - Table status tracking

3. **Reservation System**
   - Đặt bàn trước
   - Xác nhận đặt bàn
   - Quản lý booking

4. **Kitchen Management**
   - Kitchen order queue
   - Priority management
   - Chef assignment

5. **Staff Management**
   - CRUD operations
   - Attendance tracking
   - Performance metrics

6. **Reporting & Analytics**
   - Daily/Monthly revenue reports
   - Popular items analysis
   - Staff performance

7. **Notifications**
   - Email notifications
   - SMS notifications
   - Push notifications

8. **File Upload**
   - Image upload cho menu
   - Receipt generation (PDF)

## 🐛 Debugging

### Kiểm tra logs
```bash
# Development logs (terminal)
pnpm run dev

# Production logs
tail -f logs/all.log
tail -f logs/error.log
```

### Database issues
```bash
# Reset database
pnpm dlx prisma migrate reset

# View database
pnpm dlx prisma studio
```

### TypeScript errors
```bash
# Check types
pnpm dlx tsc --noEmit

# Fix linting
pnpm run lint
pnpm run format
```

## 📚 Documentation

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Socket.IO](https://socket.io/docs/v4/)
- [Zod](https://zod.dev/)

## 🎓 Code Examples

### Thêm Repository mới
```typescript
// src/repositories/example.repository.ts
import { prisma } from '../config/database';

export class ExampleRepository {
  async findAll() {
    return prisma.example.findMany();
  }
}

export default new ExampleRepository();
```

### Thêm Service mới
```typescript
// src/services/example.service.ts
import exampleRepository from '../repositories/example.repository';

export class ExampleService {
  async getAll() {
    return exampleRepository.findAll();
  }
}

export default new ExampleService();
```

### Thêm Controller mới
```typescript
// src/controllers/example.controller.ts
import { Response, NextFunction } from 'express';
import exampleService from '../services/example.service';
import ResponseHandler from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export class ExampleController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await exampleService.getAll();
      return ResponseHandler.success(res, 'Success', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ExampleController();
```

### Thêm Route mới
```typescript
// src/routes/example.routes.ts
import { Router } from 'express';
import exampleController from '../controllers/example.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);
router.get('/', exampleController.getAll.bind(exampleController));

export default router;
```

---

**Happy Coding! 🚀**
