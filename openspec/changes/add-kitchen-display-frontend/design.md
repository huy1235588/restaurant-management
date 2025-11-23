# Kitchen Display System - Technical Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Application                        │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router                                             │
│  - /kitchen (single full-screen page)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Kitchen Display Module                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  View                     Components                      │  │
│  │  └─ KitchenDisplayView    ├─ KitchenOrderCard            │  │
│  │                            ├─ OrderStatusBadge            │  │
│  │                            ├─ PriorityBadge               │  │
│  │                            ├─ PrepTimeIndicator           │  │
│  │                            ├─ OrderItemsList              │  │
│  │                            ├─ KitchenStats                │  │
│  │                            └─ EmptyState                  │  │
│  │                                                            │  │
│  │  Hooks (React Query)       Hooks (WebSocket)             │  │
│  │  ├─ useKitchenOrders()     └─ useKitchenSocket()         │  │
│  │  ├─ useKitchenOrderById()                                │  │
│  │  ├─ useStartPreparing()    Services                      │  │
│  │  ├─ useMarkReady()         └─ kitchen.service.ts         │  │
│  │  ├─ useMarkCompleted()                                   │  │
│  │  └─ useCancelKitchenOrder() Utils                        │  │
│  │                             ├─ kitchen-helpers.ts         │  │
│  │                             └─ audio-notifications.ts     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP + WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                           │
├─────────────────────────────────────────────────────────────────┤
│  Kitchen Module                                                 │
│  ├─ KitchenController (REST API)                               │
│  │  ├─ GET /kitchen/orders                                     │
│  │  ├─ GET /kitchen/orders/:id                                 │
│  │  ├─ PATCH /kitchen/orders/:id/start                         │
│  │  ├─ PATCH /kitchen/orders/:id/ready                         │
│  │  ├─ PATCH /kitchen/orders/:id/complete                      │
│  │  └─ PATCH /kitchen/orders/:id/cancel                        │
│  │                                                              │
│  ├─ KitchenGateway (WebSocket, namespace: /kitchen)           │
│  │  ├─ emit: order:new                                         │
│  │  ├─ emit: order:update                                      │
│  │  └─ emit: order:completed                                   │
│  │                                                              │
│  ├─ KitchenService (Business Logic)                            │
│  └─ KitchenRepository (Data Access)                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↕
                        PostgreSQL Database
```

## Data Flow Diagrams

### 1. Chef Starts Preparing Order

```
User Action              Frontend                    Backend
───────────              ────────                    ───────
View order queue    →   KitchenDisplayView
                    ←   GET /kitchen/orders         → Fetch pending orders
                    ←   200 OK                      ← Return orders
Display cards       →   Render KitchenOrderCard[]

Click [Start]       →   useStartPreparing mutation
                    →   Optimistic update (status → ready)
                    →   PATCH /kitchen/orders/:id/start
                                                    → Validate status
                                                    → Update DB (status, startedAt)
                                                    → Emit order:update (WebSocket)
                    ←   200 OK                      ← Updated order
Update cache        →   React Query invalidates
                    ←   WebSocket: order:update     ← All clients receive event
Auto-refetch        →   Refresh order list
Show toast          →   "Order started!"
```

### 2. Chef Marks Order Ready

```
User Action              Frontend                    Backend
───────────              ────────                    ───────
Click [Mark Ready]  →   useMarkReady mutation
                    →   Optimistic update (status → ready)
                    →   PATCH /kitchen/orders/:id/ready
                                                    → Validate status
                                                    → Update DB (status, completedAt, prepTimeActual)
                                                    → Update main order (status → ready)
                                                    → Emit order:update (WebSocket)
                    ←   200 OK                      ← Updated order
Update cache        →   React Query invalidates
Play sound          →   "order-ready.mp3"
Show toast          →   "Order ready for pickup!"
                    ←   WebSocket: order:update     ← All kitchen clients update
                    ←   WebSocket: kitchen:order-ready → Waiters receive notification
```

### 3. Real-time New Order Flow

```
Waiter Action         Order Module              Kitchen Backend        Kitchen Frontend
─────────────         ────────────              ───────────────        ────────────────
Confirm order    →   PATCH /orders/:id/status
                 →   status: confirmed
                                              → Trigger: createKitchenOrder()
                                              → Insert KitchenOrder (status: pending)
                                              → Emit: order:new (WebSocket)
                                                                      ← Listen: order:new
                                                                      ← Play sound 🔔
                                                                      ← Show notification
                                                                      ← Flash red border
                                                                      ← Invalidate queries
                                                                      ← Scroll to new card
```

### 4. Waiter Picks Up Order

```
User Action              Frontend                    Backend
───────────              ────────                    ───────
Click [Complete]    →   useMarkCompleted mutation
                    →   PATCH /kitchen/orders/:id/complete
                                                    → Validate status (must be ready)
                                                    → Update kitchen order (status → completed)
                                                    → Update main order (status → serving)
                                                    → Emit: order:completed
                    ←   200 OK
Update cache        →   Remove from display (after 5s)
                    ←   WebSocket: order:completed  ← All clients update
```

## Component Hierarchy

```
KitchenDisplayView
├─ Header
│  ├─ Title ("Kitchen Display")
│  ├─ CurrentTime (auto-updating)
│  ├─ ConnectionStatus (green/red dot)
│  ├─ RefreshButton
│  ├─ FullScreenButton
│  └─ SoundSettingsButton
├─ KitchenStats (Summary Cards)
│  ├─ PendingOrdersCard
│  ├─ InProgressOrdersCard
│  ├─ ReadyOrdersCard
│  └─ AvgPrepTimeCard
├─ FilterBar
│  ├─ StatusFilterDropdown
│  ├─ PriorityFilterDropdown
│  ├─ SortDropdown
│  └─ ClearFiltersButton
├─ OrderGrid
│  └─ KitchenOrderCard (multiple, sorted by priority + time)
│     ├─ OrderHeader
│     │  ├─ OrderNumberBadge (large)
│     │  ├─ TableBadge
│     │  └─ PriorityBadge
│     ├─ CustomerInfo (name, phone - optional)
│     ├─ OrderItemsList
│     │  └─ OrderItem (multiple)
│     │     ├─ QuantityBadge
│     │     ├─ ItemName
│     │     └─ SpecialRequest (red text)
│     ├─ PrepTimeIndicator (timer, color-coded)
│     ├─ OrderStatusBadge
│     └─ ActionButtons
│        ├─ StartPreparingButton (if pending)
│        ├─ MarkReadyButton (if preparing)
│        ├─ CompleteButton (if ready)
│        └─ CancelButton (with confirmation)
└─ EmptyState (when no orders)
   ├─ ChefHatIcon
   └─ "No orders in queue"
```

## State Management Strategy

### React Query (Server State)

```typescript
// Query Keys
const kitchenKeys = {
  all: ['kitchen'] as const,
  orders: () => [...kitchenKeys.all, 'orders'] as const,
  order: (id: number) => [...kitchenKeys.all, 'order', id] as const,
};

// Queries
useKitchenOrders() → Cache key: ['kitchen', 'orders']
  - staleTime: 10s
  - refetchInterval: 30s (fallback if WebSocket fails)
  - refetchOnWindowFocus: true

useKitchenOrderById(id) → Cache key: ['kitchen', 'order', id]
  - staleTime: 5s
  - enabled: !!id

// Mutations (with optimistic updates)
useStartPreparing() → Invalidate: ['kitchen', 'orders']
useMarkReady() → Invalidate: ['kitchen', 'orders']
useMarkCompleted() → Invalidate: ['kitchen', 'orders']
useCancelKitchenOrder() → Invalidate: ['kitchen', 'orders']
```

### WebSocket Integration

```typescript
const useKitchenSocket = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/kitchen`, {
      auth: { token: getAuthToken() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('Kitchen WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Kitchen WebSocket disconnected');
      setIsConnected(false);
    });

    // New order in queue
    socket.on('order:new', (event) => {
      console.log('New kitchen order:', event.data);
      
      // Play sound
      playNewOrderSound();
      
      // Show browser notification
      showNotification('New Order!', {
        body: `Order #${event.data.orderNumber} for Table ${event.data.table.name}`,
        icon: '/icons/chef-hat.png',
      });
      
      // Flash UI
      flashNewOrder(event.data.kitchenOrderId);
      
      // Invalidate to refetch
      queryClient.invalidateQueries(kitchenKeys.orders());
    });

    // Order status updated
    socket.on('order:update', (event) => {
      console.log('Kitchen order updated:', event.data);
      
      // Optimistically update cache
      queryClient.setQueryData(
        kitchenKeys.order(event.data.kitchenOrderId),
        event.data
      );
      
      // Invalidate list
      queryClient.invalidateQueries(kitchenKeys.orders());
    });

    // Order completed (picked up)
    socket.on('order:completed', (event) => {
      console.log('Kitchen order completed:', event.data);
      
      // Auto-remove from display after 5 seconds
      setTimeout(() => {
        queryClient.invalidateQueries(kitchenKeys.orders());
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return { isConnected };
};
```

### Local State (Component State)

```typescript
// Filter state
const [statusFilter, setStatusFilter] = useState<KitchenOrderStatus | 'all'>('all');
const [priorityFilter, setPriorityFilter] = useState<KitchenPriority | 'all'>('all');
const [sortBy, setSortBy] = useState<'priority' | 'oldest' | 'newest'>('priority');

// UI state
const [isFullScreen, setIsFullScreen] = useState(false);
const [soundEnabled, setSoundEnabled] = useState(true);
const [soundVolume, setSoundVolume] = useState(80);

// New order flash effect
const [flashingOrderId, setFlashingOrderId] = useState<number | null>(null);
```

## API Integration

### Service Layer (`services/kitchen.service.ts`)

```typescript
import { apiClient } from '@/lib/axios';
import {
  KitchenOrder,
  KitchenOrderFilters,
} from '../types';

export const kitchenApi = {
  async getAll(filters?: KitchenOrderFilters): Promise<KitchenOrder[]> {
    const response = await apiClient.get('/kitchen/orders', { params: filters });
    return response.data.data;
  },

  async getById(id: number): Promise<KitchenOrder> {
    const response = await apiClient.get(`/kitchen/orders/${id}`);
    return response.data.data;
  },

  async startPreparing(id: number): Promise<KitchenOrder> {
    const response = await apiClient.patch(`/kitchen/orders/${id}/start`);
    return response.data.data;
  },

  async markReady(id: number): Promise<KitchenOrder> {
    const response = await apiClient.patch(`/kitchen/orders/${id}/ready`);
    return response.data.data;
  },

  async markCompleted(id: number): Promise<KitchenOrder> {
    const response = await apiClient.patch(`/kitchen/orders/${id}/complete`);
    return response.data.data;
  },

  async cancel(id: number): Promise<KitchenOrder> {
    const response = await apiClient.patch(`/kitchen/orders/${id}/cancel`);
    return response.data.data;
  },
};
```

## Type Definitions

### Core Types (`types/kitchen.types.ts`)

```typescript
export enum KitchenOrderStatus {
  PENDING = 'pending',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export type KitchenPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface KitchenOrder {
  kitchenOrderId: number;
  orderId: number;
  order: {
    orderNumber: string;
    table: {
      tableId: number;
      name: string;
    };
    customerName?: string;
    customerPhone?: string;
    orderItems: OrderItem[];
  };
  status: KitchenOrderStatus;
  priority: KitchenPriority;
  chefId?: number;
  chef?: {
    staffId: number;
    fullName: string;
  };
  startedAt?: string;
  completedAt?: string;
  prepTimeActual?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  orderItemId: number;
  menuItem: {
    itemId: number;
    itemName: string;
    imageUrl?: string;
  };
  quantity: number;
  specialRequest?: string;
}

export interface KitchenOrderFilters {
  status?: KitchenOrderStatus;
  priority?: KitchenPriority;
}

export interface NewOrderEvent {
  event: 'order:new';
  data: KitchenOrder;
  timestamp: string;
}

export interface OrderUpdateEvent {
  event: 'order:update';
  data: KitchenOrder;
  timestamp: string;
}

export interface OrderCompletedEvent {
  event: 'order:completed';
  data: KitchenOrder;
  timestamp: string;
}
```

## Utility Functions

### Kitchen Helpers (`utils/kitchen-helpers.ts`)

```typescript
import { KitchenOrder, KitchenOrderStatus, KitchenPriority } from '../types';

export class KitchenHelpers {
  // Time calculations
  static calculateElapsedTime(createdAt: string): number {
    const now = new Date();
    const created = new Date(createdAt);
    return Math.floor((now.getTime() - created.getTime()) / 1000); // seconds
  }

  static formatElapsedTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  static getPrepTimeColor(elapsedMinutes: number): string {
    if (elapsedMinutes < 10) return 'text-green-600'; // Fast
    if (elapsedMinutes < 30) return 'text-yellow-600'; // On-time
    return 'text-red-600'; // Slow
  }

  // Priority sorting
  static getPriorityWeight(priority: KitchenPriority): number {
    const weights = { urgent: 4, high: 3, normal: 2, low: 1 };
    return weights[priority];
  }

  static sortOrdersByPriority(orders: KitchenOrder[]): KitchenOrder[] {
    return [...orders].sort((a, b) => {
      // First by priority (DESC)
      const priorityDiff = 
        this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by creation time (ASC - oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  // Status helpers
  static getStatusColor(status: KitchenOrderStatus): string {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status];
  }

  static getPriorityColor(priority: KitchenPriority): string {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800',
    };
    return colors[priority];
  }

  static canStartOrder(status: KitchenOrderStatus): boolean {
    return status === KitchenOrderStatus.PENDING;
  }

  static canMarkReady(status: KitchenOrderStatus): boolean {
    return status === KitchenOrderStatus.READY;
  }

  static canComplete(status: KitchenOrderStatus): boolean {
    return status === KitchenOrderStatus.READY;
  }

  // Filtering
  static filterOrdersByStatus(
    orders: KitchenOrder[],
    status: KitchenOrderStatus | 'all'
  ): KitchenOrder[] {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  }

  static filterOrdersByPriority(
    orders: KitchenOrder[],
    priority: KitchenPriority | 'all'
  ): KitchenOrder[] {
    if (priority === 'all') return orders;
    return orders.filter(order => order.priority === priority);
  }
}
```

### Audio Notifications (`utils/audio-notifications.ts`)

```typescript
let audioContext: AudioContext | null = null;
let soundEnabled = true;
let soundVolume = 0.8;

export const initAudioContext = () => {
  if (typeof window !== 'undefined' && !audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

export const playNewOrderSound = async () => {
  if (!soundEnabled) return;

  try {
    const audio = new Audio('/sounds/new-order.mp3');
    audio.volume = soundVolume;
    await audio.play();
  } catch (error) {
    console.error('Failed to play new order sound:', error);
  }
};

export const playReadySound = async () => {
  if (!soundEnabled) return;

  try {
    const audio = new Audio('/sounds/order-ready.mp3');
    audio.volume = soundVolume;
    await audio.play();
  } catch (error) {
    console.error('Failed to play ready sound:', error);
  }
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  localStorage.setItem('kitchenSoundEnabled', enabled.toString());
};

export const setSoundVolume = (volume: number) => {
  soundVolume = Math.max(0, Math.min(1, volume));
  localStorage.setItem('kitchenSoundVolume', soundVolume.toString());
};

export const loadSoundPreferences = () => {
  const enabled = localStorage.getItem('kitchenSoundEnabled');
  const volume = localStorage.getItem('kitchenSoundVolume');
  
  if (enabled !== null) soundEnabled = enabled === 'true';
  if (volume !== null) soundVolume = parseFloat(volume);
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
};
```

## Performance Optimizations

### 1. Memoization

```typescript
const filteredOrders = useMemo(() => {
  let result = orders || [];
  
  if (statusFilter !== 'all') {
    result = KitchenHelpers.filterOrdersByStatus(result, statusFilter);
  }
  
  if (priorityFilter !== 'all') {
    result = KitchenHelpers.filterOrdersByPriority(result, priorityFilter);
  }
  
  return KitchenHelpers.sortOrdersByPriority(result);
}, [orders, statusFilter, priorityFilter]);

const stats = useMemo(() => ({
  pending: orders?.filter(o => o.status === 'pending').length || 0,
  inProgress: orders?.filter(o => o.startedAt && !o.completedAt).length || 0,
  ready: orders?.filter(o => o.status === 'ready').length || 0,
  avgPrepTime: calculateAvgPrepTime(orders),
}), [orders]);
```

### 2. Auto-update Timer (Efficient)

```typescript
// In PrepTimeIndicator component
const [elapsedSeconds, setElapsedSeconds] = useState(
  KitchenHelpers.calculateElapsedTime(createdAt)
);

useEffect(() => {
  const interval = setInterval(() => {
    setElapsedSeconds(prev => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### 3. Virtual Scrolling (if 50+ orders)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const rowVirtualizer = useVirtualizer({
  count: filteredOrders.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 250, // Estimated card height
  overscan: 5,
});
```

## Error Handling Strategy

```typescript
// In KitchenDisplayView
const { data: orders, error, isError, refetch } = useKitchenOrders();

if (isError) {
  return (
    <ErrorState
      error={error}
      onRetry={refetch}
      message="Failed to load kitchen orders"
    />
  );
}

// In mutation hooks
const startPreparingMutation = useMutation({
  mutationFn: kitchenApi.startPreparing,
  onSuccess: () => {
    toast.success('Order preparation started');
  },
  onError: (error) => {
    if (error.response?.status === 400) {
      toast.error('Cannot start preparing this order');
    } else if (error.response?.status === 404) {
      toast.error('Order not found');
    } else {
      toast.error('Failed to start order. Please try again.');
    }
  },
});
```

## Accessibility Considerations

```typescript
// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F5' || e.key === 'r') {
      e.preventDefault();
      refetch();
    }
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullScreen();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [refetch]);

// Screen reader support
<div role="status" aria-live="polite">
  {isLoading ? 'Loading kitchen orders...' : `${orders.length} orders in queue`}
</div>

// ARIA labels
<button
  onClick={() => handleStartPreparing(order.kitchenOrderId)}
  aria-label={`Start preparing order ${order.order.orderNumber}`}
>
  Start Preparing
</button>
```

## Testing Strategy

```typescript
// Component test
describe('KitchenOrderCard', () => {
  it('should display order information', () => {
    render(<KitchenOrderCard order={mockOrder} onAction={mockAction} />);
    
    expect(screen.getByText(mockOrder.order.orderNumber)).toBeInTheDocument();
    expect(screen.getByText(mockOrder.order.table.name)).toBeInTheDocument();
  });

  it('should show Start button for pending orders', () => {
    const pendingOrder = { ...mockOrder, status: 'pending' };
    render(<KitchenOrderCard order={pendingOrder} onAction={mockAction} />);
    
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });
});

// WebSocket integration test
describe('useKitchenSocket', () => {
  it('should play sound on new order event', async () => {
    const mockSound = jest.fn();
    jest.spyOn(audioNotifications, 'playNewOrderSound').mockImplementation(mockSound);
    
    const { result } = renderHook(() => useKitchenSocket());
    
    // Simulate WebSocket event
    act(() => {
      mockSocket.emit('order:new', { data: mockOrder });
    });
    
    await waitFor(() => {
      expect(mockSound).toHaveBeenCalled();
    });
  });
});
```

---

**Design Principles:**
1. **Real-time first**: WebSocket is primary, HTTP is fallback
2. **Chef-friendly**: Large touch targets, minimal clicks, auto-updates
3. **Performance**: Optimistic updates, memoization, virtual scrolling
4. **Resilience**: Auto-reconnect, offline handling, error recovery
5. **Accessibility**: Keyboard shortcuts, screen reader support, high contrast
