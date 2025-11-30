# Design Document: Tauri Desktop Application

## Context

This document outlines the technical architecture for building a cross-platform desktop application using Tauri 2.x, Vite, and React. The application will serve as a dedicated point-of-sale (POS) and kitchen display system for the restaurant management platform.

### Stakeholders
- **Restaurant staff**: Primary users (cashiers, kitchen staff, managers)
- **System administrators**: Deployment and configuration
- **Developers**: Implementation and maintenance

### Constraints
- Read-only access to `/app/client` - cannot modify the Next.js project
- Must integrate with existing NestJS backend API
- Windows and macOS support required (Linux optional)
- Must work with existing authentication system (JWT + HttpOnly cookies)

## Goals / Non-Goals

### Goals
1. Build a fully functional desktop POS application
2. Enable offline-capable operations with sync
3. Provide hardware integration (printers, scanners)
4. Share TypeScript types with web client where practical
5. Maintain consistent UI/UX with web application
6. Deliver fast, native-feeling performance

### Non-Goals
1. Replace the web client
2. Modify the Next.js codebase
3. Create a mobile application
4. Full offline capability (only queue-based for critical operations)
5. Support legacy operating systems

---

## 1. Project Analysis

### 1.1 Next.js Client Structure Analysis

The existing Next.js client follows a well-organized feature-based module architecture:

```
app/client/src/
├── app/                    # Next.js App Router pages
├── modules/                # Feature modules (menu, orders, tables, etc.)
│   └── [feature]/
│       ├── components/     # UI components
│       ├── views/          # Page-level views
│       ├── dialogs/        # Modal dialogs
│       ├── services/       # API clients
│       ├── hooks/          # React hooks
│       ├── types/          # TypeScript types
│       └── utils/          # Helpers
├── components/             # Shared components
│   ├── ui/                 # shadcn/ui primitives (30+ components)
│   ├── shared/             # App-specific shared components
│   ├── layouts/            # Layout components
│   └── providers/          # Context providers
├── lib/                    # Core utilities
│   ├── axios.ts            # HTTP client with interceptors
│   ├── socket/             # WebSocket service
│   ├── i18n.ts             # Internationalization
│   └── utils.ts            # Common utilities
├── stores/                 # Zustand stores
├── hooks/                  # Global hooks
├── types/                  # Shared types
└── services/               # Global services
```

### 1.2 Key Patterns to Reference (Not Copy)

| Pattern | Location | Reuse Strategy |
|---------|----------|----------------|
| API Response Types | `src/types/api.ts` | Reimplement in shared package |
| Auth Store Pattern | `src/stores/authStore.ts` | Adapt for Tauri secure store |
| Axios Interceptors | `src/lib/axios.ts` | Reimplement with Tauri-aware handling |
| Socket Service | `src/lib/socket/base.ts` | Reimplement with reconnection logic |
| Form Validation | `src/lib/validations/` | Move to shared package |
| UI Components | `src/components/ui/` | Reinstall via shadcn/ui CLI |
| Module Services | `src/modules/*/services/` | Reference API patterns |

### 1.3 What Should NOT Be Copied

| Item | Reason |
|------|--------|
| Next.js App Router files | Platform-specific routing |
| Server-side rendering logic | Not applicable to Vite |
| Next.js middleware | Platform-specific |
| `next.config.ts` | Next.js-specific configuration |
| RSC (React Server Components) | Not supported in Vite |
| Next.js image optimization | Use Vite image handling |

---

## 2. Desktop Architecture Plan

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Tauri Desktop Application                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 React Frontend (Vite)                     │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │   POS   │  │ Kitchen │  │ Tables  │  │  Menu   │     │   │
│  │  │  Module │  │ Display │  │  Mgmt   │  │  Mgmt   │     │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘     │   │
│  │       │            │            │            │           │   │
│  │  ┌────┴────────────┴────────────┴────────────┴────┐     │   │
│  │  │              State Management (Zustand)         │     │   │
│  │  │   ┌──────────┐  ┌──────────┐  ┌──────────┐    │     │   │
│  │  │   │  Auth    │  │  Orders  │  │  Offline │    │     │   │
│  │  │   │  Store   │  │   Store  │  │   Queue  │    │     │   │
│  │  │   └──────────┘  └──────────┘  └──────────┘    │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                          │                               │   │
│  │  ┌───────────────────────┴───────────────────────┐     │   │
│  │  │                API Layer                       │     │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │     │   │
│  │  │  │  REST    │  │  Socket  │  │  Tauri   │    │     │   │
│  │  │  │  Client  │  │  Client  │  │  IPC     │    │     │   │
│  │  │  └────┬─────┘  └────┬─────┘  └────┬─────┘    │     │   │
│  │  └───────┼─────────────┼─────────────┼──────────┘     │   │
│  └──────────┼─────────────┼─────────────┼────────────────┘   │
│             │             │             │                     │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│             │             │             │                     │
│  ┌──────────┴─────────────┴─────────────┴──────────────────┐ │
│  │                  Tauri Core (Rust)                       │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │ │
│  │  │  Commands  │  │  Plugins   │  │  Native Features   │ │ │
│  │  │  (IPC)     │  │  (Store,   │  │  (Printer, Window, │ │ │
│  │  │            │  │   HTTP)    │  │   Notifications)   │ │ │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WSS
                              ▼
                   ┌─────────────────────┐
                   │    NestJS Server    │
                   │    (Existing)       │
                   └─────────────────────┘
```

### 2.2 Application Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      APPLICATION STARTUP                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Tauri Launch   │
                    │  (main.rs)      │
                    └────────┬────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Load WebView     │
                    │  (index.html)     │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  React App Init   │
                    │  (main.tsx)       │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Check Stored   │  │  Initialize     │  │  Check Offline  │
│  Credentials    │  │  Services       │  │  Queue          │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Token Valid?     │
                    └─────────┬─────────┘
                        ┌─────┴─────┐
                        │           │
                   YES  ▼           ▼  NO
           ┌─────────────────┐  ┌─────────────────┐
           │  Fetch User     │  │  Show Login     │
           │  Profile        │  │  Screen         │
           └────────┬────────┘  └────────┬────────┘
                    │                    │
                    │           ┌────────▼────────┐
                    │           │  User Logs In   │
                    │           └────────┬────────┘
                    │                    │
                    └────────────────────┤
                                         │
                    ┌────────────────────▼────────────────────┐
                    │            AUTHENTICATED                 │
                    └────────────────────┬────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
           ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
           │  Connect        │  │  Load User      │  │  Process        │
           │  WebSocket      │  │  Preferences    │  │  Offline Queue  │
           └─────────────────┘  └─────────────────┘  └─────────────────┘
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │          MAIN APPLICATION               │
                    │  ┌──────────┐  ┌──────────┐            │
                    │  │   POS    │  │  Kitchen │   ...      │
                    │  │   View   │  │  Display │            │
                    │  └──────────┘  └──────────┘            │
                    └─────────────────────────────────────────┘
```

### 2.3 State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Store Architecture                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   authStore     │     │   orderStore    │     │  settingsStore  │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ user            │     │ activeOrders    │     │ theme           │
│ accessToken     │     │ pendingOrders   │     │ language        │
│ isAuthenticated │     │ selectedTable   │     │ printSettings   │
│ permissions     │     │ cart            │     │ displayMode     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ login()         │     │ addItem()       │     │ setTheme()      │
│ logout()        │     │ removeItem()    │     │ setLanguage()   │
│ refreshToken()  │     │ submitOrder()   │     │ savePrinter()   │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  offlineStore   │     │   tableStore    │
├─────────────────┤     ├─────────────────┤
│ isOnline        │     │ tables          │
│ pendingActions  │     │ selectedTable   │
│ lastSyncTime    │     │ tableStatuses   │
├─────────────────┤     ├─────────────────┤
│ queueAction()   │     │ selectTable()   │
│ processQueue()  │     │ updateStatus()  │
│ clearQueue()    │     │ fetchTables()   │
└─────────────────┘     └─────────────────┘

                    │
                    │ persist via
                    ▼
        ┌─────────────────────────┐
        │  Tauri Secure Store     │
        │  (sensitive data)       │
        └─────────────────────────┘
        ┌─────────────────────────┐
        │  IndexedDB              │
        │  (offline data)         │
        └─────────────────────────┘
```

---

## 3. Folder Structure Proposal

### 3.1 Complete Desktop Application Structure

```
app/desktop/tauri/
├── package.json                 # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── components.json              # shadcn/ui configuration
├── index.html                   # Entry HTML
│
├── src/                         # Frontend source code
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root component with providers
│   ├── vite-env.d.ts            # Vite type declarations
│   │
│   ├── app/                     # Application-level concerns
│   │   ├── providers/           # Root providers (Auth, Theme, Query)
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── index.tsx        # Combined providers
│   │   ├── router/              # Application routing
│   │   │   ├── routes.tsx       # Route definitions
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── index.tsx
│   │   └── layouts/             # Page layouts
│   │       ├── MainLayout.tsx   # Main app layout with sidebar
│   │       ├── AuthLayout.tsx   # Login/auth layout
│   │       └── KioskLayout.tsx  # Fullscreen kiosk mode
│   │
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication module
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── PinPad.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSession.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── stores/
│   │   │   │   └── authStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── pos/                 # Point of Sale module
│   │   │   ├── components/
│   │   │   │   ├── POSLayout.tsx
│   │   │   │   ├── MenuGrid.tsx
│   │   │   │   ├── CartPanel.tsx
│   │   │   │   ├── PaymentDialog.tsx
│   │   │   │   └── ReceiptPreview.tsx
│   │   │   ├── views/
│   │   │   │   └── POSView.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCart.ts
│   │   │   │   └── usePayment.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── kitchen/             # Kitchen Display module
│   │   │   ├── components/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderQueue.tsx
│   │   │   │   └── KitchenStats.tsx
│   │   │   ├── views/
│   │   │   │   └── KitchenDisplayView.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useKitchenOrders.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── tables/              # Table Management module
│   │   │   ├── components/
│   │   │   │   ├── TableGrid.tsx
│   │   │   │   ├── TableCard.tsx
│   │   │   │   └── TableStatus.tsx
│   │   │   ├── views/
│   │   │   │   └── TablesView.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTables.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── menu/                # Menu Management module
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   │
│   │   ├── orders/              # Order Management module
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   │
│   │   └── settings/            # Settings module
│   │       ├── components/
│   │       ├── views/
│   │       └── index.ts
│   │
│   ├── components/              # Shared components
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (30+ components)
│   │   └── shared/              # App-specific shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── PageHeader.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                   # Global hooks
│   │   ├── useOnlineStatus.ts
│   │   ├── useTauriEvent.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   │
│   ├── lib/                     # Core libraries
│   │   ├── api/                 # API client
│   │   │   ├── client.ts        # Axios instance
│   │   │   ├── interceptors.ts  # Request/response interceptors
│   │   │   └── index.ts
│   │   ├── socket/              # WebSocket client
│   │   │   ├── socket.service.ts
│   │   │   └── index.ts
│   │   ├── tauri/               # Tauri integration
│   │   │   ├── commands.ts      # IPC command wrappers
│   │   │   ├── store.ts         # Secure store helpers
│   │   │   └── index.ts
│   │   ├── offline/             # Offline support
│   │   │   ├── db.ts            # IndexedDB helpers
│   │   │   ├── sync.ts          # Sync queue management
│   │   │   └── index.ts
│   │   ├── utils.ts             # Utility functions (cn, etc.)
│   │   └── i18n.ts              # i18n setup
│   │
│   ├── stores/                  # Global Zustand stores
│   │   ├── authStore.ts
│   │   ├── settingsStore.ts
│   │   ├── offlineStore.ts
│   │   └── index.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── api.ts               # API response types
│   │   ├── auth.ts              # Auth types
│   │   ├── menu.ts              # Menu types
│   │   ├── order.ts             # Order types
│   │   ├── table.ts             # Table types
│   │   └── index.ts
│   │
│   ├── locales/                 # i18n translations
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── vi/
│   │       └── translation.json
│   │
│   └── styles/                  # Global styles
│       ├── globals.css          # Global CSS with Tailwind
│       └── themes.css           # Theme CSS variables
│
├── src-tauri/                   # Tauri/Rust backend
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri configuration
│   ├── capabilities/            # Permission capabilities
│   │   └── default.json
│   ├── icons/                   # Application icons
│   │   ├── icon.ico
│   │   ├── icon.png
│   │   └── ...
│   └── src/
│       ├── main.rs              # Main entry point
│       ├── lib.rs               # Library exports
│       ├── commands/            # Tauri commands
│       │   ├── mod.rs
│       │   ├── printer.rs       # Print commands
│       │   ├── storage.rs       # Secure storage
│       │   └── system.rs        # System info
│       └── utils/               # Rust utilities
│           └── mod.rs
│
└── public/                      # Static assets
    ├── icons/
    └── images/
```

### 3.2 Feature Module Structure Convention

Each feature module follows a consistent structure:

```
features/[module-name]/
├── components/          # UI components specific to this feature
│   ├── ComponentA.tsx
│   └── index.ts        # Barrel exports
├── views/              # Page-level views
│   ├── MainView.tsx
│   └── index.ts
├── dialogs/            # Modal dialogs (optional)
│   └── index.ts
├── hooks/              # Feature-specific hooks
│   ├── useFeature.ts
│   └── index.ts
├── services/           # API calls (optional, can use lib/api)
│   └── feature.service.ts
├── stores/             # Feature-specific stores (optional)
│   └── featureStore.ts
├── types/              # Feature-specific types (optional)
│   └── index.ts
└── index.ts            # Module barrel export
```

---

## 4. Component & Logic Reuse Strategy

### 4.1 Reuse Matrix

| Component/Logic | Web Client Location | Desktop Strategy |
|-----------------|---------------------|------------------|
| **UI Components (shadcn/ui)** | `components/ui/` | Reinstall via `npx shadcn@latest add` - same components, fresh installation |
| **TypeScript Types** | `types/` | Reimplement with same structure, consider shared package later |
| **API Client Pattern** | `lib/axios.ts` | Reimplement with Tauri-aware modifications |
| **Socket Service** | `lib/socket/` | Reimplement with same interface |
| **Auth Store Pattern** | `stores/authStore.ts` | Adapt for Tauri secure store |
| **Form Validations** | `lib/validations/` | Reimplement with Zod |
| **i18n Translations** | `locales/` | Reference for consistency |
| **Module Structure** | `modules/` | Follow same pattern in `features/` |
| **Utility Functions** | `lib/utils.ts` | Reimplement `cn()` and common utilities |

### 4.2 Type Definitions Strategy

**Phase 1: Local Types (MVP)**
```typescript
// src/types/api.ts - Reimplement locally
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Phase 2: Shared Package (Optional, Post-MVP)**
```
packages/
└── types/
    ├── package.json
    ├── src/
    │   ├── api.ts
    │   ├── auth.ts
    │   ├── menu.ts
    │   └── index.ts
    └── tsconfig.json
```

### 4.3 API Client Adaptation

The desktop API client differs from web in these key areas:

```typescript
// src/lib/api/client.ts
import axios from 'axios';
import { Store } from '@tauri-apps/plugin-store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Key difference: Use Tauri secure store instead of memory/localStorage
const secureStore = new Store('.credentials.dat');

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Note: No withCredentials for desktop - tokens managed by Tauri
});

// Interceptor uses Tauri secure store
apiClient.interceptors.request.use(async (config) => {
  const accessToken = await secureStore.get<string>('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

### 4.4 Authentication Adaptation

Desktop auth flow differs significantly:

```typescript
// Desktop auth store - uses Tauri secure storage
import { create } from 'zustand';
import { Store } from '@tauri-apps/plugin-store';

const secureStore = new Store('.credentials.dat');

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const response = await authApi.login(credentials);
    
    // Store tokens in Tauri secure store (encrypted)
    await secureStore.set('accessToken', response.accessToken);
    await secureStore.set('refreshToken', response.refreshToken);
    await secureStore.save();
    
    set({ user: response.user, isAuthenticated: true });
  },

  initializeAuth: async () => {
    // Load from secure store on startup
    const accessToken = await secureStore.get<string>('accessToken');
    if (accessToken) {
      try {
        const user = await authApi.me();
        set({ user, isAuthenticated: true });
      } catch {
        await get().clearAuth();
      }
    }
  },

  clearAuth: async () => {
    await secureStore.delete('accessToken');
    await secureStore.delete('refreshToken');
    await secureStore.save();
    set({ user: null, isAuthenticated: false });
  },
}));
```

---

## 5. Tauri Integration

### 5.1 Required Tauri Plugins

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-store = "2"      # Secure storage
tauri-plugin-shell = "2"      # Shell commands (printer)
tauri-plugin-notification = "2" # System notifications
tauri-plugin-window-state = "2" # Window position persistence
tauri-plugin-http = "2"       # Native HTTP client (optional)
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

### 5.2 Tauri Commands (Rust)

```rust
// src-tauri/src/commands/printer.rs
use tauri::command;

#[command]
pub async fn print_receipt(content: String, printer_name: Option<String>) -> Result<(), String> {
    // Platform-specific printing logic
    #[cfg(target_os = "windows")]
    {
        // Windows printing via shell
        use std::process::Command;
        // Implementation
    }
    
    #[cfg(target_os = "macos")]
    {
        // macOS printing via CUPS
    }
    
    Ok(())
}

#[command]
pub fn get_printers() -> Vec<String> {
    // Return list of available printers
    vec![]
}
```

```rust
// src-tauri/src/commands/system.rs
use tauri::command;

#[command]
pub fn get_machine_id() -> String {
    // Return unique machine identifier for licensing/tracking
    machine_uid::get().unwrap_or_default()
}

#[command]
pub fn get_system_info() -> SystemInfo {
    SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    }
}
```

### 5.3 IPC Communication Pattern

```typescript
// src/lib/tauri/commands.ts
import { invoke } from '@tauri-apps/api/core';

export const tauriCommands = {
  // Printer commands
  printReceipt: (content: string, printerName?: string) =>
    invoke<void>('print_receipt', { content, printerName }),
  
  getPrinters: () =>
    invoke<string[]>('get_printers'),
  
  // System commands
  getMachineId: () =>
    invoke<string>('get_machine_id'),
  
  getSystemInfo: () =>
    invoke<{ os: string; arch: string }>('get_system_info'),
};
```

### 5.4 Window Management

```typescript
// src/lib/tauri/window.ts
import { getCurrentWindow } from '@tauri-apps/api/window';

export const windowControls = {
  minimize: () => getCurrentWindow().minimize(),
  maximize: () => getCurrentWindow().toggleMaximize(),
  close: () => getCurrentWindow().close(),
  
  // Kiosk mode for customer-facing displays
  enterKiosk: async () => {
    const win = getCurrentWindow();
    await win.setFullscreen(true);
    await win.setAlwaysOnTop(true);
  },
  
  exitKiosk: async () => {
    const win = getCurrentWindow();
    await win.setFullscreen(false);
    await win.setAlwaysOnTop(false);
  },
};
```

---

## 6. Offline Support Architecture

### 6.1 Offline Queue System

```typescript
// src/lib/offline/sync.ts
import Dexie from 'dexie';

interface QueuedAction {
  id: string;
  type: 'CREATE_ORDER' | 'UPDATE_ORDER_STATUS' | 'UPDATE_TABLE_STATUS';
  payload: unknown;
  timestamp: number;
  retries: number;
}

class OfflineDatabase extends Dexie {
  queue!: Dexie.Table<QueuedAction, string>;
  
  constructor() {
    super('restaurant-offline');
    this.version(1).stores({
      queue: 'id, type, timestamp',
    });
  }
}

export const offlineDb = new OfflineDatabase();

export const syncQueue = {
  add: async (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => {
    await offlineDb.queue.add({
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    });
  },
  
  process: async () => {
    const actions = await offlineDb.queue.orderBy('timestamp').toArray();
    for (const action of actions) {
      try {
        await processAction(action);
        await offlineDb.queue.delete(action.id);
      } catch (error) {
        if (action.retries >= 3) {
          // Move to dead letter queue or notify user
          console.error('Action failed after 3 retries:', action);
        } else {
          await offlineDb.queue.update(action.id, {
            retries: action.retries + 1,
          });
        }
      }
    }
  },
};
```

### 6.2 Online Status Hook

```typescript
// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';
import { useOfflineStore } from '@/stores/offlineStore';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { processQueue } = useOfflineStore();
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process queued actions when coming back online
      processQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue]);
  
  return isOnline;
}
```

---

## 7. Security Considerations

### 7.1 Token Storage

| Platform | Storage Method | Security Level |
|----------|----------------|----------------|
| Web | HttpOnly Cookie (refresh) + Memory (access) | High |
| Desktop | Tauri Secure Store (encrypted) | High |

### 7.2 Security Configuration

```json
// src-tauri/tauri.conf.json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://api.restaurant.com wss://api.restaurant.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

### 7.3 Capability Permissions

```json
// src-tauri/capabilities/default.json
{
  "identifier": "default",
  "description": "Default capabilities for the app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "store:default",
    "shell:default",
    "notification:default",
    "window-state:default"
  ]
}
```

---

## 8. Performance Optimizations

### 8.1 Build Optimizations

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
});
```

### 8.2 Lazy Loading Strategy

```typescript
// src/app/router/routes.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/shared';

// Lazy load feature modules
const POSView = lazy(() => import('@/features/pos/views/POSView'));
const KitchenDisplayView = lazy(() => import('@/features/kitchen/views/KitchenDisplayView'));
const TablesView = lazy(() => import('@/features/tables/views/TablesView'));

export const routes = [
  {
    path: '/pos',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <POSView />
      </Suspense>
    ),
  },
  // ...
];
```

---

## Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Vite + React 19 | Fast builds, same React version as web client |
| Routing | React Router v7 | Industry standard for SPAs |
| State Management | Zustand + TanStack Query | Same pattern as web client, excellent DX |
| Styling | Tailwind CSS + shadcn/ui | Same as web client, consistent UI |
| Desktop Framework | Tauri 2.x | Modern, performant, Rust-backed |
| Offline Storage | IndexedDB (Dexie) | Robust client-side storage |
| Secure Storage | Tauri Plugin Store | Encrypted credential storage |
| API Client | Axios | Same as web client |
| Realtime | Socket.io | Same as web client |
| i18n | i18next | Same as web client |
| Forms | React Hook Form + Zod | Same as web client |

## Open Questions

1. **Shared packages priority**: Should we create `@restaurant/types` immediately or defer to post-MVP?
2. **Hardware support scope**: Which receipt printers and scanners to support initially?
3. **Offline sync conflicts**: How to handle conflicts when same order is modified offline by multiple devices?
4. **Auto-update strategy**: How should the desktop app handle updates?

## Migration Plan

### Phase 1: Foundation (Week 1-2)
- Set up Vite + React + Tailwind
- Install and configure shadcn/ui components
- Implement core routing and layouts
- Set up API client and auth flow

### Phase 2: Core Features (Week 3-4)
- Implement POS module
- Implement Kitchen Display module
- Add WebSocket integration
- Basic offline queue

### Phase 3: Polish & Native (Week 5-6)
- Add Tauri commands for printing
- System tray integration
- Window state persistence
- Performance optimization

### Phase 4: Testing & Release (Week 7-8)
- Cross-platform testing
- Bug fixes
- Documentation
- Initial release
