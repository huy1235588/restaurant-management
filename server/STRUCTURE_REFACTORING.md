# Backend Structure Refactoring Guide

## 📁 New Structure

Cấu trúc backend đã được tối ưu hóa theo **Feature-Based Architecture** để dễ quản lý và mở rộng.

```
server/src/
├── shared/                          # Shared resources
│   ├── constants/                   # Application constants
│   │   ├── app.constants.ts
│   │   ├── error.constants.ts
│   │   ├── validation.constants.ts
│   │   └── index.ts
│   ├── types/                       # Shared TypeScript types
│   │   ├── api.types.ts
│   │   ├── enums.types.ts
│   │   ├── entity.types.ts
│   │   └── index.ts
│   ├── dtos/                        # Data Transfer Objects
│   │   ├── pagination.dto.ts
│   │   ├── response.dto.ts
│   │   └── index.ts
│   ├── utils/                       # Utility functions
│   │   ├── auth.ts
│   │   ├── errors.ts
│   │   ├── response.ts
│   │   ├── socket.ts
│   │   ├── helpers/
│   │   └── index.ts
│   ├── validators/                  # Common validators
│   │   └── schemas/
│   │       └── common.schema.ts
│   └── middlewares/                 # Express middlewares
│       ├── auth.ts
│       ├── errorHandler.ts
│       ├── validation.ts
│       └── index.ts
├── features/                        # Feature modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── account.repository.ts
│   │   ├── refreshToken.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── dtos/
│   │   │   ├── auth.dto.ts
│   │   │   ├── auth-response.dto.ts
│   │   │   └── index.ts
│   │   ├── validators/
│   │   │   ├── auth.schema.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── constants/
│   │   │   ├── auth.constants.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── menu/
│   │   ├── menu.controller.ts
│   │   ├── menu.service.ts
│   │   ├── menuItem.repository.ts
│   │   ├── menu.routes.ts
│   │   ├── dtos/
│   │   ├── validators/
│   │   └── index.ts
│   ├── order/
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   ├── order.repository.ts
│   │   ├── order.routes.ts
│   │   ├── dtos/
│   │   ├── validators/
│   │   └── index.ts
│   ├── bill/
│   ├── reservation/
│   ├── table/
│   ├── category/
│   ├── kitchen/
│   ├── payment/
│   └── staff/
├── config/
│   ├── database.ts
│   ├── index.ts
│   ├── logger.ts
│   └── swagger.ts                  # Swagger configuration
├── jobs/
│   └── cleanupTokens.ts
├── routes/
│   └── index.ts                    # Main routes aggregator
├── app.ts
└── index.ts
```

## 🎯 Benefits

### 1. **Feature-Based Organization**
- Mỗi feature có tất cả code liên quan trong một folder
- Dễ dàng tìm kiếm và maintain
- Team có thể làm việc độc lập trên các features khác nhau

### 2. **Clear Separation of Concerns**
- **shared/**: Code dùng chung cho toàn bộ app
- **features/**: Code cụ thể cho từng domain/feature
- **config/**: Configuration files

### 3. **Better Type Safety**
- DTOs cho input/output validation
- Types được tổ chức rõ ràng
- Validators với Zod schemas

### 4. **Scalability**
- Dễ thêm features mới
- Không làm lộn xộn cấu trúc hiện tại
- Có thể dễ dàng extract thành microservices sau này

## 📝 Import Changes

### Before:
```typescript
import { authenticate } from '@/middlewares/auth';
import ResponseHandler from '@/utils/response';
import { Role } from '@/types';
```

### After:
```typescript
import { authenticate } from '@/shared/middlewares';
import { ResponseHandler } from '@/shared/utils';
import { Role } from '@/shared/types';
```

## 🚀 Adding New Features

Khi thêm feature mới, làm theo template sau:

```
features/
└── your-feature/
    ├── your-feature.controller.ts
    ├── your-feature.service.ts
    ├── your-feature.repository.ts
    ├── your-feature.routes.ts
    ├── dtos/
    │   ├── create-your-feature.dto.ts
    │   ├── update-your-feature.dto.ts
    │   └── index.ts
    ├── validators/
    │   ├── your-feature.schema.ts
    │   └── index.ts
    ├── types/
    │   └── your-feature.types.ts
    ├── constants/
    │   └── your-feature.constants.ts
    └── index.ts
```

## 🔄 Migration Completed

✅ Moved all controllers to features/
✅ Moved all services to features/
✅ Moved all repositories to features/
✅ Moved all routes to features/
✅ Created shared/ directory structure
✅ Created DTOs and validators for auth
✅ Extracted swagger config to config/swagger.ts
✅ Updated all imports
✅ Removed old directories

## 📚 Next Steps

1. **Add DTOs and Validators** cho các features còn lại (menu, order, bill, etc.)
2. **Update tsconfig.json** paths nếu cần thiết
3. **Write tests** cho từng feature
4. **Document APIs** với Swagger comments
5. **Add helper functions** vào shared/utils/helpers/

## 🛠️ Development Guidelines

### Adding a New Endpoint:
1. Create/update DTO in `features/[feature]/dtos/`
2. Create/update validator in `features/[feature]/validators/`
3. Implement in controller
4. Add route in `features/[feature]/[feature].routes.ts`
5. Update `routes/index.ts` nếu cần

### Sharing Code:
- Nếu code được dùng bởi >= 2 features → Move to `shared/`
- Nếu code chỉ dùng trong 1 feature → Giữ trong feature đó

## 🎨 Code Organization Tips

1. **Keep features independent** - Tránh circular dependencies
2. **Use barrel exports** - Export từ index.ts để import dễ hơn
3. **Consistent naming** - [feature].[type].ts (e.g., auth.controller.ts)
4. **Document public APIs** - Add JSDoc comments cho các hàm public

---

**Last Updated**: October 23, 2025
**Migration Status**: ✅ Complete
