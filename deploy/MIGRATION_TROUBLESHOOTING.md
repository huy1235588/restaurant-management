# Hướng Dẫn Xử Lý Lỗi Prisma Migration

## Lỗi Thường Gặp

### 1. Lỗi P3015: "Could not find the migration file at migration.sql"

**Nguyên nhân:** Có thư mục migration rỗng hoặc thiếu file `migration.sql`

**Triệu chứng:**
```
Error: P3015
Could not find the migration file at migration.sql. Please delete the directory or restore the migration file.
```

**Giải pháp:**

#### Development (Local)

```powershell
# 1. Tìm và xóa thư mục migration rỗng
cd app/server/prisma/migrations

# Xem các migration hiện có
ls

# Xóa thư mục rỗng (ví dụ: manual)
Remove-Item -Path "manual" -Recurse -Force

# 2. Chạy lại migrations
npx prisma migrate deploy

# 3. Regenerate Prisma Client
npx prisma generate

# 4. Build lại server
npm run build
```

#### Production (DigitalOcean VPS)

**Cách 1: Sử dụng script tự động (Khuyến nghị)**

```bash
# SSH vào server
ssh root@your-server-ip

# Chạy script fix-migrations
cd /opt/restaurant-management/deploy
bash digitalocean/scripts/fix-migrations.sh

# Chạy lại migrations
bash digitalocean/scripts/migrate.sh

# Restart containers nếu cần
docker compose -f docker-compose.prod.yml restart server
```

**Cách 2: Xử lý thủ công**

```bash
# SSH vào server
ssh root@your-server-ip

# Vào thư mục migrations
cd /opt/restaurant-management/app/server/prisma/migrations

# Kiểm tra các thư mục
ls -la

# Xóa thư mục rỗng
rm -rf manual  # hoặc tên thư mục rỗng khác

# Chạy migration trong container
cd /opt/restaurant-management/deploy
docker exec restaurant_server_prod npx prisma migrate deploy --schema prisma/schema.prisma

# Regenerate Prisma Client
docker exec restaurant_server_prod npx prisma generate --schema prisma/schema.prisma

# Restart server container
docker compose -f docker-compose.prod.yml restart server
```

### 2. Lỗi "The column `(not available)` does not exist"

**Nguyên nhân:** Database schema không đồng bộ với Prisma schema

**Giải pháp:**

#### Development

```powershell
# 1. Kiểm tra migration status
npx prisma migrate status

# 2. Apply pending migrations
npx prisma migrate deploy

# 3. Nếu có schema drift, reset database (chỉ dùng trên dev!)
npx prisma migrate reset

# 4. Regenerate client
npx prisma generate
```

#### Production

```bash
# Kiểm tra status
docker exec restaurant_server_prod npx prisma migrate status

# Apply pending migrations
bash /opt/restaurant-management/deploy/digitalocean/scripts/migrate.sh

# Restart services
docker compose -f docker-compose.prod.yml restart server
```

### 3. Migration đang pending nhưng không apply được

**Nguyên nhân:** Migration bị stuck hoặc database lock

**Giải pháp:**

```bash
# Production
cd /opt/restaurant-management/deploy

# Stop server để tránh conflict
docker compose -f docker-compose.prod.yml stop server

# Apply migrations
bash digitalocean/scripts/migrate.sh

# Start lại server
docker compose -f docker-compose.prod.yml start server
```

## Workflow Migration Chuẩn

### Development

1. Thay đổi Prisma schema (`schema.prisma`)
2. Tạo migration:
   ```powershell
   npx prisma migrate dev --name describe_your_change
   ```
3. Review migration SQL được tạo
4. Test trên dev database
5. Commit migration files vào Git

### Production Deployment

Script `deploy.sh` sẽ tự động:
1. Kiểm tra và xóa empty migration folders
2. Apply pending migrations
3. Regenerate Prisma Client
4. Restart services

Nếu cần chạy manual:
```bash
cd /opt/restaurant-management/deploy
bash digitalocean/scripts/migrate.sh
```

## Phòng Tránh Lỗi

### 1. Không tạo migration folder rỗng

- Luôn dùng `prisma migrate dev` để tạo migration
- Không tự tạo thư mục trong `prisma/migrations/`

### 2. Không edit migration đã apply

- Migration đã chạy không nên sửa
- Tạo migration mới nếu cần thay đổi

### 3. Backup trước khi migrate trên production

```bash
# Auto backup trong deploy script
bash /opt/restaurant-management/deploy/digitalocean/scripts/backup.sh

# Hoặc manual
pg_dump -U postgres restaurant_db > backup.sql
```

### 4. Test migration trên staging trước

- Deploy lên staging environment trước
- Verify không có lỗi
- Sau đó mới deploy production

## Commands Hữu Ích

### Development

```powershell
# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### Production

```bash
# Fix migration issues
bash /opt/restaurant-management/deploy/digitalocean/scripts/fix-migrations.sh

# Run migrations
bash /opt/restaurant-management/deploy/digitalocean/scripts/migrate.sh

# Check migration status
docker exec restaurant_server_prod npx prisma migrate status

# View migration logs
docker logs restaurant_server_prod | grep -i prisma

# Connect to database
docker exec -it restaurant_postgres_prod psql -U postgres -d restaurant_db
```

## Troubleshooting Checklist

Khi gặp lỗi migration, kiểm tra theo thứ tự:

- [ ] Database đang chạy và accessible
- [ ] Không có empty migration folders
- [ ] Tất cả migration files có đầy đủ `migration.sql`
- [ ] Database connection string đúng
- [ ] Không có process khác đang lock database
- [ ] Prisma Client đã được regenerate
- [ ] Server đã restart sau khi migrate

## Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề không giải quyết được:

1. Check logs: `docker logs restaurant_server_prod`
2. Check migration status: `npx prisma migrate status`
3. Check database: Connect và verify schema manually
4. Restore từ backup nếu cần thiết

## Tài Liệu Tham Khảo

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Troubleshooting Prisma](https://www.prisma.io/docs/guides/database/troubleshooting-orm)
- [Deployment Guide](../DEPLOYMENT_GUIDE_VI.md)
