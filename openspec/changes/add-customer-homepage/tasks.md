## 1. Setup & Configuration

- [x] **1.1** Tạo cấu trúc module `src/modules/home/`
  - Tạo folders: `components/`, `services/`, `hooks/`, `types/`, `config/`
  - Tạo barrel export `index.ts`

- [x] **1.2** Tạo restaurant config file
  - File: `src/modules/home/config/restaurant.config.ts`
  - Định nghĩa: tên nhà hàng, slogan, địa chỉ, SĐT, email, giờ mở cửa, social links
  - Export typed config object

- [x] **1.3** Thêm i18n translations cho homepage
  - File: `locales/en.json` - thêm namespace `home`
  - File: `locales/vi.json` - thêm namespace `home`
  - Keys: hero, about, menu, reservation, contact, footer sections

## 2. Core Components

- [x] **2.1** Tạo Header/Navigation component
  - File: `src/modules/home/components/Header.tsx`
  - Logo, section links (Home, Menu, Reservation, Contact)
  - Language switcher, Theme toggle
  - Sticky behavior khi scroll
  - Mobile hamburger menu với overlay

- [x] **2.2** Tạo Hero Section component
  - File: `src/modules/home/components/HeroSection.tsx`
  - Background image/gradient
  - Restaurant name, tagline
  - CTA buttons: "Đặt Bàn", "Xem Menu"
  - Framer Motion entrance animation

- [x] **2.3** Tạo About Section component
  - File: `src/modules/home/components/AboutSection.tsx`
  - Restaurant description text
  - Image(s) với lazy loading
  - Scroll animation với Framer Motion

- [x] **2.4** Tạo Menu Section component
  - File: `src/modules/home/components/MenuSection.tsx`
  - Fetch featured items từ API
  - Grid layout với MenuItemCard
  - Loading skeleton, error state, empty state
  - "Xem toàn bộ menu" CTA

- [x] **2.5** Tạo MenuItemCard component
  - File: `src/modules/home/components/MenuItemCard.tsx`
  - Image, name, price (VND format), description
  - Hover animation
  - Vegetarian/Spicy indicators

- [x] **2.6** Tạo Reservation Section component
  - File: `src/modules/home/components/ReservationSection.tsx`
  - Form với React Hook Form + Zod validation
  - Fields: name, phone, date, time, partySize, notes
  - Submit handler gọi API
  - Success/Error states

- [x] **2.7** Tạo Contact Section component
  - File: `src/modules/home/components/ContactSection.tsx`
  - Address, phone (tel: link), email (mailto: link)
  - Operating hours display
  - Map placeholder (static image hoặc iframe)

- [x] **2.8** Tạo Footer component
  - File: `src/modules/home/components/Footer.tsx`
  - Copyright với dynamic year
  - Quick links, social media icons
  - Back to top button

## 3. Services & Hooks

- [x] **3.1** Tạo home service
  - File: `src/modules/home/services/home.service.ts`
  - `getFeaturedMenuItems()` - fetch menu items với limit
  - `createReservation()` - POST reservation

- [x] **3.2** Tạo useReservation hook
  - File: `src/modules/home/hooks/useReservation.ts`
  - Form state management
  - Submit mutation với loading/error states
  - Success callback

- [x] **3.3** Tạo useScrollSpy hook (optional)
  - File: `src/modules/home/hooks/useScrollSpy.ts`
  - Track active section for navigation highlight

## 4. Page Integration

- [x] **4.1** Update trang chủ `app/page.tsx`
  - Import và compose tất cả sections
  - SEO metadata (title, description, Open Graph)
  - Smooth scroll CSS

- [x] **4.2** Tạo homepage layout (nếu cần)
  - Không dùng admin layout
  - Có thể wrap với providers cần thiết

## 5. Styling & Polish

- [x] **5.1** Responsive styles
  - Mobile-first breakpoints
  - Touch-friendly buttons và form inputs
  - Navigation collapse

- [x] **5.2** Animation polish
  - Entrance animations cho sections
  - Scroll-triggered reveals
  - Respect `prefers-reduced-motion`

- [x] **5.3** Dark mode styling
  - Verify all components work với dark theme
  - Adjust colors nếu cần

## 6. Testing & Validation

- [x] **6.1** Manual testing checklist
  - [x] Desktop Chrome, Firefox, Edge
  - [x] Mobile responsive (DevTools)
  - [x] Dark/Light mode toggle
  - [x] EN/VI language switch
  - [x] Form validation errors
  - [x] Successful reservation submission
  - [x] Menu items load from API
  - [x] All navigation links work

- [x] **6.2** Performance check
  - [x] Build thành công với Next.js
  - [x] Images optimized với Next.js Image
  - [x] No TypeScript errors

## Dependencies

```
2.1 → 2.2, 2.3, 2.4, 2.6, 2.7, 2.8 (Header needed for layout)
1.2 → 2.2, 2.7 (Config needed for content)
1.3 → All 2.x (Translations needed for text)
3.1 → 2.4, 2.6 (Services needed for API calls)
3.2 → 2.6 (Hook needed for reservation form)
All 2.x → 4.1 (Components needed for page)
4.1 → 5.x, 6.x (Page ready for polish and testing)
```

## Parallelizable Work

- 1.1, 1.2, 1.3 có thể làm song song
- 2.2, 2.3, 2.7, 2.8 có thể làm song song (sau khi có 2.1)
- 2.4, 2.5, 2.6 cần services nên làm sau 3.1, 3.2
- 5.1, 5.2, 5.3 có thể làm song song

## Estimated Effort

| Task Group | Estimate |
|------------|----------|
| Setup (1.x) | 1-2 hours |
| Components (2.x) | 4-6 hours |
| Services/Hooks (3.x) | 1-2 hours |
| Integration (4.x) | 1 hour |
| Polish (5.x) | 2-3 hours |
| Testing (6.x) | 1-2 hours |
| **Total** | **10-16 hours** |
