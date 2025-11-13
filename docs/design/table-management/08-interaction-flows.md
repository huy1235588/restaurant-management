# Interaction Flows & State Diagrams

## Tổng Quan

Mô tả các luồng tương tác chính và state transitions trong table management system.

## Main Workflows

### 1. Create New Table Flow

```
[Start] 
  ↓
[Click "Add Table"]
  ↓
[Fill Form]
  ├→ [Validation Error] → [Show Error] → [Back to Form]
  └→ [Valid]
      ↓
    [Submit]
      ├→ [Success] → [Show Success] → [Refresh List] → [End]
      └→ [API Error] → [Show Error] → [Retry Option]
```

### 2. Status Change Flow

```
[Select Table]
  ↓
[Click Status Indicator]
  ↓
[Choose New Status]
  ↓
[Validation Check]
  ├→ [Invalid Transition] → [Show Warning] → [Cancel]
  └→ [Valid Transition]
      ↓
    [Additional Info Dialog] (if needed)
      ↓
    [Confirm]
      ↓
    [Optimistic Update]
      ↓
    [API Call]
      ├→ [Success] → [WebSocket Broadcast] → [End]
      └→ [Error] → [Rollback] → [Show Error]
```

### 3. Table Assignment Flow

```
[Reservation Created]
  ↓
[Need Table Assignment]
  ↓
[Auto-Suggest Tables]
  ├→ [Accept Suggestion] → [Assign] → [Update Status]
  └→ [Manual Selection]
      ↓
    [Browse Available Tables]
      ↓
    [Filter by Criteria]
      ↓
    [Select Table]
      ↓
    [Conflict Check]
      ├→ [Conflict Detected] → [Show Warning] → [Choose Another]
      └→ [No Conflict] → [Assign] → [Update Status]
```

### 4. Real-time Update Handling Flow

```
[WebSocket Event Received]
  ↓
[Parse Event Data]
  ↓
[Is Current User?]
  ├→ [Yes] → [Ignore (already updated locally)]
  └→ [No]
      ↓
    [Update Store]
      ↓
    [Trigger Re-render]
      ↓
    [Show Notification]
      ├→ [Critical Change] → [Modal Alert]
      └→ [Normal Change] → [Toast]
```

## State Diagrams

### Table Status State Machine

```
          ┌─────────────────┐
          │  🟢 Available   │
          └────┬────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────────┐
│ 🔴 Occ │ │ 🟡 Res │ │ 🔵 Maint │
└───┬────┘ └───┬────┘ └────┬─────┘
    │          │           │
    └──────────┴───────────┘
               │
               ▼
          ┌─────────────────┐
          │  🟢 Available   │
          └─────────────────┘
```

### UI State Flow

```
[Idle State]
  ↓
[User Action]
  ↓
[Loading State]
  ├→ [Success] → [Success State] → [Auto-dismiss] → [Idle]
  └→ [Error] → [Error State] → [User Dismiss] → [Idle]
```

## Error Handling Patterns

### Network Error

```
[API Call Failed]
  ↓
[Retry with Exponential Backoff]
  ├→ [Success after retry] → [Continue]
  └→ [Max retries reached]
      ↓
    [Show Error to User]
      ↓
    [Offer Manual Retry]
```

### Validation Error

```
[User Input]
  ↓
[Real-time Validation]
  ├→ [Valid] → [Enable Submit]
  └→ [Invalid]
      ↓
    [Show Inline Error]
      ↓
    [Disable Submit]
      ↓
    [Wait for Correction]
```

## Loading & Empty States

### Loading States

```
┌────────────────────────┐
│                         │
│    [Spinner]            │
│  Đang tải dữ liệu...   │
│                         │
└────────────────────────┘
```

### Empty States

```
┌────────────────────────┐
│        📭               │
│  Không có dữ liệu      │
│  [Thêm Mới]            │
└────────────────────────┘
```

(Continuing with more detailed interaction patterns, animation sequences, and user flow optimizations...)
