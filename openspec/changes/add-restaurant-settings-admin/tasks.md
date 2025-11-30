# Tasks: Admin Quản Lý Thông Tin Nhà Hàng

## 1. Database Setup

- [x] **1.1** Thêm model `RestaurantSettings` vào `schema.prisma`
  - Fields: name, tagline, description, aboutTitle, aboutContent
  - Fields: address, phone, email, mapEmbedUrl
  - Fields: heroImage, aboutImage, logoUrl
  - JSON fields: operatingHours, socialLinks, highlights
  - Timestamps: updatedAt

- [x] **1.2** Tạo và chạy Prisma migration
  - `npx prisma migrate dev --name add_restaurant_settings`

- [x] **1.3** Tạo seed script cho default settings
  - File: `prisma/seeds/restaurant-settings.seed.ts`
  - Lấy data từ existing `restaurant.config.ts`
  - Thêm vào main seed file

## 2. Backend API

- [x] **2.1** Tạo module structure
  - `src/modules/restaurant-settings/`
  - Files: controller, service, repository, routes, dto

- [x] **2.2** Implement repository
  - `getSettings()` - Lấy settings (single row)
  - `upsertSettings(data)` - Create or update settings

- [x] **2.3** Implement service
  - `getSettings()` - Business logic
  - `updateSettings(dto)` - Validate và update

- [x] **2.4** Implement DTOs và validation
  - `UpdateRestaurantSettingsDto` với Zod schema
  - Validate JSON array fields

- [x] **2.5** Implement controller
  - `GET /api/restaurant-settings` - Public
  - `PUT /api/restaurant-settings` - Admin only với auth guard

- [x] **2.6** Register routes
  - Thêm vào main router
  - Swagger documentation

## 3. Admin Frontend Module

- [x] **3.1** Tạo module structure
  - `src/modules/admin/settings/`
  - Folders: components, views, services, hooks, types, utils

- [x] **3.2** Định nghĩa types
  - `RestaurantSettings` interface
  - `UpdateSettingsDto` type
  - Form field types

- [x] **3.3** Implement service
  - `getSettings()` - GET request
  - `updateSettings(data)` - PUT request

- [x] **3.4** Implement hooks
  - `useSettings()` - Fetch settings với SWR/React Query pattern
  - `useUpdateSettings()` - Mutation hook

- [x] **3.5** Implement validation schemas
  - Zod schemas cho từng form section
  - URL validation cho images
  - Phone/email validation

## 4. Admin UI Components

- [x] **4.1** Implement GeneralSettingsForm
  - Tên nhà hàng, tagline
  - Description (textarea)
  - About section (title + content)
  - Highlights array (dynamic fields)

- [x] **4.2** Implement ContactSettingsForm
  - Địa chỉ, SĐT, email inputs
  - Map embed URL với preview
  - Validation messages

- [x] **4.3** Implement OperatingHoursForm
  - Dynamic field array (day + hours)
  - Add/remove rows
  - Time format validation

- [x] **4.4** Implement SocialLinksForm
  - Dynamic field array (platform, url, icon)
  - Platform dropdown
  - URL validation

- [x] **4.5** Implement ImagesSettingsForm
  - Hero image URL input + preview
  - About image URL input + preview
  - Logo URL input + preview

- [x] **4.6** Implement SettingsView
  - Tabs navigation
  - Load settings on mount
  - Save all changes button
  - Loading và error states
  - Success toast notification

## 5. Admin Integration

- [x] **5.1** Tạo admin page route
  - File: `src/app/admin/settings/page.tsx`
  - Import SettingsView

- [x] **5.2** Cập nhật Sidebar
  - Thêm menu item "Cài đặt" / "Settings"
  - Icon: Settings/Cog icon
  - Route: `/admin/settings`

- [x] **5.3** Thêm i18n translations
  - `locales/en.json` - settings namespace
  - `locales/vi.json` - settings namespace
  - Keys: form labels, buttons, validation messages

## 6. Homepage Integration

- [x] **6.1** Tạo settings hook cho homepage
  - `src/modules/home/hooks/useRestaurantSettings.ts`
  - Fetch từ public API endpoint
  - Fallback to config nếu API fail

- [x] **6.2** Update home components
  - Header: sử dụng settings.name
  - HeroSection: settings.tagline, settings.heroImage
  - AboutSection: settings.aboutTitle, settings.aboutContent, settings.highlights
  - ContactSection: settings.address, settings.phone, settings.email
  - Footer: settings.name, settings.socialLinks

- [x] **6.3** Update page.tsx
  - Fetch settings server-side hoặc client-side
  - Pass to components

## 7. Testing & Polish

- [x] **7.1** Manual testing
  - [x] Admin form loads existing data
  - [x] Save settings works
  - [x] Validation errors display
  - [x] Homepage reflects changes
  - [x] Fallback works when API unavailable

- [x] **7.2** Build verification
  - `pnpm build` client và server
  - No TypeScript errors
  - No runtime errors

