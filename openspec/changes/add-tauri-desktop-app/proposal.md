# Proposal: Add Tauri Desktop Application

## Why

The restaurant management system requires a dedicated desktop application for point-of-sale (POS) operations, kitchen display systems, and offline-capable management tasks. While the Next.js web client serves well for remote access and administrative functions, a native desktop application provides:

1. **Better POS performance** - Native rendering for cashier stations with faster checkout flows
2. **Offline capabilities** - Continue basic operations during network outages
3. **Hardware integration** - Direct access to receipt printers, cash drawers, barcode scanners via Tauri's native APIs
4. **System tray integration** - Background order notifications for kitchen staff
5. **Dedicated kiosk mode** - Lockdown mode for customer-facing terminals

The existing Next.js client in `/app/client` is a read-only reference—this proposal builds a separate Tauri + Vite + React application in `/app/desktop/tauri` that shares patterns and can reuse types/models without modifying the web client.

## What Changes

### New Desktop Application (`/app/desktop/tauri`)

- **Frontend**: Vite + React 19 with TypeScript (independent from Next.js)
- **Native layer**: Tauri 2.x with Rust backend for native capabilities
- **Styling**: Tailwind CSS 4.x with shadcn/ui compatible components
- **State**: Zustand for global state, TanStack Query for server state
- **Offline**: IndexedDB for local persistence + sync queue
- **Real-time**: Socket.io-client for live kitchen/order updates

### Optional Shared Packages (`/packages`)

- `@restaurant/types` - Shared TypeScript types/interfaces
- `@restaurant/api-client` - Platform-agnostic API client (axios-based)
- `@restaurant/validators` - Shared Zod validation schemas

### Integration Points

- **Server communication**: REST API via NestJS backend at `/api/v1`
- **Real-time updates**: WebSocket connection for kitchen display, orders
- **Authentication**: JWT-based auth with secure token storage via Tauri's secure store

## Impact

- **Affected code**:
  - `/app/desktop/tauri/*` - New desktop application (primary scope)
  - `/packages/*` - New shared packages (optional, can defer)
- **No changes to**:
  - `/app/client/*` - Next.js web client remains unchanged
  - `/app/server/*` - NestJS backend remains unchanged (already supports all required APIs)
- **Dependencies**:
  - Tauri 2.x CLI and plugins
  - Vite 7.x with React plugin
  - React 19.x (matching web client)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate code with Next.js client | High | Medium | Establish clear abstraction boundaries; shared packages for common logic |
| Tauri 2.x stability | Low | Medium | Pin versions; comprehensive testing |
| Learning curve for Rust commands | Medium | Low | Start with JavaScript-only features; add Rust incrementally |
| Offline sync complexity | Medium | High | Simple sync queue; conflict resolution via server timestamps |
