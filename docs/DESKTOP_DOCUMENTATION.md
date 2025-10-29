# Desktop Application Documentation - Restaurant Management System

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc](#kiến-trúc)
3. [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
4. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
5. [Cấu Hình](#cấu-hình)
6. [Tính Năng](#tính-năng)
7. [Development](#development)
8. [Build & Distribution](#build--distribution)
9. [Tauri APIs](#tauri-apis)
10. [Integration với Frontend](#integration-với-frontend)
11. [Platform-Specific Features](#platform-specific-features)
12. [Security](#security)
13. [Performance](#performance)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng Quan

Desktop Application của Restaurant Management System được xây dựng với **Tauri v2**, kết hợp sức mạnh của web technologies (React, TypeScript, Vite) với native capabilities của desktop platforms. Ứng dụng cung cấp trải nghiệm desktop native với hiệu suất cao và kích thước nhỏ gọn.

### Đặc Điểm Nổi Bật
- ✅ **Cross-Platform** - Windows, macOS, Linux
- ✅ **Lightweight** - Binary size nhỏ (~3-5 MB)
- ✅ **Native Performance** - Rust backend với WebView frontend
- ✅ **Secure** - Sandboxed execution với IPC communication
- ✅ **Auto-Update** - Built-in update mechanism
- ✅ **System Integration** - Native menus, notifications, tray icons
- ✅ **Offline Support** - Hoạt động mà không cần internet
- ✅ **Shared Codebase** - Reuse code từ web frontend

### Tại Sao Chọn Tauri?

| Feature | Tauri | Electron | React Native |
|---------|-------|----------|--------------|
| **Bundle Size** | 3-5 MB | 120+ MB | 50+ MB |
| **Memory Usage** | ~60 MB | ~300 MB | ~200 MB |
| **Startup Time** | Fast | Moderate | Slow |
| **Native APIs** | Full Access | Limited | Limited |
| **Security** | High | Moderate | Moderate |
| **Web Tech** | ✅ | ✅ | ❌ |

---

## 🏗️ Kiến Trúc

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Frontend Layer (WebView)               │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         React Application                     │  │    │
│  │  │  - Components (from web frontend)            │  │    │
│  │  │  - Pages & Routing                           │  │    │
│  │  │  - State Management (Zustand)                │  │    │
│  │  │  - UI (Tailwind + Radix)                     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                        │                             │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Tauri APIs (JavaScript)              │  │    │
│  │  │  - Window Management                         │  │    │
│  │  │  - File System                               │  │    │
│  │  │  - Dialog                                    │  │    │
│  │  │  - Notification                              │  │    │
│  │  │  - HTTP Client                               │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                  IPC Bridge (JSON-RPC)                       │
│                           │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Backend Layer (Rust Core)              │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Tauri Core                           │  │    │
│  │  │  - Window Management                         │  │    │
│  │  │  - Event System                              │  │    │
│  │  │  - Plugin System                             │  │    │
│  │  │  - Menu Builder                              │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Custom Commands                      │  │    │
│  │  │  - Database Operations                       │  │    │
│  │  │  - File Operations                           │  │    │
│  │  │  - System Integration                        │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Plugins                              │  │    │
│  │  │  - tauri-plugin-opener                       │  │    │
│  │  │  - tauri-plugin-fs (future)                  │  │    │
│  │  │  - tauri-plugin-notification (future)        │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Operating System Layer                      │    │
│  │  - Native Window Manager                           │    │
│  │  - File System Access                              │    │
│  │  - System Tray                                     │    │
│  │  - Native Dialogs                                  │    │
│  │  - Notifications                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Communication Flow

```
Frontend (React)
      │
      │ invoke('command_name', args)
      ▼
   Tauri API
      │
      │ IPC Message (JSON)
      ▼
  Rust Backend
      │
      │ Execute Command
      ▼
   Return Result
      │
      │ IPC Response (JSON)
      ▼
   Tauri API
      │
      │ Promise Resolution
      ▼
Frontend (React)
```

### Data Flow

```
User Interaction → React Component → Tauri Command → Rust Handler
        ▲                                                    │
        │                                                    │
        └────────────── Result/Event ──────────────────────┘
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend Stack

| Công Nghệ | Version | Mục Đích |
|-----------|---------|----------|
| **React** | 19.1.0 | UI Framework |
| **TypeScript** | ~5.8.3 | Type Safety |
| **Vite** | ^7.0.4 | Build Tool & Dev Server |

### Backend Stack

| Công Nghệ | Version | Mục Đích |
|-----------|---------|----------|
| **Tauri** | 2.0.0 | Desktop Framework |
| **Rust** | Latest | Backend Runtime |

### Tauri Plugins

| Plugin | Mục Đích |
|--------|----------|
| **@tauri-apps/api** | Core Tauri APIs |
| **@tauri-apps/plugin-opener** | Open URLs/Files |

### Development Tools

| Tool | Mục Đích |
|------|----------|
| **@tauri-apps/cli** | Tauri CLI Tool |
| **@vitejs/plugin-react** | Vite React Plugin |

---

## 📁 Cấu Trúc Thư Mục

```
desktop/tauri/
├── src/                        # Frontend Source Code
│   ├── assets/                # Static Assets
│   │   └── react.svg
│   │
│   ├── App.tsx                # Main App Component
│   ├── App.css                # App Styles
│   ├── main.tsx               # Entry Point
│   └── vite-env.d.ts          # Vite Types
│
├── src-tauri/                  # Tauri Backend (Rust)
│   ├── src/
│   │   ├── lib.rs            # Library Entry Point
│   │   └── main.rs           # Application Entry Point (future)
│   │
│   ├── icons/                 # Application Icons
│   │   ├── 32x32.png
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   ├── icon.icns         # macOS Icon
│   │   ├── icon.ico          # Windows Icon
│   │   └── icon.png          # Linux Icon
│   │
│   ├── Cargo.toml            # Rust Dependencies
│   ├── Cargo.lock            # Dependency Lock
│   ├── tauri.conf.json       # Tauri Configuration
│   └── build.rs              # Build Script
│
├── public/                    # Public Assets
├── index.html                # HTML Entry
├── vite.config.ts            # Vite Configuration
├── tsconfig.json             # TypeScript Config
├── tsconfig.node.json        # Node TypeScript Config
├── package.json              # Node Dependencies
└── README.md                 # Documentation
```

### Detailed Structure

#### Frontend (`src/`)
```
src/
├── assets/              # Images, fonts, static files
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── features/       # Feature-specific components
│   └── layouts/        # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── tauri.ts       # Tauri API wrappers
│   └── utils.ts       # Helper functions
├── pages/              # Page components
├── stores/             # State management
├── types/              # TypeScript types
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

#### Backend (`src-tauri/`)
```
src-tauri/
├── src/
│   ├── commands/       # Custom Tauri commands (future)
│   │   ├── database.rs
│   │   ├── file.rs
│   │   └── system.rs
│   │
│   ├── models/         # Data models (future)
│   ├── utils/          # Utility functions (future)
│   ├── lib.rs          # Library entry
│   └── main.rs         # Main entry (future)
│
├── capabilities/       # Permission definitions (future)
└── gen/                # Generated code
```

---

## ⚙️ Cấu Hình

### 1. Tauri Configuration (`src-tauri/tauri.conf.json`)

```json
{
    "$schema": "https://schema.tauri.app/config/2",
    "productName": "Restaurant Management",
    "version": "0.1.0",
    "identifier": "com.restaurant.management",
    "build": {
        "beforeDevCommand": "pnpm dev",
        "devUrl": "http://localhost:5173",
        "beforeBuildCommand": "pnpm build",
        "frontendDist": "../dist"
    },
    "app": {
        "windows": [
            {
                "title": "Restaurant Management",
                "width": 1280,
                "height": 800,
                "minWidth": 1024,
                "minHeight": 600,
                "resizable": true,
                "fullscreen": false,
                "decorations": true,
                "transparent": false,
                "fileDropEnabled": true
            }
        ],
        "security": {
            "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        }
    },
    "bundle": {
        "active": true,
        "targets": "all",
        "icon": [
            "icons/32x32.png",
            "icons/128x128.png",
            "icons/128x128@2x.png",
            "icons/icon.icns",
            "icons/icon.ico"
        ],
        "resources": [],
        "externalBin": [],
        "copyright": "",
        "category": "Business",
        "shortDescription": "Restaurant Management System",
        "longDescription": "A comprehensive restaurant management system for orders, inventory, staff, and more.",
        "windows": {
            "certificateThumbprint": null,
            "digestAlgorithm": "sha256",
            "timestampUrl": ""
        },
        "macOS": {
            "frameworks": [],
            "minimumSystemVersion": "10.13",
            "exceptionDomain": ""
        },
        "linux": {
            "deb": {
                "depends": []
            }
        }
    },
    "plugins": {
        "opener": {}
    }
}
```

### 2. Cargo Configuration (`src-tauri/Cargo.toml`)

```toml
[package]
name = "restaurant-management"
version = "0.1.0"
description = "Restaurant Management Desktop App"
authors = ["huy1235588"]
edition = "2021"

[lib]
name = "tauri_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.0.0", features = [] }

[dependencies]
tauri = { version = "2.0.0", features = ["devtools"] }
tauri-plugin-opener = "2.0.0"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# Future dependencies
# tauri-plugin-fs = "2.0.0"
# tauri-plugin-dialog = "2.0.0"
# tauri-plugin-notification = "2.0.0"
# tauri-plugin-store = "2.0.0"
# sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio"] }
# tokio = { version = "1", features = ["full"] }
```

### 3. Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    
    // Clear vite cache on server start
    clearScreen: false,
    
    // Enable tauri environment variables
    envPrefix: ['VITE_', 'TAURI_'],
    
    server: {
        port: 5173,
        strictPort: true,
        watch: {
            // Tell vite to ignore watching `src-tauri`
            ignored: ['**/src-tauri/**'],
        },
    },
    
    // Resolve aliases
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    
    build: {
        // Tauri uses Chromium on Windows and WebKit on macOS and Linux
        target: process.env.TAURI_PLATFORM === 'windows' 
            ? 'chrome105' 
            : 'safari13',
        
        // Don't minify for debug builds
        minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
        
        // Produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_DEBUG,
    },
});
```

### 4. TypeScript Configuration (`tsconfig.json`)

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,

        /* Bundler mode */
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "isolatedModules": true,
        "moduleDetection": "force",
        "noEmit": true,
        "jsx": "react-jsx",

        /* Linting */
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,

        /* Path Mapping */
        "baseUrl": ".",
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": ["src"]
}
```

### 5. Package Configuration (`package.json`)

```json
{
    "name": "restaurant-management-desktop",
    "private": true,
    "version": "0.1.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview",
        "tauri": "tauri",
        "tauri:dev": "tauri dev",
        "tauri:build": "tauri build",
        "tauri:build:debug": "tauri build --debug"
    },
    "dependencies": {
        "react": "^19.1.0",
        "react-dom": "^19.1.0",
        "@tauri-apps/api": "^2",
        "@tauri-apps/plugin-opener": "^2"
    },
    "devDependencies": {
        "@types/react": "^19.1.8",
        "@types/react-dom": "^19.1.6",
        "@vitejs/plugin-react": "^4.6.0",
        "typescript": "~5.8.3",
        "vite": "^7.0.4",
        "@tauri-apps/cli": "^2"
    }
}
```

---

## 🎯 Tính Năng

### 1. **Native Window Management**
```typescript
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

// Minimize window
await appWindow.minimize();

// Maximize window
await appWindow.maximize();

// Close window
await appWindow.close();

// Toggle fullscreen
await appWindow.setFullscreen(true);

// Set window title
await appWindow.setTitle('New Title');

// Set window size
await appWindow.setSize({ width: 1280, height: 800 });
```

### 2. **File System Access**
```typescript
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

// Open file dialog
const selected = await open({
    multiple: false,
    filters: [{
        name: 'JSON',
        extensions: ['json']
    }]
});

// Read file
const contents = await readTextFile(selected);

// Save file dialog
const filePath = await save({
    defaultPath: 'export.json',
    filters: [{
        name: 'JSON',
        extensions: ['json']
    }]
});

// Write file
await writeTextFile(filePath, JSON.stringify(data, null, 2));
```

### 3. **System Notifications**
```typescript
import { sendNotification } from '@tauri-apps/plugin-notification';

// Send notification
await sendNotification({
    title: 'New Order',
    body: 'Order #123 has been placed',
    icon: 'notification-icon.png',
});
```

### 4. **HTTP Requests**
```typescript
import { fetch } from '@tauri-apps/plugin-http';

// Make HTTP request
const response = await fetch('https://api.example.com/data', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
});

const data = await response.json();
```

### 5. **System Tray**
```typescript
import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';

// Create tray menu
const menu = await Menu.new({
    items: [
        {
            id: 'show',
            text: 'Show',
        },
        {
            id: 'quit',
            text: 'Quit',
        },
    ],
});

// Create tray icon
const tray = await TrayIcon.new({
    menu,
    icon: 'tray-icon.png',
    tooltip: 'Restaurant Management',
});

// Handle tray events
tray.on('click', () => {
    // Show window
});
```

### 6. **Custom Menu**
```typescript
import { Menu } from '@tauri-apps/api/menu';

const menu = await Menu.new({
    items: [
        {
            id: 'file',
            text: 'File',
            items: [
                { id: 'new', text: 'New' },
                { id: 'open', text: 'Open' },
                { id: 'save', text: 'Save' },
                { type: 'Separator' },
                { id: 'quit', text: 'Quit' },
            ],
        },
        {
            id: 'edit',
            text: 'Edit',
            items: [
                { id: 'undo', text: 'Undo' },
                { id: 'redo', text: 'Redo' },
            ],
        },
    ],
});
```

### 7. **Local Storage**
```typescript
import { Store } from '@tauri-apps/plugin-store';

// Create store
const store = new Store('settings.json');

// Set value
await store.set('theme', 'dark');

// Get value
const theme = await store.get('theme');

// Delete value
await store.delete('theme');

// Clear all
await store.clear();

// Save to disk
await store.save();
```

### 8. **Auto-Update**
```typescript
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

// Check for updates
const update = await check();

if (update?.available) {
    console.log(`Update to ${update.version} available!`);
    
    // Download and install
    await update.downloadAndInstall();
    
    // Relaunch app
    await relaunch();
}
```

---

## 🔧 Development

### Prerequisites
- **Rust** >= 1.70
- **Node.js** >= 18.x
- **pnpm** >= 8.x

### Platform-Specific Requirements

#### Windows
```bash
# Install Windows build tools
# Visual Studio 2019/2022 with C++ tools
# Or Windows Build Tools
npm install --global windows-build-tools
```

#### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
# Debian/Ubuntu
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel \
    openssl-devel \
    curl \
    wget \
    file \
    libxdo-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel

# Arch
sudo pacman -S webkit2gtk-4.1 \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    appmenu-gtk-module \
    libappindicator-gtk3 \
    librsvg
```

### Installation

```bash
# Navigate to desktop directory
cd desktop/tauri

# Install frontend dependencies
pnpm install

# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Development Server

```bash
# Start development with hot-reload
pnpm tauri dev

# Or
pnpm dev   # Start vite
pnpm tauri dev   # Start tauri (in another terminal)
```

### Available Scripts

```json
{
    "scripts": {
        "dev": "vite",                      // Start Vite dev server
        "build": "tsc && vite build",       // Build frontend
        "preview": "vite preview",          // Preview production build
        "tauri": "tauri",                   // Tauri CLI
        "tauri:dev": "tauri dev",           // Start Tauri dev mode
        "tauri:build": "tauri build",       // Build production app
        "tauri:build:debug": "tauri build --debug"  // Build debug app
    }
}
```

### Development Workflow

1. **Start Vite Dev Server**
   ```bash
   pnpm dev
   ```

2. **Start Tauri Dev Mode** (in another terminal)
   ```bash
   pnpm tauri dev
   ```

3. **Make Changes**
   - Frontend changes → Hot reload in Tauri window
   - Rust changes → Automatic rebuild and restart

4. **Debug**
   - Use browser DevTools (Right-click → Inspect)
   - Check Rust logs in terminal

---

## 🚀 Build & Distribution

### Build Production App

```bash
# Build for current platform
pnpm tauri build

# Build with debug symbols
pnpm tauri build --debug

# Build for specific target
pnpm tauri build --target x86_64-pc-windows-msvc
```

### Build Output

#### Windows
```
src-tauri/target/release/
├── restaurant-management.exe         # Executable
└── bundle/
    ├── msi/
    │   └── restaurant-management_0.1.0_x64_en-US.msi
    └── nsis/
        └── restaurant-management_0.1.0_x64-setup.exe
```

#### macOS
```
src-tauri/target/release/
└── bundle/
    ├── dmg/
    │   └── restaurant-management_0.1.0_x64.dmg
    └── macos/
        └── restaurant-management.app
```

#### Linux
```
src-tauri/target/release/
├── restaurant-management             # Binary
└── bundle/
    ├── deb/
    │   └── restaurant-management_0.1.0_amd64.deb
    └── appimage/
        └── restaurant-management_0.1.0_amd64.AppImage
```

### Code Signing

#### Windows
```json
// tauri.conf.json
{
    "bundle": {
        "windows": {
            "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
            "digestAlgorithm": "sha256",
            "timestampUrl": "http://timestamp.digicert.com"
        }
    }
}
```

#### macOS
```bash
# Sign the app
codesign --force --deep --sign "Developer ID Application: Your Name" \
    src-tauri/target/release/bundle/macos/restaurant-management.app

# Notarize with Apple
xcrun notarytool submit restaurant-management.dmg \
    --apple-id your@email.com \
    --team-id TEAMID \
    --password app-specific-password
```

### Auto-Update Setup

1. **Configure Update Server**
   ```json
   // tauri.conf.json
   {
       "updater": {
           "active": true,
           "endpoints": [
               "https://updates.yourdomain.com/{{target}}/{{current_version}}"
           ],
           "dialog": true,
           "pubkey": "YOUR_PUBLIC_KEY"
       }
   }
   ```

2. **Generate Keypair**
   ```bash
   pnpm tauri signer generate -- -w ~/.tauri/myapp.key
   ```

3. **Sign Updates**
   ```bash
   pnpm tauri signer sign \
       src-tauri/target/release/bundle/appimage/app.AppImage \
       --private-key ~/.tauri/myapp.key
   ```

4. **Upload to Update Server**
   - Upload signed binaries
   - Update version manifest

---

## 🔌 Tauri APIs

### Window API

```typescript
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

// Window state
const isMaximized = await appWindow.isMaximized();
const isFullscreen = await appWindow.isFullscreen();
const isVisible = await appWindow.isVisible();

// Window operations
await appWindow.show();
await appWindow.hide();
await appWindow.center();
await appWindow.setFocus();

// Window events
appWindow.listen('tauri://close-requested', () => {
    // Handle close
});

appWindow.listen('tauri://resize', ({ payload }) => {
    console.log('Window resized:', payload);
});
```

### Event API

```typescript
import { emit, listen } from '@tauri-apps/api/event';

// Listen to event
const unlisten = await listen('order-created', (event) => {
    console.log('Order created:', event.payload);
});

// Emit event
await emit('order-created', { orderId: 123 });

// Unlisten
unlisten();
```

### Dialog API

```typescript
import { 
    message, 
    ask, 
    confirm,
    open,
    save 
} from '@tauri-apps/plugin-dialog';

// Show message
await message('Order placed successfully!', {
    title: 'Success',
    type: 'info'
});

// Ask question
const answer = await ask('Delete this order?', {
    title: 'Confirm',
    type: 'warning'
});

// Confirm dialog
const yes = await confirm('Are you sure?', 'Confirm Action');

// Open file
const file = await open({
    multiple: false,
    directory: false,
    filters: [{
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg']
    }]
});

// Save file
const path = await save({
    defaultPath: 'report.pdf',
    filters: [{
        name: 'PDF',
        extensions: ['pdf']
    }]
});
```

### Shell API

```typescript
import { Command } from '@tauri-apps/plugin-shell';

// Execute command
const command = Command.create('echo', ['Hello World']);
const output = await command.execute();

console.log(output.stdout);
console.log(output.stderr);

// Open URL
import { open } from '@tauri-apps/plugin-opener';
await open('https://example.com');
```

### Path API

```typescript
import { 
    appDataDir,
    appConfigDir,
    appLogDir,
    desktopDir,
    documentDir,
    downloadDir,
    homeDir
} from '@tauri-apps/api/path';

// Get app directories
const appData = await appDataDir();
const appConfig = await appConfigDir();
const appLog = await appLogDir();

// Get user directories
const desktop = await desktopDir();
const documents = await documentDir();
const downloads = await downloadDir();
const home = await homeDir();
```

### Clipboard API

```typescript
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';

// Write to clipboard
await writeText('Hello, Clipboard!');

// Read from clipboard
const text = await readText();
console.log(text);
```

---

## 🔗 Integration với Frontend

### Shared Code Strategy

```
project/
├── client/                 # Web Frontend
│   └── src/
│       └── components/    # Shared components
│
├── desktop/tauri/         # Desktop App
│   └── src/
│       └── components/    # Desktop-specific components
│
└── shared/                # Shared Code (Future)
    ├── components/        # Common components
    ├── hooks/             # Common hooks
    ├── types/             # Common types
    └── utils/             # Common utilities
```

### Reuse Components

```typescript
// desktop/tauri/src/App.tsx
import { MenuList } from '../../client/src/components/features/menu/MenuList';
import { OrderForm } from '../../client/src/components/features/orders/OrderForm';

function App() {
    return (
        <div>
            <MenuList />
            <OrderForm />
        </div>
    );
}
```

### Platform Detection

```typescript
// lib/platform.ts
import { platform } from '@tauri-apps/plugin-os';

export const isDesktop = async () => {
    try {
        await platform();
        return true;
    } catch {
        return false;
    }
};

export const getPlatform = async () => {
    return await platform(); // 'windows' | 'macos' | 'linux'
};
```

### Conditional Features

```typescript
// components/MenuActions.tsx
import { isDesktop } from '@/lib/platform';

export function MenuActions() {
    const desktop = await isDesktop();

    return (
        <div>
            {desktop ? (
                <button onClick={exportToFile}>Export to File</button>
            ) : (
                <button onClick={downloadFile}>Download</button>
            )}
        </div>
    );
}
```

### API Abstraction

```typescript
// lib/api.ts
import { isDesktop } from './platform';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import axios from 'axios';

export const fetchAPI = async (url: string, options?: RequestInit) => {
    const desktop = await isDesktop();

    if (desktop) {
        // Use Tauri's fetch
        return await tauriFetch(url, options);
    } else {
        // Use axios for web
        return await axios(url, options);
    }
};
```

---

## 🖥️ Platform-Specific Features

### Windows-Specific

```typescript
// Check if Windows
import { platform } from '@tauri-apps/plugin-os';

if (await platform() === 'windows') {
    // Windows-specific code
}

// Windows notifications
import { sendNotification } from '@tauri-apps/plugin-notification';

await sendNotification({
    title: 'Restaurant Management',
    body: 'New order received',
    icon: 'notification-icon.png',
});
```

### macOS-Specific

```typescript
// macOS menu bar
import { Menu } from '@tauri-apps/api/menu';

if (await platform() === 'macos') {
    const menu = await Menu.new({
        items: [
            {
                id: 'app',
                text: 'Restaurant Management',
                items: [
                    { id: 'about', text: 'About' },
                    { type: 'Separator' },
                    { id: 'quit', text: 'Quit', accelerator: 'Cmd+Q' },
                ],
            },
        ],
    });
}
```

### Linux-Specific

```typescript
// Linux system tray
import { TrayIcon } from '@tauri-apps/api/tray';

if (await platform() === 'linux') {
    const tray = await TrayIcon.new({
        icon: 'tray-icon.png',
        tooltip: 'Restaurant Management',
    });
}
```

---

## 🔒 Security

### Content Security Policy (CSP)

```json
// tauri.conf.json
{
    "app": {
        "security": {
            "csp": "default-src 'self'; connect-src 'self' https://api.example.com; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'"
        }
    }
}
```

### Capabilities & Permissions

```json
// src-tauri/capabilities/default.json
{
    "identifier": "default",
    "description": "Default permissions",
    "windows": ["main"],
    "permissions": [
        "core:default",
        "core:window:allow-show",
        "core:window:allow-hide",
        "opener:allow-open",
        "fs:allow-read-file",
        "fs:allow-write-file"
    ]
}
```

### Secure IPC

```typescript
// Always validate data from frontend
#[tauri::command]
fn process_order(order_data: String) -> Result<String, String> {
    // Validate input
    if order_data.is_empty() {
        return Err("Invalid order data".to_string());
    }

    // Process safely
    Ok("Order processed".to_string())
}
```

### Best Practices

1. **Validate all input** from frontend
2. **Use allowlist** for commands
3. **Implement CSP** strictly
4. **Don't expose sensitive APIs** to frontend
5. **Use secure storage** for secrets
6. **Sign your binaries**
7. **Enable auto-updates** with signature verification

---

## ⚡ Performance

### Optimization Tips

#### 1. **Lazy Loading**
```typescript
import { lazy, Suspense } from 'react';

const MenuPage = lazy(() => import('./pages/MenuPage'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MenuPage />
        </Suspense>
    );
}
```

#### 2. **Debounce Events**
```typescript
import { debounce } from 'lodash';

const handleSearch = debounce((query: string) => {
    // Perform search
}, 300);
```

#### 3. **Optimize Tauri Commands**
```rust
// Use async for long-running tasks
#[tauri::command]
async fn fetch_data() -> Result<String, String> {
    tokio::time::sleep(Duration::from_secs(1)).await;
    Ok("Data".to_string())
}
```

#### 4. **Bundle Optimization**
```typescript
// vite.config.ts
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                },
            },
        },
    },
});
```

### Memory Management

```typescript
// Clean up listeners
useEffect(() => {
    const unlisten = await listen('event', handler);
    
    return () => {
        unlisten();
    };
}, []);
```

### Monitoring

```typescript
// Monitor window performance
import { getCurrentWindow } from '@tauri-apps/api/window';

const window = getCurrentWindow();

window.listen('tauri://error', (error) => {
    console.error('Window error:', error);
});
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Build Fails**
```bash
# Clear build cache
cd src-tauri
cargo clean

# Update dependencies
cargo update

# Rebuild
pnpm tauri build
```

#### 2. **Dev Mode Not Starting**
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process or change port in vite.config.ts
```

#### 3. **IPC Not Working**
```typescript
// Ensure command is registered in Rust
#[tauri::command]
fn my_command() -> String {
    "Hello".to_string()
}

// Register in main.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![my_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 4. **Plugin Not Found**
```bash
# Install plugin
pnpm add @tauri-apps/plugin-xxx

# Add to Cargo.toml
tauri-plugin-xxx = "2.0.0"

# Enable in tauri.conf.json
{
    "plugins": {
        "xxx": {}
    }
}
```

#### 5. **WebView Issues**
```bash
# Windows: Update WebView2
# Download from Microsoft Edge WebView2 Runtime

# Linux: Update webkit2gtk
sudo apt update && sudo apt upgrade webkit2gtk-4.1

# macOS: Update macOS
```

### Debug Mode

```bash
# Run with debug output
RUST_LOG=debug pnpm tauri dev

# Build with debug symbols
pnpm tauri build --debug

# Enable DevTools
# Right-click in app → Inspect Element
```

### Logging

```rust
// Add to Cargo.toml
[dependencies]
log = "0.4"
env_logger = "0.10"

// In main.rs
fn main() {
    env_logger::init();
    log::info!("App starting...");
    
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 📚 Resources

### Official Documentation
- [Tauri Docs](https://tauri.app/v2/)
- [Tauri API Reference](https://tauri.app/v2/reference/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [React Docs](https://react.dev)

### Community
- [Tauri Discord](https://discord.com/invite/tauri)
- [GitHub Discussions](https://github.com/tauri-apps/tauri/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/tauri)

### Examples
- [Tauri Examples](https://github.com/tauri-apps/tauri/tree/dev/examples)
- [Awesome Tauri](https://github.com/tauri-apps/awesome-tauri)

---

## 📝 Future Enhancements

### Planned Features

1. **Offline Mode**
   - Local database with SQLite
   - Sync when online

2. **Print Support**
   - Receipt printing
   - Kitchen order printing

3. **Hardware Integration**
   - Barcode scanner
   - Receipt printer
   - Cash drawer

4. **Advanced Analytics**
   - Local data analysis
   - Export to Excel/PDF

5. **Multi-window Support**
   - Kitchen display window
   - Customer display window

6. **Plugins**
   - Custom plugins for specific hardware
   - Third-party integrations

---

## 🔄 Migration from Web

### Steps to Migrate Features

1. **Identify Web-Only Features**
   - Features that require browser APIs
   - Features that need server-side rendering

2. **Replace with Tauri APIs**
   - Replace `fetch` with Tauri HTTP
   - Replace `localStorage` with Tauri Store
   - Replace browser file APIs with Tauri FS

3. **Test Platform Compatibility**
   - Test on Windows, macOS, Linux
   - Verify all features work

4. **Optimize for Desktop**
   - Add keyboard shortcuts
   - Implement native menus
   - Add system tray

---

## 📄 License

See main project LICENSE file.

---

**Tài liệu được tạo bởi:** Restaurant Management Development Team  
**Ngày cập nhật:** October 29, 2025  
**Version:** 0.1.0
