## 1. Foundation Setup

### 1.1 Vite + React Configuration
- [ ] 1.1.1 Update `vite.config.ts` with path aliases (`@/`) and optimizations
- [ ] 1.1.2 Configure TypeScript with strict mode and path mappings in `tsconfig.json`
- [ ] 1.1.3 Set up Tailwind CSS 4.x with CSS variables matching web client
- [ ] 1.1.4 Configure PostCSS with autoprefixer
- [ ] 1.1.5 Create `components.json` for shadcn/ui integration

### 1.2 Core Dependencies
- [ ] 1.2.1 Install React Router v7 for client-side routing
- [ ] 1.2.2 Install Zustand for state management
- [ ] 1.2.3 Install TanStack Query for server state
- [ ] 1.2.4 Install Axios for HTTP client
- [ ] 1.2.5 Install Socket.io-client for WebSocket
- [ ] 1.2.6 Install i18next and react-i18next for internationalization
- [ ] 1.2.7 Install React Hook Form + Zod for form handling
- [ ] 1.2.8 Install Framer Motion for animations
- [ ] 1.2.9 Install date-fns for date utilities
- [ ] 1.2.10 Install lucide-react for icons
- [ ] 1.2.11 Install Dexie for IndexedDB (offline support)

### 1.3 shadcn/ui Components
- [ ] 1.3.1 Initialize shadcn/ui with `npx shadcn@latest init`
- [ ] 1.3.2 Install core components: button, card, dialog, input, label
- [ ] 1.3.3 Install form components: form, select, checkbox, radio-group, switch
- [ ] 1.3.4 Install layout components: separator, tabs, scroll-area
- [ ] 1.3.5 Install feedback components: alert, badge, skeleton, sonner
- [ ] 1.3.6 Install overlay components: dropdown-menu, popover, tooltip, sheet
- [ ] 1.3.7 Install data components: table, avatar, progress

## 2. Directory Structure Setup

### 2.1 Create Core Directories
- [ ] 2.1.1 Create `src/app/` directory (providers, router, layouts)
- [ ] 2.1.2 Create `src/features/` directory for feature modules
- [ ] 2.1.3 Create `src/components/shared/` for shared components
- [ ] 2.1.4 Create `src/lib/` for core libraries (api, socket, tauri, offline)
- [ ] 2.1.5 Create `src/stores/` for global Zustand stores
- [ ] 2.1.6 Create `src/types/` for TypeScript type definitions
- [ ] 2.1.7 Create `src/hooks/` for global hooks
- [ ] 2.1.8 Create `src/styles/` for global styles

### 2.2 Set Up Feature Module Structure
- [ ] 2.2.1 Create `features/auth/` module structure (components, hooks, services, stores)
- [ ] 2.2.2 Create `features/pos/` module structure
- [ ] 2.2.3 Create `features/kitchen/` module structure
- [ ] 2.2.4 Create `features/tables/` module structure
- [ ] 2.2.5 Create `features/menu/` module structure
- [ ] 2.2.6 Create `features/orders/` module structure
- [ ] 2.2.7 Create `features/settings/` module structure

## 3. Core Infrastructure

### 3.1 API Client
- [ ] 3.1.1 Implement `src/lib/api/client.ts` with Axios instance
- [ ] 3.1.2 Implement request interceptor for auth token injection
- [ ] 3.1.3 Implement response interceptor for token refresh handling
- [ ] 3.1.4 Implement error handling with toast notifications
- [ ] 3.1.5 Create type-safe API response helpers

### 3.2 Type Definitions
- [ ] 3.2.1 Define `src/types/api.ts` (ApiResponse, PaginatedResponse, ApiError)
- [ ] 3.2.2 Define `src/types/auth.ts` (User, UserRole, LoginCredentials, AuthResponse)
- [ ] 3.2.3 Define `src/types/menu.ts` (MenuItem, Category)
- [ ] 3.2.4 Define `src/types/table.ts` (Table, TableStatus)
- [ ] 3.2.5 Define `src/types/order.ts` (Order, OrderItem, OrderStatus)
- [ ] 3.2.6 Define `src/types/permissions.ts` (Permission, ROLE_PERMISSIONS)

### 3.3 WebSocket Service
- [ ] 3.3.1 Implement `src/lib/socket/socket.service.ts` with connection management
- [ ] 3.3.2 Add event listener/emitter pattern
- [ ] 3.3.3 Implement room join/leave functionality
- [ ] 3.3.4 Add reconnection logic with exponential backoff
- [ ] 3.3.5 Create typed event handlers for order and table updates

### 3.4 Internationalization
- [ ] 3.4.1 Configure i18next in `src/lib/i18n.ts`
- [ ] 3.4.2 Create `src/locales/en/translation.json` with English translations
- [ ] 3.4.3 Create `src/locales/vi/translation.json` with Vietnamese translations
- [ ] 3.4.4 Implement language detector and persistence

## 4. Application Shell

### 4.1 Providers
- [ ] 4.1.1 Create `src/app/providers/AuthProvider.tsx` with auth context
- [ ] 4.1.2 Create `src/app/providers/QueryProvider.tsx` with TanStack Query setup
- [ ] 4.1.3 Create `src/app/providers/ThemeProvider.tsx` for dark/light mode
- [ ] 4.1.4 Create `src/app/providers/index.tsx` combining all providers

### 4.2 Routing
- [ ] 4.2.1 Implement `src/app/router/routes.tsx` with route definitions
- [ ] 4.2.2 Create `src/app/router/ProtectedRoute.tsx` for auth guards
- [ ] 4.2.3 Implement lazy loading for feature modules
- [ ] 4.2.4 Set up route-based code splitting

### 4.3 Layouts
- [ ] 4.3.1 Create `src/app/layouts/MainLayout.tsx` with sidebar and header
- [ ] 4.3.2 Create `src/app/layouts/AuthLayout.tsx` for login/register pages
- [ ] 4.3.3 Create `src/app/layouts/KioskLayout.tsx` for fullscreen kiosk mode

### 4.4 Shared Components
- [ ] 4.4.1 Implement `src/components/shared/LoadingSpinner.tsx`
- [ ] 4.4.2 Implement `src/components/shared/EmptyState.tsx`
- [ ] 4.4.3 Implement `src/components/shared/ErrorBoundary.tsx`
- [ ] 4.4.4 Implement `src/components/shared/PageHeader.tsx`

## 5. Authentication Module

### 5.1 Auth Store
- [ ] 5.1.1 Implement `src/features/auth/stores/authStore.ts` with Zustand
- [ ] 5.1.2 Integrate Tauri secure store for token persistence
- [ ] 5.1.3 Implement login, logout, refreshToken actions
- [ ] 5.1.4 Add initializeAuth for startup token validation

### 5.2 Auth Service
- [ ] 5.2.1 Implement `src/features/auth/services/auth.service.ts`
- [ ] 5.2.2 Create login, logout, register, me, refreshToken API calls
- [ ] 5.2.3 Handle HttpOnly cookie fallback for web compatibility

### 5.3 Auth Components
- [ ] 5.3.1 Create `src/features/auth/components/LoginForm.tsx`
- [ ] 5.3.2 Create `src/features/auth/components/PinPad.tsx` for quick login
- [ ] 5.3.3 Create login page view

### 5.4 Auth Hooks
- [ ] 5.4.1 Implement `src/features/auth/hooks/useAuth.ts`
- [ ] 5.4.2 Implement `src/features/auth/hooks/useSession.ts`

## 6. Point of Sale (POS) Module

### 6.1 POS Components
- [ ] 6.1.1 Create `POSLayout.tsx` with split-panel design
- [ ] 6.1.2 Create `MenuGrid.tsx` for menu item display
- [ ] 6.1.3 Create `MenuCategoryTabs.tsx` for category filtering
- [ ] 6.1.4 Create `MenuItemCard.tsx` for individual items
- [ ] 6.1.5 Create `CartPanel.tsx` for order summary
- [ ] 6.1.6 Create `CartItem.tsx` for line items with quantity controls
- [ ] 6.1.7 Create `PaymentDialog.tsx` for payment processing
- [ ] 6.1.8 Create `ReceiptPreview.tsx` for print preview

### 6.2 POS Hooks
- [ ] 6.2.1 Implement `useCart.ts` for cart state management
- [ ] 6.2.2 Implement `useMenuItems.ts` for menu data fetching
- [ ] 6.2.3 Implement `usePayment.ts` for payment processing
- [ ] 6.2.4 Implement `useReceipt.ts` for receipt generation

### 6.3 POS View
- [ ] 6.3.1 Create `POSView.tsx` main view component
- [ ] 6.3.2 Integrate table selection flow
- [ ] 6.3.3 Implement order submission logic

## 7. Kitchen Display Module

### 7.1 Kitchen Components
- [ ] 7.1.1 Create `OrderCard.tsx` for individual order display
- [ ] 7.1.2 Create `OrderItemList.tsx` for order items
- [ ] 7.1.3 Create `OrderQueue.tsx` for order columns (pending, preparing, ready)
- [ ] 7.1.4 Create `KitchenStats.tsx` for dashboard statistics
- [ ] 7.1.5 Create `OrderTimer.tsx` for preparation time tracking

### 7.2 Kitchen Hooks
- [ ] 7.2.1 Implement `useKitchenOrders.ts` with WebSocket integration
- [ ] 7.2.2 Implement `useOrderStatus.ts` for status updates
- [ ] 7.2.3 Implement `useKitchenStats.ts` for statistics

### 7.3 Kitchen View
- [ ] 7.3.1 Create `KitchenDisplayView.tsx` main view
- [ ] 7.3.2 Implement real-time order updates via WebSocket
- [ ] 7.3.3 Add sound notifications for new orders

## 8. Tables Module

### 8.1 Tables Components
- [ ] 8.1.1 Create `TableGrid.tsx` for table layout display
- [ ] 8.1.2 Create `TableCard.tsx` for individual table
- [ ] 8.1.3 Create `TableStatus.tsx` badge component
- [ ] 8.1.4 Create `TableDetails.tsx` for table info panel

### 8.2 Tables Hooks
- [ ] 8.2.1 Implement `useTables.ts` for table data
- [ ] 8.2.2 Implement `useTableStatus.ts` with WebSocket updates

### 8.3 Tables View
- [ ] 8.3.1 Create `TablesView.tsx` main view
- [ ] 8.3.2 Integrate table selection with POS flow

## 9. Tauri Integration

### 9.1 Tauri Configuration
- [ ] 9.1.1 Update `tauri.conf.json` with app metadata and security settings
- [ ] 9.1.2 Configure window settings (size, position, decorations)
- [ ] 9.1.3 Set up Content Security Policy (CSP)
- [ ] 9.1.4 Configure capabilities/permissions in `capabilities/default.json`

### 9.2 Tauri Plugins
- [ ] 9.2.1 Add `tauri-plugin-store` for secure storage
- [ ] 9.2.2 Add `tauri-plugin-shell` for external commands
- [ ] 9.2.3 Add `tauri-plugin-notification` for system notifications
- [ ] 9.2.4 Add `tauri-plugin-window-state` for window persistence

### 9.3 Rust Commands
- [ ] 9.3.1 Implement `print_receipt` command in `src-tauri/src/commands/printer.rs`
- [ ] 9.3.2 Implement `get_printers` command to list available printers
- [ ] 9.3.3 Implement `get_machine_id` for device identification
- [ ] 9.3.4 Implement `get_system_info` for OS/architecture info

### 9.4 TypeScript Command Wrappers
- [ ] 9.4.1 Create `src/lib/tauri/commands.ts` with typed invoke wrappers
- [ ] 9.4.2 Create `src/lib/tauri/store.ts` for secure store helpers
- [ ] 9.4.3 Create `src/lib/tauri/window.ts` for window controls

## 10. Offline Support

### 10.1 IndexedDB Setup
- [ ] 10.1.1 Configure Dexie database in `src/lib/offline/db.ts`
- [ ] 10.1.2 Define offline queue schema
- [ ] 10.1.3 Implement data persistence helpers

### 10.2 Sync Queue
- [ ] 10.2.1 Implement `src/lib/offline/sync.ts` sync queue manager
- [ ] 10.2.2 Create queue action processors for each action type
- [ ] 10.2.3 Implement retry logic with exponential backoff
- [ ] 10.2.4 Add conflict resolution strategy

### 10.3 Offline Store
- [ ] 10.3.1 Create `src/stores/offlineStore.ts` for offline state
- [ ] 10.3.2 Implement `useOnlineStatus.ts` hook
- [ ] 10.3.3 Add offline indicator component

## 11. Settings Module

### 11.1 Settings Components
- [ ] 11.1.1 Create `SettingsLayout.tsx` with navigation
- [ ] 11.1.2 Create `GeneralSettings.tsx` (language, theme)
- [ ] 11.1.3 Create `PrinterSettings.tsx` for printer configuration
- [ ] 11.1.4 Create `NetworkSettings.tsx` for API endpoint config
- [ ] 11.1.5 Create `AboutSettings.tsx` with version info

### 11.2 Settings Store
- [ ] 11.2.1 Implement `src/stores/settingsStore.ts`
- [ ] 11.2.2 Persist settings via Tauri store

## 12. Styling & Theming

### 12.1 Global Styles
- [ ] 12.1.1 Create `src/styles/globals.css` with Tailwind base styles
- [ ] 12.1.2 Create `src/styles/themes.css` with CSS variables for light/dark themes
- [ ] 12.1.3 Match color scheme with web client

### 12.2 Theme Integration
- [ ] 12.2.1 Implement theme toggle component
- [ ] 12.2.2 Persist theme preference

## 13. Testing & Quality

### 13.1 Manual Testing
- [ ] 13.1.1 Test authentication flow (login, logout, token refresh)
- [ ] 13.1.2 Test POS workflow (table selection, order creation, payment)
- [ ] 13.1.3 Test kitchen display (real-time updates, status changes)
- [ ] 13.1.4 Test offline queue (network disconnect/reconnect)
- [ ] 13.1.5 Test printer integration
- [ ] 13.1.6 Cross-platform testing (Windows, macOS)

## 14. Build & Distribution

### 14.1 Build Configuration
- [ ] 14.1.1 Configure release build optimizations
- [ ] 14.1.2 Set up code signing (Windows, macOS)
- [ ] 14.1.3 Configure installer settings (NSIS for Windows, DMG for macOS)

### 14.2 Release
- [ ] 14.2.1 Create app icons for all platforms
- [ ] 14.2.2 Build release binaries
- [ ] 14.2.3 Test installation on clean machines

## 15. Documentation

### 15.1 Developer Documentation
- [ ] 15.1.1 Update `app/desktop/tauri/README.md` with setup instructions
- [ ] 15.1.2 Document architecture and folder structure
- [ ] 15.1.3 Document Tauri commands and IPC patterns

### 15.2 User Documentation
- [ ] 15.2.1 Create user guide for POS operations
- [ ] 15.2.2 Create troubleshooting guide
