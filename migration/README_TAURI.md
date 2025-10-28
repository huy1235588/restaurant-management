# 🚀 Tauri Desktop App - Quick Start Guide

This guide will help you get started with building and running the Tauri desktop version of the Restaurant Management System.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js & pnpm**
   - Node.js 20+
   - pnpm 8+
   ```bash
   node --version  # Should be 20+
   pnpm --version  # Should be 8+
   ```

2. **Rust & Cargo**
   - Install from [rustup.rs](https://rustup.rs/)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   # Or on Windows, download from https://rustup.rs/
   
   # Verify installation
   rustc --version
   cargo --version
   ```

3. **System Dependencies**

   **Windows:**
   - Microsoft Visual Studio C++ Build Tools
   - WebView2 (usually pre-installed on Windows 10+)

   **macOS:**
   ```bash
   xcode-select --install
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.0-dev \
     build-essential \
     curl \
     wget \
     file \
     libssl-dev \
     libgtk-3-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

   **Linux (Fedora):**
   ```bash
   sudo dnf install webkit2gtk4.0-devel \
     openssl-devel \
     curl \
     wget \
     file \
     libappindicator-gtk3-devel \
     librsvg2-devel
   ```

## 🚀 Getting Started

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/huy1235588/restaurant-management.git
cd restaurant-management

# Install dependencies
cd client
pnpm install
cd ..
```

### 2. Development Mode

Run the application in development mode with hot-reload:

```bash
# From the repository root
cd src-tauri
cargo tauri dev
```

This will:
1. Start the Next.js development server on `localhost:3000`
2. Build the Rust backend
3. Open the Tauri desktop application window
4. Enable hot-reload for both frontend and backend changes

**Note:** The first build may take several minutes as Cargo downloads and compiles dependencies.

### 3. Production Build

> ⚠️ **Important:** Before building for production, you must configure Next.js for static export (see Configuration section below). The current Next.js configuration uses `standalone` output which is incompatible with Tauri.

Build the application for distribution:

```bash
# From the repository root
cd src-tauri
cargo tauri build
```

The built application will be located in:
- **Windows:** `src-tauri/target/release/bundle/nsis/` or `src-tauri/target/release/bundle/msi/`
- **macOS:** `src-tauri/target/release/bundle/macos/` and `src-tauri/target/release/bundle/dmg/`
- **Linux:** `src-tauri/target/release/bundle/appimage/` and `src-tauri/target/release/bundle/deb/`

## 🔧 Configuration

### Tauri Configuration

The main configuration file is `src-tauri/tauri.conf.json`. Key settings:

```json
{
  "build": {
    "devPath": "http://localhost:3000",  // Next.js dev server
    "distDir": "../client/out"            // Static export output (production)
  },
  "package": {
    "productName": "Restaurant Management",
    "version": "0.1.0"
  }
}
```

### Next.js Static Export Configuration (Required for Production Builds)

> ⚠️ **TODO (Phase 2):** The current Next.js configuration needs to be updated for Tauri compatibility.

**Current Configuration** (`client/next.config.ts`):
- Uses conditional `standalone` output (production builds on non-Windows platforms only)
- Default behavior on Windows and development mode
- Not compatible with Tauri's static file serving

**Required Changes** for Tauri production builds:

```typescript
const nextConfig: NextConfig = {
  output: 'export',  // Enable static export for Tauri
  images: {
    unoptimized: true,  // Required for static export
  },
  // Note: This will require adjusting API calls and SSR features
  // to be compatible with static export
};
```

**Important Considerations:**
- Static export doesn't support Next.js SSR, ISR, or API routes
- All API calls must target the separate Express backend server
- Image optimization must be disabled or handled differently
- Dynamic routes need to be pre-generated
- This is a Phase 2 task in the migration plan

For now, development mode (`cargo tauri dev`) works with the current configuration.

### Environment Variables

Create a `.env` file in the `client` directory for Next.js environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

## 📝 Common Commands

### Development

```bash
# Start dev mode
cd src-tauri && cargo tauri dev

# Check Rust code
cargo check

# Format Rust code
cargo fmt

# Run Rust tests
cargo test

# Lint Rust code
cargo clippy
```

### Building

```bash
# Build for development
cargo build

# Build for release (optimized)
cargo build --release

# Build Tauri app bundle
cargo tauri build
```

### Frontend (Next.js)

```bash
cd client

# Start Next.js dev server (standalone)
pnpm run dev

# Build Next.js for production
pnpm run build

# Start production server (standalone)
pnpm run start
```

## 🐛 Troubleshooting

### Issue: "cargo: command not found"

**Solution:** Rust is not installed or not in PATH.
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reload shell or:
source $HOME/.cargo/env
```

### Issue: "webkit2gtk not found" (Linux)

**Solution:** Install system dependencies.
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev

# Fedora
sudo dnf install webkit2gtk4.0-devel
```

### Issue: Build takes too long

**Solution:** First build is slow. Subsequent builds are much faster due to caching.
```bash
# Optional: Use faster linker (Linux/macOS)
cargo install cargo-quickinstall
cargo quickinstall mold
```

### Issue: Port 3000 already in use

**Solution:** Change the port in `src-tauri/tauri.conf.json`:
```json
{
  "build": {
    "devPath": "http://localhost:3001"
  }
}
```

And update `client/package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

### Issue: WebView2 not installed (Windows)

**Solution:** Download and install from [Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

## 📚 Next Steps

1. **Read the Migration Plan:** Check [TAURI_MIGRATION_PLAN.md](./TAURI_MIGRATION_PLAN.md) for the full migration strategy
2. **Explore the Code:** Start with `src-tauri/src/main.rs` to understand the Tauri setup
3. **Add Features:** Follow the migration plan to port features from the web app
4. **Test Cross-Platform:** Build and test on Windows, macOS, and Linux

## 🔗 Useful Links

- **Tauri Documentation:** https://tauri.app/
- **Tauri API Reference:** https://tauri.app/v1/api/js/
- **Rust Book:** https://doc.rust-lang.org/book/
- **Next.js Docs:** https://nextjs.org/docs
- **Repository:** https://github.com/huy1235588/restaurant-management
- **Issue #11:** https://github.com/huy1235588/restaurant-management/issues/11

## 💬 Support

If you encounter issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [TAURI_MIGRATION_PLAN.md](./TAURI_MIGRATION_PLAN.md)
3. Search existing [GitHub Issues](https://github.com/huy1235588/restaurant-management/issues)
4. Create a new issue with details about your problem

---

**Happy Building! 🎉**
