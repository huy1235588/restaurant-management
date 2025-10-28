# 🚀 Tauri Migration Plan

## Overview

This document outlines the comprehensive plan for migrating the Restaurant Management System from a Next.js 16 web application to a Tauri-based cross-platform desktop application.

**Related Issue:** [#11 - Migration from Web App to Tauri Desktop Application](https://github.com/huy1235588/restaurant-management/issues/11)

---

## 📋 Migration Audit Checklist

### Phase 1: Architecture & Feature Audit ✅
- [x] Review current Next.js application architecture
- [x] Document existing features and functionalities
- [x] Identify web-only features that need desktop adaptation
- [x] Create initial Tauri scaffold
- [ ] Analyze authentication flows and session management
- [ ] Audit API endpoints and data flows
- [ ] Review WebSocket usage for real-time updates
- [ ] Document state management patterns (Zustand stores)
- [ ] Catalog UI components and dependencies

### Phase 2: Tauri Setup & Configuration
- [x] Initialize Tauri project structure (src-tauri/)
- [x] Configure basic Cargo.toml with dependencies
- [x] Set up tauri.conf.json for Next.js integration
- [ ] Configure Next.js for static export (output: 'export' in next.config.ts)
- [ ] Configure build scripts for development and production
- [ ] Set up cross-platform build targets
- [ ] Create application icons for all platforms
- [ ] Configure code signing for distribution
- [ ] Set up updater mechanism for auto-updates

### Phase 3: Database & Data Layer Migration
- [ ] Evaluate local database options (SQLite, embedded PostgreSQL)
- [ ] Design data sync strategy between desktop and server
- [ ] Implement local database schema
- [ ] Create data migration utilities
- [ ] Implement offline-first data access layer
- [ ] Set up database backup and restore functionality
- [ ] Handle data conflicts and merge strategies

### Phase 4: Authentication & Security
- [ ] Implement secure credential storage (OS keychain integration)
- [ ] Adapt JWT authentication for desktop environment
- [ ] Create secure IPC channels between frontend and Rust backend
- [ ] Implement session persistence across app restarts
- [ ] Add biometric authentication support (where available)
- [ ] Implement certificate pinning for API calls
- [ ] Add security audit for desktop-specific vulnerabilities

### Phase 5: UI/UX Migration
- [ ] Adapt responsive web UI to fixed window sizes
- [ ] Implement native menus and keyboard shortcuts
- [ ] Add system tray integration
- [ ] Create native notifications
- [ ] Implement window state persistence
- [ ] Add multi-window support for kitchen displays
- [ ] Optimize for desktop performance and accessibility
- [ ] Implement drag-and-drop file handling

### Phase 6: Business Logic Migration
- [ ] Port order management to Rust backend
- [ ] Implement kitchen display system with local queue
- [ ] Migrate table management logic
- [ ] Port user and role management
- [ ] Implement inventory tracking
- [ ] Add reporting and analytics
- [ ] Create data export functionality
- [ ] Implement printer integration for receipts

### Phase 7: Real-time Features
- [ ] Migrate WebSocket connections to Tauri events
- [ ] Implement local event bus for real-time updates
- [ ] Create fallback for offline mode
- [ ] Add network status detection
- [ ] Implement queue for offline actions
- [ ] Test reconnection and sync logic

### Phase 8: Testing & Quality Assurance
- [ ] Set up unit tests for Rust backend
- [ ] Create integration tests for IPC
- [ ] Implement E2E tests for critical flows
- [ ] Perform cross-platform testing (Windows, macOS, Linux)
- [ ] Conduct performance benchmarking
- [ ] Security penetration testing
- [ ] User acceptance testing

### Phase 9: Packaging & Distribution
- [ ] Configure Windows installer (MSI/NSIS)
- [ ] Set up macOS app bundle and DMG
- [ ] Create Linux packages (AppImage, deb, rpm)
- [ ] Implement auto-updater
- [ ] Set up CI/CD for multi-platform builds
- [ ] Create installation documentation
- [ ] Plan distribution strategy (website, app stores)

---

## 🔧 Next.js Static Export Configuration

### Current Status
The existing Next.js application uses conditional `standalone` output, which is incompatible with Tauri's static file serving. This must be addressed in Phase 2.

### Required Changes

**File:** `client/next.config.ts`

```typescript
const nextConfig: NextConfig = {
  output: 'export',  // Enable static HTML export
  images: {
    unoptimized: true,  // Required for static export
  },
  // Remove or conditionally disable 'standalone' output
};
```

### Implications

1. **No Server-Side Features:**
   - No SSR (Server-Side Rendering)
   - No ISR (Incremental Static Regeneration)
   - No API routes in Next.js
   - All pages must be pre-rendered at build time

2. **API Communication:**
   - Frontend must call the separate Express backend
   - Cannot use Next.js API routes
   - May need to adjust CORS settings

3. **Dynamic Routes:**
   - Dynamic routes need `generateStaticParams`
   - Or convert to client-side routing

4. **Images:**
   - Next.js Image optimization disabled
   - Consider alternative image handling

### Migration Strategy

1. **Phase 1** (Current): Document requirements, scaffold ready
2. **Phase 2**: Configure Next.js for static export
3. **Phase 3**: Test and adjust features for static compatibility
4. **Phase 4**: Optimize static build size and performance

---

## 🗺️ Feature Mapping: Web → Desktop

| Web Feature | Desktop Implementation | Priority | Notes |
|-------------|------------------------|----------|-------|
| **Authentication** | OS keychain + JWT | High | Secure local credential storage |
| **Order Management** | Rust backend + local DB | High | Primary feature |
| **Kitchen Display** | Multi-window support | High | Real-time updates via Tauri events |
| **Table Management** | Local DB + sync | High | Offline-capable |
| **Real-time Updates** | Tauri event system | High | Replace WebSocket with native events |
| **Menu Management** | CRUD with local cache | Medium | Image storage in local filesystem |
| **Inventory Tracking** | Local DB with sync | Medium | Periodic server sync |
| **Reporting** | Local processing + export | Medium | PDF/CSV generation |
| **User Management** | Role-based with local cache | Medium | Admin features |
| **Multi-language** | i18n files bundled | Low | Same as web |
| **Notifications** | Native OS notifications | Low | Desktop-specific feature |
| **Printing** | Native printer integration | High | Receipt and report printing |

---

## 🗄️ Database Considerations

### Local Database Strategy

**Option 1: SQLite (Recommended for Phase 1)**
- ✅ Lightweight and embedded
- ✅ No separate server process
- ✅ File-based, easy backup
- ✅ Full SQL support
- ❌ Limited concurrent write performance

**Option 2: Embedded PostgreSQL**
- ✅ Full PostgreSQL compatibility
- ✅ Better for complex queries
- ❌ Heavier resource usage
- ❌ More complex setup

**Recommendation:** Start with SQLite for simplicity, with migration path to PostgreSQL if needed.

### Data Synchronization

1. **Initial Sync**: Download essential data on first launch
2. **Incremental Sync**: Periodic updates for changed data
3. **Conflict Resolution**: Last-write-wins with manual resolution for critical data
4. **Offline Queue**: Store operations when offline, sync when online
5. **Background Sync**: Non-blocking sync in background thread

### Schema Design

```sql
-- Local tables mirror server schema with additional sync metadata
CREATE TABLE sync_metadata (
  table_name TEXT PRIMARY KEY,
  last_sync_timestamp INTEGER,
  sync_status TEXT
);

-- Example: orders table with sync info
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  -- ... existing fields ...
  local_created_at INTEGER,
  local_updated_at INTEGER,
  sync_status TEXT,  -- 'synced', 'pending', 'conflict'
  server_updated_at INTEGER
);
```

---

## 🔐 Authentication & Session Handling

### Desktop Authentication Flow

1. **Login**: User enters credentials
2. **API Call**: Authenticate with server
3. **Token Storage**: Store JWT in OS keychain (not localStorage)
4. **Session Persistence**: Restore session on app restart
5. **Refresh Tokens**: Automatic token refresh in background

### Secure Storage Implementation

```rust
// Example using keyring crate
use keyring::Entry;

pub struct SecureStorage;

impl SecureStorage {
    pub fn store_token(token: &str) -> Result<(), Error> {
        let entry = Entry::new("restaurant-mgmt", "jwt_token")?;
        entry.set_password(token)?;
        Ok(())
    }
    
    pub fn get_token() -> Result<String, Error> {
        let entry = Entry::new("restaurant-mgmt", "jwt_token")?;
        entry.get_password()
    }
    
    pub fn delete_token() -> Result<(), Error> {
        let entry = Entry::new("restaurant-mgmt", "jwt_token")?;
        entry.delete_password()?;
        Ok(())
    }
}
```

---

## 🔌 IPC Strategy: Frontend ↔ Rust Backend

### Command Pattern

Tauri uses a command-based IPC system where the frontend invokes Rust functions.

```rust
// src-tauri/src/commands/auth.rs
#[tauri::command]
async fn login(username: String, password: String) -> Result<String, String> {
    // Authenticate with server
    // Store token securely
    // Return user info
}

// Register command in main.rs
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![login])
    .run(tauri::generate_context!())
```

```typescript
// Frontend invocation
import { invoke } from '@tauri-apps/api/tauri';

async function handleLogin(username: string, password: string) {
  try {
    const userInfo = await invoke('login', { username, password });
    return userInfo;
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Event System

For real-time updates and push notifications:

```rust
// Emit event from Rust
use tauri::Manager;

fn send_order_update(app: &tauri::AppHandle, order_id: u32) {
    app.emit_all("order-updated", order_id).unwrap();
}
```

```typescript
// Listen in frontend
import { listen } from '@tauri-apps/api/event';

listen('order-updated', (event) => {
  console.log('Order updated:', event.payload);
  // Update UI
});
```

---

## 📦 Packaging & Distribution

### Build Configuration

**Windows:**
- Installer: NSIS or WiX
- Format: `.exe` installer or `.msi`
- Code signing: Required for Windows Defender SmartScreen

**macOS:**
- Bundle: `.app` bundle
- Package: `.dmg` disk image
- Code signing: Apple Developer ID required
- Notarization: Required for Gatekeeper

**Linux:**
- AppImage: Universal, runs on most distros
- Deb: Debian/Ubuntu packages
- RPM: Fedora/RHEL packages
- Snap/Flatpak: Optional

### Auto-Update Strategy

1. Use Tauri's built-in updater
2. Host update manifests on GitHub releases or CDN
3. Check for updates on app startup
4. Download and install in background
5. Prompt user to restart when ready

### CI/CD Pipeline

```yaml
# .github/workflows/build.yml
name: Build Desktop App
on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: dtolnay/rust-toolchain@stable
      - run: pnpm install
      - run: pnpm tauri build
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: src-tauri/target/release/bundle/
```

---

## 🎯 Next Actionable Subtasks

### Immediate (Sprint 1-2)
1. **Complete Tauri Setup** ✅ (This PR)
   - Initialize src-tauri scaffold ✅
   - Configure basic build
   - Test build on all platforms
   - **Configure Next.js for static export** (required for production builds)

2. **Database Design**
   - Choose SQLite vs PostgreSQL
   - Design schema with sync metadata
   - Implement migration scripts

3. **Authentication POC**
   - Implement secure token storage
   - Create login command
   - Test session persistence

### Short-term (Sprint 3-5)
4. **Core Feature Migration**
   - Port order management
   - Implement kitchen display
   - Migrate table management

5. **Local Data Layer**
   - Set up SQLite database
   - Implement sync logic
   - Create offline queue

6. **UI Adaptation**
   - Adapt layouts for desktop
   - Add native menus
   - Implement system tray

### Medium-term (Sprint 6-10)
7. **Advanced Features**
   - Multi-window support
   - Printer integration
   - Native notifications

8. **Testing & QA**
   - Cross-platform testing
   - Performance optimization
   - Security audit

9. **Packaging**
   - Configure installers
   - Set up code signing
   - Implement auto-updater

### Long-term (Sprint 11+)
10. **Distribution & Maintenance**
    - Release v1.0
    - Set up support channels
    - Plan future enhancements

---

## ⏱️ Suggested Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: Setup & Planning** | 1 week | Tauri scaffold, migration plan (This PR) |
| **Phase 2: Core Infrastructure** | 2-3 weeks | Database, auth, basic IPC |
| **Phase 3: Feature Migration** | 4-6 weeks | Order mgmt, kitchen, tables |
| **Phase 4: UI/UX Polish** | 2-3 weeks | Native features, refinements |
| **Phase 5: Testing** | 2 weeks | QA, bug fixes |
| **Phase 6: Packaging** | 1 week | Installers, CI/CD |
| **Phase 7: Beta Release** | 2 weeks | Testing with users |
| **Phase 8: Production Release** | 1 week | Final v1.0 release |

**Total Estimated Time:** 15-19 weeks (~4-5 months)

---

## 🚨 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Next.js integration issues | Medium | High | Use static export, test early |
| Database sync conflicts | High | Medium | Implement robust conflict resolution |
| Cross-platform bugs | High | Medium | Test continuously on all platforms |
| Performance degradation | Low | Medium | Profile and optimize early |
| Code signing complexity | Medium | Low | Plan ahead, budget for certificates |
| User adoption resistance | Medium | High | Maintain web version initially |

---

## 📚 Resources & References

### Tauri Documentation
- [Tauri Guide](https://tauri.app/v1/guides/)
- [Tauri API](https://tauri.app/v1/api/js/)
- [Tauri Rust API](https://docs.rs/tauri/)

### Database
- [SQLite Rust Bindings](https://docs.rs/rusqlite/)
- [Diesel ORM](https://diesel.rs/)
- [SeaORM](https://www.sea-ql.org/SeaORM/)

### Authentication
- [keyring-rs](https://docs.rs/keyring/)
- [OAuth for Desktop Apps](https://oauth.net/2/native-apps/)

### Build & Distribution
- [Tauri Action (GitHub Actions)](https://github.com/tauri-apps/tauri-action)
- [Code Signing Guide](https://tauri.app/v1/guides/distribution/sign-macos/)

---

## 💡 Additional Considerations

### Backwards Compatibility
- Maintain web version during transition
- Support data export/import between versions
- Provide migration guide for users

### Performance Targets
- App startup: < 2 seconds
- UI responsiveness: < 100ms for actions
- Memory usage: < 200MB idle
- CPU usage: < 5% idle

### Accessibility
- Keyboard navigation for all features
- Screen reader support
- High contrast mode
- Scalable UI

### Localization
- Bundle existing i18n translations
- Support system locale detection
- Easy addition of new languages

---

## 📝 Notes

- This is a living document and will be updated as the migration progresses
- Each phase should have its own detailed technical specification
- Regular team sync-ups are recommended to track progress
- Community feedback should be incorporated into the plan

**Last Updated:** October 28, 2025
**Next Review:** After Phase 2 completion
