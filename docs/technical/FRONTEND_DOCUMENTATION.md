# Frontend Documentation - Restaurant Management System

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc](#kiến-trúc)
3. [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
4. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
5. [Cấu Hình](#cấu-hình)
6. [Tính Năng Chính](#tính-năng-chính)
7. [Quản Lý State](#quản-lý-state)
8. [Routing](#routing)
9. [API Integration](#api-integration)
10. [Internationalization (i18n)](#internationalization-i18n)
11. [Real-time Communication](#real-time-communication)
12. [UI Components](#ui-components)
13. [Authentication](#authentication)
14. [Styling](#styling)
15. [Development](#development)
16. [Build & Deployment](#build--deployment)

---

## 🎯 Tổng Quan

Frontend của Restaurant Management System là một ứng dụng web hiện đại được xây dựng với Next.js 16, React 19, và TypeScript. Ứng dụng cung cấp giao diện quản lý nhà hàng toàn diện với các tính năng real-time, đa ngôn ngữ, và responsive design.

### Đặc Điểm Nổi Bật
- ✅ **Server-Side Rendering (SSR)** với Next.js 16
- ✅ **Real-time Updates** với Socket.IO
- ✅ **Đa Ngôn Ngữ** (Tiếng Việt & Tiếng Anh)
- ✅ **Type-Safe** với TypeScript
- ✅ **Modern UI** với Radix UI & Tailwind CSS
- ✅ **State Management** với Zustand
- ✅ **Form Validation** với React Hook Form & Zod
- ✅ **Dark Mode** Support
- ✅ **Responsive Design**
- ✅ **Docker Support**

---

## 🏗️ Kiến Trúc

### Architecture Pattern
```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Pages (App Router)                       │   │
│  │  - Authentication Pages                          │   │
│  │  - Dashboard Pages                               │   │
│  │  - Menu Management                               │   │
│  └──────────────────────────────────────────────────┘   │
│                           │                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Components Layer                         │   │
│  │  - Features Components                           │   │
│  │  - Shared Components                             │   │
│  │  - UI Components (Radix UI)                      │   │
│  │  - Layout Components                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                     Business Logic Layer                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Hooks                                    │   │
│  │  - useAuth, useSidebarResponsive, etc.          │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         State Management (Zustand)               │   │
│  │  - Global State Stores                           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Contexts                                 │   │
│  │  - Socket Context, Theme Context, etc.          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                     Data Access Layer                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Services                                 │   │
│  │  - API Services (Axios)                          │   │
│  │  - Socket Services (Socket.IO)                   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         External APIs                            │   │
│  │  - Backend REST API                              │   │
│  │  - WebSocket Server                              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture
```
App Component
├── Providers
│   ├── Theme Provider
│   ├── i18n Provider
│   └── Socket Provider
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Main Content
└── Pages
    ├── Auth Pages
    │   ├── Login
    │   └── Register
    └── Dashboard Pages
        ├── Overview
        ├── Menu Management
        ├── Order Management
        ├── Inventory
        ├── Staff Management
        ├── Reservations
        └── Bills & Payments
```

---

## 🛠️ Công Nghệ Sử Dụng

### Core Technologies
| Công Nghệ | Version | Mục Đích |
|-----------|---------|----------|
| **Next.js** | 16.0.0 | React Framework với SSR/SSG |
| **React** | 19.2.0 | UI Library |
| **TypeScript** | ^5 | Type Safety |
| **Tailwind CSS** | ^4.1.16 | Utility-first CSS Framework |

### UI & Styling
| Thư Viện | Mục Đích |
|----------|----------|
| **Radix UI** | Headless UI Components (Accessible) |
| **Lucide React** | Icon Library |
| **Framer Motion** | Animation Library |
| **next-themes** | Dark Mode Support |
| **tailwind-merge** | Conditional Class Merging |
| **class-variance-authority** | Component Variants |

### State Management & Forms
| Thư Viện | Mục Đích |
|----------|----------|
| **Zustand** | Global State Management |
| **React Hook Form** | Form Management |
| **Zod** | Schema Validation |
| **@hookform/resolvers** | Form Validation Integration |

### Data Fetching & Real-time
| Thư Viện | Mục Đích |
|----------|----------|
| **Axios** | HTTP Client |
| **Socket.IO Client** | WebSocket Communication |

### Internationalization
| Thư Viện | Mục Đích |
|----------|----------|
| **i18next** | i18n Framework |
| **react-i18next** | React Integration |
| **i18next-browser-languagedetector** | Language Detection |

### Other Libraries
| Thư Viện | Mục Đích |
|----------|----------|
| **date-fns** | Date Manipulation |
| **recharts** | Data Visualization |
| **sonner** | Toast Notifications |
| **react-dropzone** | File Upload |
| **react-easy-crop** | Image Cropping |

---

## 📁 Cấu Trúc Thư Mục

```
client/
├── public/                    # Static Assets
│   ├── images/
│   │   ├── brand/            # Brand Images
│   │   ├── home/             # Home Page Images
│   │   ├── logo/             # Logo Variants
│   │   └── menu/             # Menu Item Images
│   └── videos/               # Video Assets
│
├── locales/                   # i18n Translation Files
│   ├── en.json               # English Translations
│   └── vi.json               # Vietnamese Translations
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Authentication Routes
│   │   │   ├── login/       # Login Page
│   │   │   └── register/    # Register Page
│   │   │
│   │   ├── (dashboard)/     # Protected Dashboard Routes
│   │   │   ├── dashboard/   # Dashboard Overview
│   │   │   ├── menu/        # Menu Management
│   │   │   ├── orders/      # Order Management
│   │   │   ├── inventory/   # Inventory Management
│   │   │   ├── staff/       # Staff Management
│   │   │   ├── reservations/# Reservation Management
│   │   │   └── bills/       # Bill & Payment Management
│   │   │
│   │   ├── globals.css      # Global Styles
│   │   ├── layout.tsx       # Root Layout
│   │   ├── page.tsx         # Home Page
│   │   ├── not-found.tsx    # 404 Page
│   │   └── providers.tsx    # Global Providers
│   │
│   ├── modules/            # 🎯 Feature Modules (NEW MODULAR ARCHITECTURE)
│   │   │
│   │   ├── menu/          # 🍽️ Menu Management Module
│   │   │   ├── components/   # Reusable menu components
│   │   │   ├── views/        # Page-level views (ListView, GridView)
│   │   │   ├── dialogs/      # Modal dialogs
│   │   │   │   ├── single/   # CRUD dialogs (Create, Edit, Delete)
│   │   │   │   └── bulk/     # Bulk operation dialogs
│   │   │   ├── services/     # Menu API service
│   │   │   ├── hooks/        # Custom menu hooks
│   │   │   ├── types/        # Menu TypeScript types
│   │   │   ├── utils/        # Menu utilities
│   │   │   ├── README.md     # Module documentation
│   │   │   └── index.ts      # Barrel exports
│   │   │
│   │   ├── categories/    # 📂 Categories Management Module
│   │   │   ├── components/   # Category components
│   │   │   ├── views/        # Category views
│   │   │   ├── dialogs/      # Category dialogs
│   │   │   │   ├── single/   # CRUD operations
│   │   │   │   └── bulk/     # Bulk operations
│   │   │   ├── services/     # Category API service
│   │   │   ├── hooks/        # Category hooks
│   │   │   ├── types/        # Category types
│   │   │   ├── utils/        # Category utilities
│   │   │   ├── README.md     # Module documentation
│   │   │   └── index.ts      # Barrel exports
│   │   │
│   │   ├── reservations/  # 📅 Reservations Management Module
│   │   │   ├── components/   # Reservation components
│   │   │   ├── views/        # Reservation views
│   │   │   ├── dialogs/      # Reservation dialogs
│   │   │   │   ├── single/   # CRUD operations
│   │   │   │   └── bulk/     # Bulk operations
│   │   │   ├── services/     # Reservation API service
│   │   │   ├── hooks/        # Reservation hooks
│   │   │   ├── types/        # Reservation types
│   │   │   ├── utils/        # Reservation utilities
│   │   │   ├── README.md     # Module documentation
│   │   │   └── index.ts      # Barrel exports
│   │   │
│   │   └── tables/        # 🪑 Tables & Visual Floor Plan Module
│   │       ├── components/   # Table components + Visual Editor
│   │       ├── views/        # TableListView, VisualFloorPlanView
│   │       ├── dialogs/      # Table operation dialogs
│   │       │   ├── single/   # CRUD operations
│   │       │   └── bulk/     # Bulk operations
│   │       ├── services/     # Table API service
│   │       ├── stores/       # Visual editor state (Zustand)
│   │       ├── hooks/        # Custom table hooks
│   │       ├── types/        # Table types
│   │       ├── utils/        # Geometry utilities
│   │       ├── README.md     # Module documentation
│   │       ├── TableDialogs.tsx # Dialog orchestrator
│   │       └── index.ts      # Barrel exports
│   │
│   ├── components/          # 🧩 Shared Components (Cross-Module)
│   │   ├── shared/         # Truly shared components
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── ImageUploadField.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── ui/             # 🎨 UI Components (Radix UI)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layouts/        # 📐 Layout Components
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── MobileSidebar.tsx
│   │   │   ├── NavigationItem.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── providers/      # 🔌 Provider Components
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── error-pages/    # ⚠️ Error Page Components
│   │   └── theme-toggle.tsx# 🌓 Theme Switcher
│   │
│   ├── hooks/              # 🪝 Global Custom Hooks
│   │   ├── useAuth.ts      # Authentication hook
│   │   ├── useSidebarResponsive.ts # Sidebar responsive hook
│   │   └── commons/        # Common utility hooks
│   │
│   ├── lib/                # 📚 Utility Libraries
│   │   ├── axios.ts        # Axios Configuration
│   │   ├── i18n.ts         # i18n Configuration
│   │   ├── socket.ts       # Socket.IO Configuration
│   │   └── utils.ts        # Utility Functions
│   │
│   ├── services/           # 🌐 Cross-Cutting Services
│   │   ├── auth.service.ts    # Authentication service (used across all modules)
│   │   └── upload.service.ts  # File upload service (shared utility)
│   │   # Note: Feature-specific services are now in modules/*/services/
│   │
│   ├── stores/             # 🗄️ Global Zustand Stores
│   │   ├── authStore.ts    # Authentication state
│   │   ├── uiStore.ts      # UI state (modals, sidebar, etc.)
│   │   └── ...             # Other global stores
│   │   # Note: Feature-specific stores moved to modules/*/stores/
│   │
│   ├── types/              # 📝 Global TypeScript Types
│   │   ├── index.ts        # Type exports
│   │   ├── auth.types.ts   # Auth types
│   │   ├── common.types.ts # Common types
│   │   └── ...             # Other global types
│   │   # Note: Feature-specific types moved to modules/*/types/
│   │
│   ├── utils/              # 🛠️ Global Utilities
│   │   └── ...             # Shared utility functions
│   │
│   └── proxy.ts            # 🔄 Proxy Configuration
│
├── components.json          # Shadcn/UI Configuration
├── next.config.ts          # Next.js Configuration
├── tailwind.config.ts      # Tailwind Configuration
├── tsconfig.json           # TypeScript Configuration
├── postcss.config.mjs      # PostCSS Configuration
├── package.json            # Dependencies
└── pnpm-lock.yaml         # Lock File
```

### 📦 Module Structure Convention

**Kiến Trúc Module Mới** - Dự án đã được tái cấu trúc theo mô hình **Feature-Based Modular Architecture**, nơi mỗi feature là một module độc lập, tự quản lý.

#### Cấu Trúc Chuẩn Của Mỗi Module

```
src/modules/[feature]/
├── components/              # 🧩 Reusable UI components
│   ├── index.ts            # Barrel exports
│   ├── [Feature]Card.tsx   # Card displays
│   ├── [Feature]List.tsx   # List displays
│   ├── [Feature]Filters.tsx # Filter controls
│   └── [Feature]Search.tsx  # Search components
│
├── views/                   # 📄 Page-level views (Smart Components)
│   ├── index.ts            # Barrel exports
│   ├── [Feature]ListView.tsx    # List/Table view
│   ├── [Feature]GridView.tsx    # Grid/Card view
│   └── [Feature]DetailView.tsx  # Detail view
│
├── dialogs/                 # 💬 Modal dialogs
│   ├── index.ts            # Barrel exports
│   ├── single/             # Single item operations
│   │   ├── index.ts
│   │   ├── Create[Feature]Dialog.tsx  # Create dialog
│   │   ├── Edit[Feature]Dialog.tsx    # Edit dialog
│   │   └── Delete[Feature]Dialog.tsx  # Delete confirmation
│   └── bulk/               # Bulk operations
│       ├── index.ts
│       ├── BulkDelete[Feature]Dialog.tsx
│       ├── BulkUpdate[Feature]Dialog.tsx
│       └── BulkImport[Feature]Dialog.tsx
│
├── services/               # 🌐 API service layer
│   ├── index.ts
│   └── [feature].service.ts   # All API calls for this feature
│
├── hooks/                  # 🪝 Custom React hooks
│   ├── index.ts
│   ├── use[Feature]s.ts       # List/collection operations
│   ├── use[Feature].ts        # Single item operations
│   └── use[Feature]Form.ts    # Form management hooks
│
├── types/                  # 📝 TypeScript types & interfaces
│   └── index.ts               # All types for this feature
│
├── utils/                  # 🛠️ Helper functions
│   └── index.ts               # Utility functions specific to feature
│
├── stores/                 # 🗄️ Feature-specific Zustand stores (optional)
│   └── [feature]Store.ts      # Only for complex state management
│
├── README.md              # 📚 Module documentation
└── index.ts               # 🎯 Module barrel export (main entry point)
```

#### Import Patterns

```typescript
// ✅ RECOMMENDED: Module-level imports (clean & maintainable)
import { MenuItemCard, MenuItemList, MenuItemFilters } from '@/modules/menu';
import { CreateMenuItemDialog, EditMenuItemDialog } from '@/modules/menu';
import { menuApi } from '@/modules/menu';
import { useMenuItems, useMenuItem } from '@/modules/menu';
import type { MenuItem, MenuItemFormData } from '@/modules/menu';

// ✅ ACCEPTABLE: Specific imports when barrel export is too heavy
import { MenuItemCard } from '@/modules/menu/components/MenuItemCard';
import { menuApi } from '@/modules/menu/services';

// ❌ AVOID: Deep nested imports
import { MenuItemCard } from '@/modules/menu/components/cards/MenuItemCard';
```

#### Nguyên Tắc Module

1. **Single Responsibility** - Mỗi module chỉ quản lý một feature duy nhất
2. **Self-Contained** - Module có đầy đủ components, logic, và types riêng
3. **Loose Coupling** - Module độc lập, ít phụ thuộc vào module khác
4. **High Cohesion** - Tất cả code liên quan đến feature ở cùng một nơi
5. **Consistent Structure** - Tất cả modules tuân theo cấu trúc giống nhau

#### Benefits của Kiến Trúc Module Mới

- ✅ **Code Organization** - Dễ tìm và quản lý code theo feature
- ✅ **Scalability** - Dễ thêm features mới mà không ảnh hưởng code cũ
- ✅ **Maintainability** - Sửa lỗi/cập nhật feature chỉ cần vào 1 folder
- ✅ **Team Collaboration** - Nhiều người làm nhiều features không conflict
- ✅ **Code Reusability** - Components trong module có thể reuse dễ dàng
- ✅ **Testing** - Dễ viết unit test và integration test cho từng module
- ✅ **Bundle Optimization** - Tree-shaking hiệu quả hơn với barrel exports

#### Các Modules Hiện Có

| Module | Mô Tả | Độ Phức Tạp | Status |
|--------|-------|-------------|--------|
| **menu/** | Quản lý thực đơn món ăn | Medium | ✅ Complete |
| **categories/** | Quản lý danh mục món ăn | Low | ✅ Complete |
| **reservations/** | Quản lý đặt bàn | Medium | ✅ Complete |
| **tables/** | Quản lý bàn + Visual Editor | High | ✅ Complete |

#### Reference Implementations

1. **menu/** - Module hoàn chỉnh với đầy đủ CRUD, dialogs, filters, search
2. **categories/** - Module đơn giản, cấu trúc rõ ràng, dễ hiểu
3. **reservations/** - Good example của hooks và service patterns
4. **tables/** - Module phức tạp với visual editor, stores, geometry utils

#### Migration Plan (Planned Modules)

Các features sau sẽ được migrate sang module structure:
- `orders/` - Order Management
- `inventory/` - Inventory Management
- `staff/` - Staff Management
- `bills/` - Bill & Payment Management
- `kitchen/` - Kitchen Management
- `customers/` - Customer Management

---

## ⚙️ Cấu Hình

### 1. Next.js Configuration (`next.config.ts`)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Standalone output for production (Linux/Docker)
    output: (process.env.NODE_ENV === 'production' && process.platform !== 'win32') 
        ? 'standalone' 
        : undefined,

    // Image optimization
    images: {
        unoptimized: process.env.NODE_ENV === 'production',
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3001',
                pathname: '/uploads/**',
            },
        ],
    },

    // Enable experimental features
    experimental: {
        // Add experimental features here
    },
};

export default nextConfig;
```

### 2. Environment Variables

Tạo file `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME=Restaurant Management
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_LOGGING=true
```

### 3. Tailwind Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                // ... more colors
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 4. TypeScript Configuration (`tsconfig.json`)

```json
{
    "compilerOptions": {
        "target": "ES2017",
        "lib": ["dom", "dom.iterable", "esnext"],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "noEmit": true,
        "esModuleInterop": true,
        "module": "esnext",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "plugins": [
            {
                "name": "next"
            }
        ],
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
}
```

---

## 🎯 Tính Năng Chính

### 1. **Authentication Management**
- Đăng nhập/Đăng xuất
- Đăng ký tài khoản
- Quên mật khẩu
- JWT Token Management
- Role-based Access Control (RBAC)
- Session Management

### 2. **Menu Management**
- Quản lý danh mục món ăn
- Thêm/Sửa/Xóa món ăn
- Upload hình ảnh món ăn
- Quản lý giá và mô tả
- Trạng thái món ăn (available/unavailable)
- Tìm kiếm và lọc món ăn

### 3. **Order Management**
- Tạo đơn hàng mới
- Theo dõi trạng thái đơn hàng
- Real-time order updates
- In hóa đơn
- Lịch sử đơn hàng
- Kitchen display system

### 4. **Inventory Management**
- Quản lý nguyên liệu
- Theo dõi tồn kho
- Cảnh báo hết hàng
- Nhập/Xuất kho
- Báo cáo tồn kho

### 5. **Staff Management**
- Quản lý nhân viên
- Phân quyền
- Lịch làm việc
- Chấm công
- Hiệu suất làm việc

### 6. **Reservation Management**
- Đặt bàn online
- Quản lý đặt chỗ
- Xác nhận/Hủy đặt bàn
- Lịch đặt bàn
- Thông báo nhắc nhở

### 7. **Bill & Payment Management**
- Tạo hóa đơn
- Thanh toán
- In hóa đơn
- Lịch sử thanh toán
- Báo cáo doanh thu

### 8. **Dashboard & Analytics**
- Thống kê doanh thu
- Biểu đồ phân tích
- Top món ăn bán chạy
- Báo cáo tổng quan
- Export dữ liệu

---

## 🗂️ Quản Lý State

### Zustand Store Pattern

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    
    // Actions
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            
            login: (user, token) => 
                set({ user, token, isAuthenticated: true }),
            
            logout: () => 
                set({ user: null, token: null, isAuthenticated: false }),
            
            updateUser: (userData) => 
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null
                })),
        }),
        {
            name: 'auth-storage',
        }
    )
);
```

### Common Stores

1. **authStore** - Authentication state
2. **menuStore** - Menu items and categories
3. **orderStore** - Active orders and order history
4. **inventoryStore** - Inventory items and stock levels
5. **staffStore** - Staff data and schedules
6. **reservationStore** - Reservations and bookings
7. **billStore** - Bills and payment information
8. **uiStore** - UI state (sidebar, modals, etc.)

---

## 🛣️ Routing

### App Router Structure

Next.js 16 sử dụng **App Router** với file-based routing:

```
app/
├── (auth)/                 # Auth Group (No Layout)
│   ├── login/
│   │   └── page.tsx       # /login
│   └── register/
│       └── page.tsx       # /register
│
├── (dashboard)/           # Dashboard Group (With Layout)
│   ├── layout.tsx        # Dashboard Layout
│   │
│   ├── dashboard/
│   │   └── page.tsx      # /dashboard
│   │
│   ├── menu/
│   │   ├── page.tsx      # /menu
│   │   ├── [id]/
│   │   │   └── page.tsx  # /menu/[id]
│   │   └── new/
│   │       └── page.tsx  # /menu/new
│   │
│   ├── orders/
│   │   ├── page.tsx      # /orders
│   │   └── [id]/
│   │       └── page.tsx  # /orders/[id]
│   │
│   ├── inventory/
│   │   └── page.tsx      # /inventory
│   │
│   ├── staff/
│   │   └── page.tsx      # /staff
│   │
│   ├── reservations/
│   │   └── page.tsx      # /reservations
│   │
│   └── bills/
│       └── page.tsx      # /bills
│
├── layout.tsx            # Root Layout
├── page.tsx              # Home Page (/)
└── not-found.tsx         # 404 Page
```

### Route Groups

#### 1. **(auth)** - Authentication Group
- Không có dashboard layout
- Public routes
- Redirect nếu đã đăng nhập

#### 2. **(dashboard)** - Protected Routes
- Có dashboard layout (sidebar, header)
- Require authentication
- Role-based access control

### Navigation Examples

```typescript
// Using Next.js Link
import Link from 'next/link';

<Link href="/menu">Menu</Link>
<Link href="/orders/123">Order Details</Link>

// Using useRouter
import { useRouter } from 'next/navigation';

const router = useRouter();

router.push('/dashboard');
router.replace('/login');
router.back();
```

---

## 🌐 API Integration

### Axios Configuration (`lib/axios.ts`)

```typescript
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create Axios instance
export const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);
```

### Service Pattern (Module-Based)

Services giờ được tổ chức trong từng module thay vì folder `services/` tập trung.

```typescript
// modules/menu/services/menu.service.ts
import { axiosInstance } from '@/lib/axios';
import type { MenuItem, CreateMenuItemDTO, UpdateMenuItemDTO } from '../types';

export class MenuService {
    private static BASE_URL = '/menu';

    // Get all menu items with filters
    static async getMenuItems(params?: {
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const response = await axiosInstance.get<MenuItem[]>(
            this.BASE_URL,
            { params }
        );
        return response.data;
    }

    // Get menu item by ID
    static async getMenuItem(id: string) {
        const response = await axiosInstance.get<MenuItem>(
            `${this.BASE_URL}/${id}`
        );
        return response.data;
    }

    // Create menu item
    static async createMenuItem(data: CreateMenuItemDTO) {
        const response = await axiosInstance.post<MenuItem>(
            this.BASE_URL,
            data
        );
        return response.data;
    }

    // Update menu item
    static async updateMenuItem(id: string, data: UpdateMenuItemDTO) {
        const response = await axiosInstance.patch<MenuItem>(
            `${this.BASE_URL}/${id}`,
            data
        );
        return response.data;
    }

    // Delete menu item
    static async deleteMenuItem(id: string) {
        const response = await axiosInstance.delete(
            `${this.BASE_URL}/${id}`
        );
        return response.data;
    }

    // Bulk delete menu items
    static async bulkDeleteMenuItems(ids: string[]) {
        const response = await axiosInstance.post(
            `${this.BASE_URL}/bulk-delete`,
            { ids }
        );
        return response.data;
    }

    // Upload menu item image
    static async uploadImage(id: string, file: File) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axiosInstance.post(
            `${this.BASE_URL}/${id}/image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }
}

// Export as default and named export
export const menuApi = MenuService;
export default MenuService;
```

#### Cross-Cutting Services

Chỉ các services **dùng chung** giữa nhiều modules mới ở `src/services/`:

```typescript
// services/auth.service.ts - Used across all modules
export class AuthService {
    static async login(email: string, password: string) { ... }
    static async logout() { ... }
    static async refreshToken() { ... }
}

// services/upload.service.ts - Shared file upload utility
export class UploadService {
    static async uploadFile(file: File, path: string) { ... }
    static async deleteFile(url: string) { ... }
}
```

---

## 🌍 Internationalization (i18n)

### Configuration (`lib/i18n.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '../../locales/en.json';
import viTranslations from '../../locales/vi.json';

const resources = {
    en: {
        translation: enTranslations,
    },
    vi: {
        translation: viTranslations,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'vi',
        lng: 'vi',
        
        interpolation: {
            escapeValue: false,
        },
        
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
```

### Translation Files

#### `locales/vi.json`
```json
{
    "common": {
        "welcome": "Chào mừng",
        "login": "Đăng nhập",
        "logout": "Đăng xuất",
        "save": "Lưu",
        "cancel": "Hủy",
        "delete": "Xóa",
        "edit": "Sửa",
        "search": "Tìm kiếm"
    },
    "menu": {
        "title": "Thực đơn",
        "add_item": "Thêm món",
        "edit_item": "Sửa món",
        "delete_confirm": "Bạn có chắc muốn xóa món này?"
    }
}
```

#### `locales/en.json`
```json
{
    "common": {
        "welcome": "Welcome",
        "login": "Login",
        "logout": "Logout",
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "edit": "Edit",
        "search": "Search"
    },
    "menu": {
        "title": "Menu",
        "add_item": "Add Item",
        "edit_item": "Edit Item",
        "delete_confirm": "Are you sure you want to delete this item?"
    }
}
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function MenuPage() {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div>
            <h1>{t('menu.title')}</h1>
            <button onClick={() => changeLanguage('en')}>English</button>
            <button onClick={() => changeLanguage('vi')}>Tiếng Việt</button>
        </div>
    );
}
```

---

## 🔄 Real-time Communication

### Socket.IO Configuration (`lib/socket.ts`)

```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    // Connect to socket server
    connect(token?: string) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token || localStorage.getItem('accessToken'),
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.setupListeners();
        return this.socket;
    }

    // Disconnect from socket server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    // Setup default listeners
    private setupListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('error', (error: Error) => {
            console.error('Socket error:', error);
        });
    }

    // Subscribe to event
    on<T>(event: string, callback: (data: T) => void) {
        if (!this.socket) return;

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)?.add(callback);
        this.socket.on(event, callback);
    }

    // Unsubscribe from event
    off(event: string, callback?: Function) {
        if (!this.socket) return;

        if (callback) {
            this.listeners.get(event)?.delete(callback);
            this.socket.off(event, callback as any);
        } else {
            this.listeners.delete(event);
            this.socket.off(event);
        }
    }

    // Emit event
    emit<T>(event: string, data?: T) {
        if (!this.socket) return;
        this.socket.emit(event, data);
    }

    // Get socket instance
    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
```

### Socket Context (`contexts/SocketContext.tsx`)

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

interface SocketContextType {
    isConnected: boolean;
    socket: typeof socketService | null;
}

const SocketContext = createContext<SocketContextType>({
    isConnected: false,
    socket: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const { token, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && token) {
            socketService.connect(token);

            socketService.on('connect', () => {
                setIsConnected(true);
            });

            socketService.on('disconnect', () => {
                setIsConnected(false);
            });
        }

        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated, token]);

    return (
        <SocketContext.Provider value={{ isConnected, socket: socketService }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
```

### Real-time Events

#### Order Events
```typescript
// Listen for new orders
socketService.on<Order>('order:created', (order) => {
    console.log('New order:', order);
    // Update order list
});

// Listen for order status updates
socketService.on<Order>('order:updated', (order) => {
    console.log('Order updated:', order);
    // Update order status
});

// Emit order status change
socketService.emit('order:update-status', {
    orderId: '123',
    status: 'preparing'
});
```

#### Kitchen Events
```typescript
// Listen for kitchen orders
socketService.on<KitchenOrder>('kitchen:new-order', (order) => {
    console.log('New kitchen order:', order);
});

// Emit order ready
socketService.emit('kitchen:order-ready', {
    orderId: '123'
});
```

#### Table Events
```typescript
// Listen for table status updates
socketService.on<Table>('table:updated', (table) => {
    console.log('Table updated:', table);
});

// Request table
socketService.emit('table:request', {
    tableId: '5',
    numberOfGuests: 4
});
```

---

## 🎨 UI Components

### Component Library: Radix UI + shadcn/ui

Dự án sử dụng **Radix UI** headless components kết hợp với **shadcn/ui** styling patterns.

### Core UI Components

#### 1. Button Component
```typescript
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

#### 2. Dialog Component
```typescript
// Usage
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
    <DialogTrigger asChild>
        <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
                This action cannot be undone.
            </DialogDescription>
        </DialogHeader>
        {/* Content */}
    </DialogContent>
</Dialog>
```

#### 3. Form Components
```typescript
// Using React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    price: z.number().positive('Price must be positive'),
});

type FormData = z.infer<typeof formSchema>;

function MenuItemForm() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            price: 0,
        },
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Item name" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the menu item name
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* More fields */}
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
```

### Available UI Components

| Component | Description |
|-----------|-------------|
| `Alert` | Display important messages |
| `Avatar` | User profile images |
| `Button` | Interactive buttons |
| `Card` | Container for content |
| `Checkbox` | Checkbox input |
| `Dialog` | Modal dialogs |
| `Dropdown Menu` | Context menus |
| `Form` | Form components |
| `Input` | Text inputs |
| `Label` | Form labels |
| `Popover` | Floating content |
| `Progress` | Progress bars |
| `Radio Group` | Radio buttons |
| `Select` | Dropdown selects |
| `Separator` | Divider lines |
| `Slider` | Range sliders |
| `Switch` | Toggle switches |
| `Table` | Data tables |
| `Tabs` | Tabbed interfaces |
| `Tooltip` | Hover tooltips |

---

## 🔐 Authentication

### Auth Hook (`hooks/useAuth.ts`)

```typescript
import { useAuthStore } from '@/stores/authStore';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const router = useRouter();
    const { user, token, isAuthenticated, login, logout } = useAuthStore();

    const handleLogin = async (email: string, password: string) => {
        try {
            const { user, token } = await AuthService.login(email, password);
            login(user, token);
            router.push('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const checkAuth = () => {
        if (!isAuthenticated) {
            router.push('/login');
            return false;
        }
        return true;
    };

    return {
        user,
        token,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        checkAuth,
    };
}
```

### Protected Route Pattern

```typescript
// app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            {/* Header */}
            <main>{children}</main>
        </div>
    );
}
```

### Role-based Access Control

```typescript
// hooks/usePermission.ts
import { useAuth } from './useAuth';

type Role = 'admin' | 'manager' | 'staff' | 'chef';
type Permission = 'menu:create' | 'menu:update' | 'menu:delete' | 'order:create' | ...;

const rolePermissions: Record<Role, Permission[]> = {
    admin: ['menu:create', 'menu:update', 'menu:delete', ...],
    manager: ['menu:create', 'menu:update', 'order:create', ...],
    staff: ['order:create', ...],
    chef: ['kitchen:view', ...],
};

export function usePermission() {
    const { user } = useAuth();

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;
        const userPermissions = rolePermissions[user.role as Role] || [];
        return userPermissions.includes(permission);
    };

    const hasRole = (role: Role): boolean => {
        if (!user) return false;
        return user.role === role;
    };

    return { hasPermission, hasRole };
}
```

---

## 🎨 Styling

### Tailwind CSS

Dự án sử dụng **Tailwind CSS v4** với configuration tùy chỉnh.

#### Custom Classes
```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
        --background: 0 0% 100%;
        --foreground: 222.2 84% 4.9%;
        --primary: 222.2 47.4% 11.2%;
        --primary-foreground: 210 40% 98%;
        /* ... more CSS variables */
    }

    .dark {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;
        --primary: 210 40% 98%;
        --primary-foreground: 222.2 47.4% 11.2%;
        /* ... dark mode variables */
    }
}

@layer components {
    .btn-primary {
        @apply bg-primary text-primary-foreground hover:bg-primary/90;
    }

    .card {
        @apply rounded-lg border bg-card text-card-foreground shadow-sm;
    }
}

@layer utilities {
    .text-balance {
        text-wrap: balance;
    }
}
```

### Dark Mode

```typescript
// components/theme-toggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
```

### Responsive Design

```typescript
// Tailwind responsive classes
<div className="
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    md:grid-cols-3 
    lg:grid-cols-4 
    xl:grid-cols-6 
    gap-4
">
    {/* Content */}
</div>

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

---

## 🔧 Development

### Prerequisites
- **Node.js** >= 18.x
- **pnpm** >= 8.x (recommended) hoặc npm/yarn

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your settings
```

### Development Server

```bash
# Start development server
pnpm dev

# Server will run at http://localhost:3000
```

### Available Scripts

```json
{
    "scripts": {
        "dev": "next dev",              // Start dev server
        "build": "next build",          // Build for production
        "start": "next start",          // Start production server
        "lint": "next lint",            // Run ESLint
        "lint:fix": "next lint --fix",  // Fix linting errors
        "type-check": "tsc --noEmit",   // Type checking
        "format": "prettier --write .", // Format code
    }
}
```

### Code Quality

#### ESLint
```bash
# Run linter
pnpm lint

# Fix linting errors
pnpm lint:fix
```

#### TypeScript
```bash
# Type checking
pnpm type-check
```

#### Prettier (if configured)
```bash
# Format code
pnpm format
```

### Debugging

#### VS Code Configuration
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Next.js: debug server-side",
            "type": "node-terminal",
            "request": "launch",
            "command": "pnpm dev"
        },
        {
            "name": "Next.js: debug client-side",
            "type": "chrome",
            "request": "launch",
            "url": "http://localhost:3000"
        }
    ]
}
```

---

## 🚀 Build & Deployment

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Docker Deployment

#### Development
```bash
# Build development image
docker build -f Dockerfile.dev -t restaurant-client:dev .

# Run development container
docker run -p 3000:3000 restaurant-client:dev
```

#### Production
```bash
# Build production image
docker build -f Dockerfile -t restaurant-client:prod .

# Run production container
docker run -p 3000:3000 restaurant-client:prod
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://server:3001/api
      - NEXT_PUBLIC_SOCKET_URL=http://server:3001
    depends_on:
      - server
    networks:
      - restaurant-network

networks:
  restaurant-network:
    driver: bridge
```

### Environment Variables for Production

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Optimization

#### 1. Image Optimization
```typescript
import Image from 'next/image';

<Image
    src="/images/menu/pizza.jpg"
    alt="Pizza"
    width={400}
    height={300}
    priority // For above-the-fold images
    placeholder="blur"
/>
```

#### 2. Code Splitting
```typescript
// Dynamic imports
import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import('@/components/Chart'), {
    loading: () => <p>Loading chart...</p>,
    ssr: false, // Disable SSR for this component
});
```

#### 3. Font Optimization
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={inter.className}>
            <body>{children}</body>
        </html>
    );
}
```

---

## 📚 Best Practices

### 1. Component Organization
- Sử dụng functional components
- Tách logic phức tạp ra custom hooks
- Keep components small and focused
- Use TypeScript interfaces for props

### 2. State Management
- Sử dụng Zustand cho global state
- Local state cho UI state
- Avoid prop drilling

### 3. Performance
- Use React.memo for expensive renders
- Implement pagination for large lists
- Lazy load images and components
- Optimize bundle size

### 4. Security
- Validate all user inputs
- Sanitize data before display
- Use HTTPS in production
- Implement CSRF protection
- Don't expose sensitive data in client

### 5. Testing (Future)
- Unit tests for utilities
- Component tests with React Testing Library
- E2E tests with Playwright
- API integration tests

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Port already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

#### 2. **Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 3. **Build errors**
```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

#### 4. **TypeScript errors**
```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

---

## 📞 Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)

### Community
- GitHub Issues
- Discord Server
- Stack Overflow

---

## 📝 Changelog

### Version 1.0.0 (Current - November 21, 2025)
- ✨ **Major Architecture Refactoring** - Feature-Based Modular Architecture
- 📦 Migrated to module structure: `menu/`, `categories/`, `reservations/`, `tables/`
- 🎯 Implemented standardized module pattern across all features
- 🗄️ Moved feature-specific services to module-level
- 📝 Moved feature-specific types to module-level
- 🧩 Created consistent dialogs structure (single/bulk operations)
- 🪝 Organized hooks at module level
- 🎨 Separated shared components from feature components
- 📚 Added comprehensive module documentation
- ✅ Better code organization and maintainability

### Version 0.1.0 (Initial Release)
- Initial release
- Next.js 16 setup
- React 19 integration
- Basic authentication
- Menu management
- Real-time updates
- Internationalization
- Tailwind CSS 4 + Radix UI

---

**Tài liệu được tạo bởi:** Restaurant Management Development Team  
**Ngày cập nhật:** November 21, 2025  
**Version:** 1.0.0
