# Cập Nhật Thời Gian Thực (Real-time Updates)

## Tổng Quan

Hệ thống real-time updates sử dụng WebSocket (Socket.io) để đồng bộ trạng thái bàn giữa nhiều clients trong thời gian thực.

## Connection Management

### Connection Status Indicator

```
┌────────────────────────────────────┐
│ 🟢 Kết Nối | ⚡ Live Updates ON   │  ← Online
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🟡 Đang Kết Nối Lại... (3s)       │  ← Reconnecting
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🔴 Mất Kết Nối | [🔄 Thử Lại]     │  ← Disconnected
└────────────────────────────────────┘
```

## Live Status Changes

### Update Animation

```
Step 1: Incoming change (flash effect)
┏━━━━━━━━━━┓
┃▓▓▓T5▓▓▓▓▓┃
┃▓▓🔴▓▓▓▓▓▓┃
┗━━━━━━━━━━┛

Step 2: Toast notification
┌────────────────────────────┐
│ ℹ️ Bàn T5 đã được cập nhật │
│ Bởi: Nguyễn Văn A          │
│ [Xem Chi Tiết]             │
└────────────────────────────┘

Step 3: Updated state
┏━━━━━━━━━━┓
┃   T5     ┃
┃  🔴       ┃
┗━━━━━━━━━━┛
```

## Collaborative Editing

### Lock Indicator

```
┏━━━━━━━━━━┓
┃   T5  🔒 ┃  ← Being edited by another user
┃ 👤 Văn A  ┃
┗━━━━━━━━━━┛
```

## Optimistic UI Updates

Handle local changes immediately with rollback on error

## WebSocket Events

```typescript
// Table status changed
socket.on('table:status-changed')

// Table position updated  
socket.on('table:position-updated')

// Table assigned
socket.on('table:assigned')

// User joined floor view
socket.on('user:joined-floor')
```

(Continuing with event handlers, reconnection logic, conflict resolution, and performance optimization strategies...)
