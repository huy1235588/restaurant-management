# Base Repository & Service Pattern

Tài liệu hướng dẫn sử dụng `BaseRepository` và các class cơ sở để tối ưu và tái sử dụng code.

## Cấu trúc

```
src/shared/base/
├── base.repository.ts      # Base repository class với pagination & search
├── base.service.ts         # Base service class
└── index.ts                # Export chung
```

## Sử dụng BaseRepository

### 1. Định nghĩa Filter Interface

```typescript
// Tạo filter interface cho entity của bạn
interface YourEntityFilter {
    search?: string;
    categoryId?: number;
    isActive?: boolean;
    // ... các filter khác
}
```

### 2. Tạo Repository class

```typescript
import { BaseRepository, BaseFindOptions } from '@/shared/base';
import { Prisma } from '@prisma/client';

export class YourEntityRepository extends BaseRepository<YourEntity, YourEntityFilter> {
    
    // Override buildWhereClause để định nghĩa logic lọc
    protected buildWhereClause(filters?: YourEntityFilter): Prisma.YourEntityWhereInput {
        if (!filters) return {};
        
        const where: Prisma.YourEntityWhereInput = {};
        
        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { code: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        
        return where;
    }
    
    // Implement findAll
    async findAll(options?: BaseFindOptions<YourEntityFilter>): Promise<YourEntity[]> {
        const { filters, skip = 0, take = 10, sortBy = 'createdAt', sortOrder = 'asc' } = options || {};
        
        return prisma.yourEntity.findMany({
            where: this.buildWhereClause(filters),
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder),
        });
    }
    
    // Implement count
    async count(filters?: YourEntityFilter): Promise<number> {
        return prisma.yourEntity.count({
            where: this.buildWhereClause(filters),
        });
    }
    
    // Thêm các method cụ thể khác (findById, create, update, delete, v.v.)
}
```

### 3. Sử dụng trong Controller

```typescript
export class YourController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search, 
                categoryId, 
                sortBy = 'createdAt', 
                sortOrder = 'asc' 
            } = req.query;
            
            const result = await yourService.getAll({
                filters: {
                    search: search as string,
                    categoryId: categoryId ? parseInt(categoryId as string) : undefined,
                },
                skip: (parseInt(page as string) - 1) * parseInt(limit as string),
                take: parseInt(limit as string),
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string) as 'asc' | 'desc',
            });
            
            res.json(ApiResponse.success(result, 'Items retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}
```

## Lợi ích

✅ **DRY Principle**: Không phải viết lại logic pagination & search cho mỗi entity
✅ **Type-safe**: Sử dụng TypeScript generics để đảm bảo type safety
✅ **Consistent**: Toàn bộ ứng dụng theo cùng một pattern
✅ **Maintainable**: Dễ dàng cập nhật logic chung ở một nơi
✅ **Flexible**: Dễ dàng override hay mở rộng cho trường hợp đặc biệt

## Response Format

Tất cả các API sử dụng base class sẽ trả về format nhất quán:

```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

## Query Parameters

Tất cả các API sử dụng base pagination sẽ hỗ trợ:

- `page` (default: 1) - Số trang
- `limit` (default: 10, max: 100) - Số item mỗi trang
- `search` - Tìm kiếm text
- `sortBy` (default: 'createdAt') - Trường để sắp xếp
- `sortOrder` (default: 'asc') - Thứ tự: 'asc' hoặc 'desc'
- Các filter khác tùy theo entity

## Ví dụ API calls

```bash
# Lấy trang 1 với 20 items
GET /api/menu?page=1&limit=20

# Tìm kiếm
GET /api/menu?search=pizza

# Lọc và sắp xếp
GET /api/menu?categoryId=1&isActive=true&sortBy=price&sortOrder=desc

# Kết hợp
GET /api/menu?page=2&limit=15&search=chicken&categoryId=1&sortBy=itemName&sortOrder=asc
```
