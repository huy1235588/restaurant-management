# Proposal: Refactor Frontend Module Structure

## Why

Cấu trúc frontend hiện tại chưa nhất quán giữa các modules. Một số modules (như `tables`) đã theo cấu trúc tốt với phân chia rõ ràng components/views/dialogs, trong khi các modules khác (như `menu`, `categories`, `orders`) vẫn chưa được tổ chức tối ưu. Điều này gây khó khăn trong việc:
- Tìm kiếm và bảo trì code
- Onboarding developers mới
- Scale và mở rộng tính năng
- Tái sử dụng components

## What Changes

Chuẩn hóa cấu trúc tất cả các modules trong `src/modules/` theo mẫu của module `tables`:

### Current Structure Issues:
- ❌ Services nằm ở `src/services/` (riêng biệt, không theo feature)
- ❌ Shared components chưa được tổ chức rõ ràng
- ❌ Một số modules thiếu phân chia views/dialogs
- ❌ Hooks và utils chưa được tổ chức đồng nhất

### Target Structure:
- ✅ Mỗi module tự chứa components, hooks, services, types, utils
- ✅ Phân chia rõ ràng: components/views/dialogs
- ✅ Shared components độc lập ở `src/components/shared`
- ✅ UI components (shadcn/ui) ở `src/components/ui`
- ✅ Layouts và providers ở `src/components/layouts` và `src/components/providers`

### Modules to Refactor:
1. **Menu Module** - ✅ DONE - Tách MenuItemForm, thêm views/dialogs structure
2. **Categories Module** - ✅ DONE - Thêm views/dialogs, tổ chức lại components
3. **Reservations Module** - ✅ DONE - Tạo cấu trúc hoàn chỉnh
4. **Tables Module** - ✅ DONE - Đã tốt, đã merge visual editor

### Modules Excluded (Implement Fresh):
5. **Orders Module** - ❌ Sẽ triển khai mới từ đầu (không refactor)
6. **Kitchen Module** - ❌ Sẽ triển khai mới từ đầu (không refactor)

> **Lưu ý**: Đây là dự án cá nhân, không cần sidebar trong scope này

### Services Migration:
- Di chuyển từ `src/services/*.service.ts` vào từng module tương ứng
- Giữ lại `src/lib/` cho axios config, socket, utils chung

## Impact

### Affected Specs:
- `frontend-architecture` - Cấu trúc tổ chức frontend

### Affected Code:
- `app/client/src/modules/*` - Tất cả feature modules
- `app/client/src/services/*` - Di chuyển vào modules
- `app/client/src/components/*` - Tổ chức lại shared components
- `app/client/src/app/**/*.tsx` - Cập nhật imports trong pages
- Import paths trong toàn bộ codebase

### Breaking Changes:
- **BREAKING**: Import paths sẽ thay đổi từ `@/services/menu.service` thành `@/modules/menu/services`
- **BREAKING**: Component imports có thể thay đổi cấu trúc

### Benefits:
- 📦 Feature modules hoàn toàn độc lập, dễ test
- 🔍 Dễ dàng tìm kiếm code theo feature
- 🎯 Giảm coupling giữa các modules
- 📚 Cải thiện developer experience
- ♻️ Tăng khả năng tái sử dụng code
- 📖 Chuẩn hóa conventions cho toàn team

### Migration Path:
- Refactor từng module một, không phá vỡ existing functionality
- Sử dụng barrel exports (index.ts) để dễ dàng cập nhật imports
- Giữ backward compatibility trong quá trình migration nếu cần

## Timeline

- **Phase 1**: ✅ DONE - Setup cấu trúc mới và migrate Menu module (2-3 giờ)
- **Phase 2**: ✅ DONE - Migrate Categories module (1-2 giờ)
- **Phase 3**: ✅ DONE - Migrate Reservations module (2-3 giờ)
- **Phase 4**: ✅ DONE - Merge Visual Editor into Tables module (1-2 giờ)
- **Phase 5**: Cleanup và documentation (1 giờ)

**Total Completed**: ~8 giờ
**Remaining**: ~1 giờ

**Orders & Kitchen Modules**: Sẽ được triển khai hoàn toàn mới trong một change riêng biệt
