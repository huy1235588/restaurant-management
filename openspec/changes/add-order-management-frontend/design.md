# Technical Design - Order Management Frontend

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Application                        │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router                                             │
│  - /orders (list)                                               │
│  - /orders/new (create - multi-step)                            │
│  - /orders/[id] (detail)                                        │
│  - /orders/[id]/edit (add items)                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Order Management Module                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Views                    Components                      │  │
│  │  ├─ OrderListView         ├─ OrderCard                   │  │
│  │  ├─ CreateOrderView       ├─ OrderItemList               │  │
│  │  ├─ OrderDetailView       ├─ OrderStatusBadge            │  │
│  │  └─ EditOrderView         ├─ OrderSummaryCard            │  │
│  │                            ├─ TableSelector               │  │
│  │  Dialogs (Confirm Only)   ├─ MenuItemSelector            │  │
│  │  ├─ CancelItemDialog      ├─ ShoppingCart                │  │
│  │  └─ CancelOrderDialog     └─ StepIndicator               │  │
│  │                            └─ useOrderSocket()            │  │
│  │  Services                                                │  │
│  │  └─ orderApi (Axios)      Types & Utils                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          WebSocket (Socket.io Client)                     │  │
│  │  Events: order:created, order:updated, kitchen:ready...  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP & WS
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API (NestJS)                       │
├─────────────────────────────────────────────────────────────────┤
│  Order Module            Kitchen Module                         │
│  ├─ OrderController      ├─ KitchenController                  │
│  ├─ OrderService         ├─ KitchenService                     │
│  ├─ OrderRepository      ├─ KitchenRepository                  │
│  └─ OrderGateway (WS)    └─ KitchenGateway (WS)                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database (Prisma)                   │
│  Tables: Order, OrderItem, KitchenOrder, Table, MenuItem        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Creating an Order

```
User Action                    Frontend                   Backend
───────────                    ────────                   ───────
Navigate to /orders     →    Show OrderListView
Click "New Order"       →    Navigate to /orders/new
                        →    CreateOrderView (Step 1)

[STEP 1: Table]
Select Table            →    TableSelector component
Click "Next"            →    Validate & go to Step 2

[STEP 2: Customer]
Enter customer info     →    Form inputs
Click "Next"            →    Validate & go to Step 3

[STEP 3: Menu Items]
Browse menu             →    MenuItemSelector          → GET /menu
Add items to cart       →    ShoppingCart updates
Enter special requests  →    Per-item notes
Click "Next"            →    Validate (≥1 item) & Step 4

[STEP 4: Review]
Review all info         →    Show summary
Edit sections           →    Navigate back to step
Click "Create Order"    →    Submit form               → POST /orders
                        ←    201 Created               ← Order created
                        ←    WebSocket event           ← order:created
Navigate to detail      →    Redirect to /orders/:id
                        ←    Kitchen receives order    ← kitchen:new_order
```

### 2. Adding Items to Order

```
User Action              Frontend                    Backend
───────────              ────────                    ───────
View order detail   →   OrderDetailView
Click "Add Items"   →   Navigate to /orders/:id/edit
                    →   EditOrderView
Show current order  →   Read-only summary          → GET /orders/:id
Browse menu         →   MenuItemSelector           → GET /menu
Add items to cart   →   ShoppingCart (new items)
Review changes      →   Show current + new items
                    →   Calculate updated total
Click "Add Items"   →   Submit new items           → PATCH /orders/:id/items
                    ←   200 OK                     ← Items added
                    ←   WebSocket event            ← order:items-added
Navigate back       →   Redirect to /orders/:id
Auto-refetch order  →   Update order detail        → GET /orders/:id
                    ←   Kitchen updated            ← kitchen:new_items
```

### 3. Real-time Updates Flow

```
Kitchen Action          Backend                     Frontend (Waiter)
──────────────          ───────                     ─────────────────
Mark order ready   →   PATCH /kitchen/:id/ready
                   →   Update DB
                   →   Emit WebSocket              → order:status-changed
                                                    → kitchen:order-ready
                                                    ← Show notification
                                                    ← Auto-refetch order
```

## Component Hierarchy

```
OrderListView
├─ Header
│  └─ CreateOrderButton → Navigate to /orders/new
├─ FiltersSection
│  ├─ StatusFilter
│  ├─ TableFilter
│  ├─ StaffFilter
│  ├─ DateRangeFilter
│  └─ SearchInput
├─ SortingControls
├─ OrderGrid / OrderTable
│  └─ OrderCard (multiple)
│     ├─ OrderStatusBadge
│     └─ ActionButtons
│        ├─ ViewButton → Navigate to /orders/[id]
│        ├─ AddItemsButton → Navigate to /orders/[id]/edit
│        └─ CancelButton → CancelOrderDialog
└─ Pagination

CreateOrderView (/orders/new)
├─ Breadcrumb (Orders > New Order)
├─ StepIndicator (1 of 4, 2 of 4, etc.)
├─ Step1: TableSelection
│  ├─ TableSelector
│  │  ├─ FloorFilter
│  │  ├─ StatusFilter
│  │  └─ TableGrid
│  └─ NavigationButtons (Cancel, Next)
├─ Step2: CustomerInfo
│  ├─ CustomerNameInput (optional)
│  ├─ PhoneInput (optional)
│  ├─ PartySizeInput (required)
│  ├─ ReservationSearch
│  └─ NavigationButtons (Back, Next)
├─ Step3: MenuItems
│  ├─ MenuItemSelector
│  │  ├─ CategoryTabs
│  │  ├─ MenuItemGrid
│  │  └─ SearchFilter
│  ├─ ShoppingCart (sidebar)
│  │  ├─ CartItemList
│  │  ├─ QuantityControls
│  │  ├─ RemoveButton
│  │  └─ Subtotal
│  └─ NavigationButtons (Back, Next)
└─ Step4: ReviewConfirm
   ├─ TableSummary (editable → Step 1)
   ├─ CustomerSummary (editable → Step 2)
   ├─ ItemsList (editable → Step 3)
   ├─ OrderNotesInput
   ├─ PriceBreakdown
   │  ├─ Subtotal
   │  ├─ ServiceCharge
   │  ├─ Tax
   │  └─ GrandTotal
   └─ ActionButtons (Cancel, Create Order)

OrderDetailView (/orders/[id])
├─ Breadcrumb
├─ OrderHeader
│  ├─ OrderNumber
│  ├─ OrderStatusBadge
│  ├─ TableInfo
│  └─ CustomerInfo
├─ OrderItemList
│  └─ OrderItem (multiple)
│     ├─ ItemStatusBadge
│     └─ ItemActions
│        ├─ CancelItemButton → CancelItemDialog
│        └─ MarkServedButton
├─ OrderSummaryCard
│  ├─ Subtotal
│  ├─ ServiceCharge
│  ├─ Tax
│  ├─ Discount
│  └─ Total
├─ ActionButtons
│  ├─ AddItemsButton → Navigate to /orders/[id]/edit
│  ├─ CancelOrderButton → CancelOrderDialog
│  ├─ PrintButton
│  └─ CreateBillButton
└─ OrderTimeline
   └─ TimelineEvent (multiple)

EditOrderView (/orders/[id]/edit)
├─ Breadcrumb (Orders > [Order #] > Add Items)
├─ CurrentOrderSummary (read-only header)
│  ├─ OrderNumber
│  ├─ TableInfo
│  ├─ StatusBadge
│  ├─ CurrentItemsList (collapsed)
│  └─ CurrentTotal
├─ AddNewItemsSection
│  ├─ MenuItemSelector
│  │  ├─ CategoryTabs
│  │  ├─ MenuItemGrid
│  │  └─ SearchFilter
│  └─ ShoppingCart (new items only)
│     ├─ CartItemList
│     ├─ QuantityControls
│     ├─ RemoveButton
│     └─ NewItemsSubtotal
├─ ReviewChangesSection
│  ├─ CurrentItems (grayed out)
│  ├─ NewItems (highlighted)
│  ├─ UpdatedTotal
│  └─ PriceDifference (+X VND)
└─ ActionButtons
   ├─ CancelButton → Back to /orders/[id]
   └─ AddItemsButton (submit)

CancelItemDialog (Modal)
├─ ItemDetails
├─ ReasonSelector
└─ ConfirmButtons

CancelOrderDialog (Modal)
├─ OrderSummary
├─ ReasonInput
├─ WarningMessage
└─ ConfirmButtons
```

## State Management Strategy

### CreateOrderView Multi-Step Form State

```typescript
interface CreateOrderFormState {
  // Step 1: Table
  tableId?: string;
  
  // Step 2: Customer
  customerName?: string;
  customerPhone?: string;
  partySize: number;
  reservationId?: string;
  
  // Step 3: Menu Items
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialRequest?: string;
    variant?: string;
  }>;
  
  // Step 4: Review
  note?: string;
}

// Multi-step wizard state management
const useCreateOrderForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateOrderFormState>(initialState);
  const [isDirty, setIsDirty] = useState(false);

  // Save to localStorage on each step change
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem('createOrderDraft', JSON.stringify(formData));
    }
  }, [formData, isDirty]);

  // Load from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('createOrderDraft');
    if (draft) {
      setFormData(JSON.parse(draft));
      setIsDirty(true);
    }
  }, []);

  const goToStep = (step: number) => {
    if (validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  return { currentStep, formData, setFormData, nextStep, prevStep, goToStep };
};
```

### EditOrderView State

```typescript
interface EditOrderFormState {
  // Existing order (read-only)
  orderId: string;
  currentItems: OrderItem[];
  currentTotal: number;
  
  // New items to add
  newItems: Array<{
    menuItemId: string;
    quantity: number;
    specialRequest?: string;
  }>;
}

const useEditOrderForm = (orderId: string) => {
  const { data: order } = useOrderById(orderId);
  const [newItems, setNewItems] = useState<NewItem[]>([]);

  const addNewItem = (item: NewItem) => {
    setNewItems(prev => [...prev, item]);
  };

  const removeNewItem = (index: number) => {
    setNewItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateNewTotal = () => {
    const newItemsTotal = newItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    return order.total + newItemsTotal;
  };

  return { order, newItems, addNewItem, removeNewItem, calculateNewTotal };
};
```

### React Query (Server State)

```typescript
// Query Keys
const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
    details: () => [...orderKeys.all, 'detail'] as const,
    detail: (id: number) => [...orderKeys.details(), id] as const,
};

// Queries
useOrders(filters) → Cache key: ['orders', 'list', filters]
useOrder(id) → Cache key: ['orders', 'detail', id]

// Mutations (with optimistic updates & navigation)
useCreateOrder() → Invalidate: ['orders', 'list'], Navigate to /orders/:id
useAddItems(id) → Invalidate: ['orders', 'detail', id], Navigate to /orders/:id
useCancelItem(id) → Invalidate: ['orders', 'detail', id]
useCancelOrder(id) → Invalidate: ['orders', 'list'], ['orders', 'detail', id], Navigate to /orders

// Refetch strategies
- List: refetchOnWindowFocus: true, staleTime: 30s
- Detail: refetchOnWindowFocus: true, staleTime: 10s
- Real-time: WebSocket triggers manual refetch via queryClient.invalidateQueries()
```

### WebSocket Integration with Pages

```typescript
// In OrderDetailView (/orders/[id])
const OrderDetailView = ({ orderId }: Props) => {
  const { data: order } = useOrderById(orderId);
  const queryClient = useQueryClient();

  useOrderWebSocket({
    onOrderUpdated: (data) => {
      if (data.id === orderId) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
        toast.success('Order updated');
      }
    },
    onItemsAdded: (data) => {
      if (data.orderId === orderId) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
        toast.success('Items added to order');
      }
    },
  });

  return <div>...</div>;
};

// In OrderListView (/orders)
const OrderListView = () => {
  const { data: orders } = useOrders(filters);
  const queryClient = useQueryClient();

  useOrderWebSocket({
    onOrderCreated: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onOrderUpdated: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });

  return <div>...</div>;
};
```

### Local State (Component State)

```typescript
// Multi-step wizard state (CreateOrderView)
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<CreateOrderFormState>({ ... });
const [isDirty, setIsDirty] = useState(false);

// Shopping cart state (CreateOrderView, EditOrderView)
const [cartItems, setCartItems] = useState<CartItem[]>([]);

// Dialog open/close state (confirmation dialogs only)
const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

// Form state (React Hook Form - for simple forms)
const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { ... }
});
```

## API Integration

### Service Layer (`services/order.service.ts`)

```typescript
import { apiClient } from '@/lib/axios';
import {
    Order,
    CreateOrderInput,
    AddItemsInput,
    OrderFilters,
    PaginatedOrders,
} from '../types';

export const orderApi = {
    async getAll(filters?: OrderFilters): Promise<PaginatedOrders> {
        const response = await apiClient.get('/orders', { params: filters });
        return response.data;
    },

    async getById(id: number): Promise<Order> {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data.data;
    },

    async create(data: CreateOrderInput): Promise<Order> {
        const response = await apiClient.post('/orders', data);
        return response.data.data;
    },

    async addItems(id: number, data: AddItemsInput): Promise<Order> {
        const response = await apiClient.patch(`/orders/${id}/items`, data);
        return response.data.data;
    },

    async cancelItem(
        orderId: number,
        itemId: number,
        reason: string
    ): Promise<Order> {
        const response = await apiClient.delete(
            `/orders/${orderId}/items/${itemId}`,
            { data: { reason } }
        );
        return response.data.data;
    },

    async cancelOrder(id: number, reason: string): Promise<Order> {
        const response = await apiClient.delete(`/orders/${id}`, {
            data: { reason },
        });
        return response.data.data;
    },

    async markItemServed(orderId: number, itemId: number): Promise<Order> {
        const response = await apiClient.patch(
            `/orders/${orderId}/items/${itemId}/serve`
        );
        return response.data.data;
    },
};
```

### Hooks Layer (`hooks/useOrders.ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../services';
import { orderKeys } from './query-keys';

export const useOrders = (filters?: OrderFilters) => {
    return useQuery({
        queryKey: orderKeys.list(filters || {}),
        queryFn: () => orderApi.getAll(filters),
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: orderApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries(orderKeys.lists());
            toast.success('Order created successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create order');
        },
    });
};
```

## Type Definitions

### Core Types (`types/order.types.ts`)

```typescript
export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    READY = 'ready',
    SERVING = 'serving',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum OrderItemStatus {
    PENDING = 'pending',
    READY = 'ready',
    SERVED = 'served',
    CANCELLED = 'cancelled',
}

export interface Order {
    orderId: number;
    orderNumber: string;
    tableId: number;
    table: {
        tableId: number;
        tableNumber: string;
        tableName: string | null;
    };
    staffId: number | null;
    staff: {
        staffId: number;
        fullName: string;
    } | null;
    customerName: string | null;
    customerPhone: string | null;
    partySize: number;
    status: OrderStatus;
    notes: string | null;
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    finalAmount: number;
    orderItems: OrderItem[];
    orderTime: string;
    confirmedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    orderItemId: number;
    orderId: number;
    itemId: number;
    menuItem: {
        itemId: number;
        itemName: string;
        imageUrl: string | null;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specialRequest: string | null;
    status: OrderItemStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderInput {
    tableId: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    partySize: number;
    notes?: string;
    items: {
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }[];
}

export interface OrderFilters {
    status?: OrderStatus;
    tableId?: number;
    staffId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrders {
    data: Order[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
```

## Validation Schemas (Zod)

```typescript
import { z } from 'zod';

export const createOrderItemSchema = z.object({
    itemId: z.number().positive(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    specialRequest: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
    tableId: z.number().positive(),
    reservationId: z.number().positive().optional(),
    customerName: z.string().max(255).optional(),
    customerPhone: z.string().regex(/^[0-9]{10}$/).optional(),
    partySize: z.number().min(1, 'Party size must be at least 1'),
    notes: z.string().max(1000).optional(),
    items: z
        .array(createOrderItemSchema)
        .min(1, 'At least one item is required'),
});

export const addItemsSchema = z.object({
    items: z
        .array(createOrderItemSchema)
        .min(1, 'At least one item is required'),
});

export const cancelItemSchema = z.object({
    reason: z.string().min(1, 'Reason is required').max(500),
});

export const cancelOrderSchema = z.object({
    reason: z.string().min(1, 'Reason is required').max(500),
});
```

## Performance Optimizations

### 1. Code Splitting
```typescript
// Lazy load pages (Next.js automatic code splitting)
// Pages are automatically split: /orders, /orders/new, /orders/[id], /orders/[id]/edit

// Lazy load dialogs (only load when opened)
const CancelItemDialog = lazy(() => import('./dialogs/CancelItemDialog'));
const CancelOrderDialog = lazy(() => import('./dialogs/CancelOrderDialog'));

// Lazy load heavy components
const MenuItemSelector = lazy(() => import('./components/MenuItemSelector'));
```

### 2. Memoization
```typescript
// Memoize expensive calculations
const totalAmount = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [orderItems]
);

// Memoize filtered/sorted data
const filteredOrders = useMemo(
    () => orders.filter((order) => /* filter logic */),
    [orders, filters]
);
```

### 3. Virtual Scrolling (if list is very long)
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
});
```

### 4. Optimistic Updates
```typescript
const { mutate } = useMutation({
    mutationFn: orderApi.markItemServed,
    onMutate: async ({ orderId, itemId }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(orderKeys.detail(orderId));

        // Snapshot previous value
        const previous = queryClient.getQueryData(orderKeys.detail(orderId));

        // Optimistically update
        queryClient.setQueryData(orderKeys.detail(orderId), (old) => ({
            ...old,
            orderItems: old.orderItems.map((item) =>
                item.orderItemId === itemId
                    ? { ...item, status: 'served' }
                    : item
            ),
        }));

        return { previous };
    },
    onError: (err, variables, context) => {
        // Rollback on error
        queryClient.setQueryData(
            orderKeys.detail(variables.orderId),
            context.previous
        );
    },
});
```

## Error Handling Strategy

```typescript
// Global error boundary for fatal errors
<ErrorBoundary fallback={<ErrorFallback />}>
    <OrderListView />
</ErrorBoundary>

// API error handling in hooks
const { data, error, isError } = useOrders(filters);

if (isError) {
    return <ErrorState error={error} retry={() => refetch()} />;
}

// Form validation errors
<FormField
    name="tableId"
    render={({ field, fieldState }) => (
        <>
            <Select {...field} />
            {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
            )}
        </>
    )}
/>

// Toast notifications for operation feedback
toast.error('Failed to create order. Please try again.');
toast.success('Order created successfully!');
```

## Accessibility Considerations

```typescript
// Keyboard navigation
<button
    onClick={handleAction}
    onKeyDown={(e) => e.key === 'Enter' && handleAction()}
    aria-label="Create new order"
/>

// Screen reader support
<div role="status" aria-live="polite">
    {loading ? 'Loading orders...' : `${orders.length} orders loaded`}
</div>

// Focus management (multi-step form)
useEffect(() => {
  // Focus first input when step changes
  const firstInput = document.querySelector(`[data-step="${currentStep}"] input, [data-step="${currentStep}"] select`);
  (firstInput as HTMLElement)?.focus();
}, [currentStep]);

// Focus management (dialogs)
<Dialog>
    <DialogContent onOpenAutoFocus={(e) => firstInputRef.current?.focus()}>
        ...
    </DialogContent>
</Dialog>

// ARIA labels
<button aria-label={`Cancel order ${order.orderNumber}`}>
    <X />
</button>

// Breadcrumb navigation for screen readers
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/orders">Orders</a></li>
    <li aria-current="page">New Order</li>
  </ol>
</nav>
```

## Testing Strategy

```typescript
// Unit tests (Vitest)
describe('orderApi', () => {
    it('should fetch orders with filters', async () => {
        const filters = { status: 'pending' };
        const result = await orderApi.getAll(filters);
        expect(result.data).toBeArray();
    });
});

// Component tests (React Testing Library)
describe('OrderCard', () => {
    it('should display order information', () => {
        render(<OrderCard order={mockOrder} />);
        expect(screen.getByText(mockOrder.orderNumber)).toBeInTheDocument();
    });
});

// Multi-step form tests
describe('CreateOrderView', () => {
    it('should navigate through steps', async () => {
        render(<CreateOrderView />);
        
        // Step 1: Select table
        const table = screen.getByRole('button', { name: /Table 1/ });
        await userEvent.click(table);
        await userEvent.click(screen.getByText('Next'));
        
        // Step 2: Enter customer info
        expect(screen.getByText('Customer Info')).toBeInTheDocument();
    });
    
    it('should preserve state when navigating back', async () => {
        render(<CreateOrderView />);
        
        // Select table in step 1
        await userEvent.click(screen.getByText('Table 1'));
        await userEvent.click(screen.getByText('Next'));
        
        // Go back
        await userEvent.click(screen.getByText('Back'));
        
        // Table selection should be preserved
        expect(screen.getByText('Table 1')).toHaveClass('selected');
    });
});

// Page navigation tests
describe('OrderListView', () => {
    it('should navigate to create order page', async () => {
        const router = useRouter();
        render(<OrderListView />);
        
        await userEvent.click(screen.getByText('New Order'));
        expect(router.push).toHaveBeenCalledWith('/orders/new');
    });
    
    it('should navigate to edit page', async () => {
        render(<OrderListView />);
        
        await userEvent.click(screen.getByRole('button', { name: /Add Items/ }));
        expect(router.push).toHaveBeenCalledWith('/orders/123/edit');
    });
});

// E2E tests (Playwright)
test('complete order creation flow', async ({ page }) => {
    await page.goto('/orders');
    
    // Navigate to create order page
    await page.click('text=New Order');
    expect(page.url()).toContain('/orders/new');
    
    // Step 1: Select table
    await page.click('[data-table-id="1"]');
    await page.click('text=Next');
    
    // Step 2: Enter customer info
    await page.fill('[name="partySize"]', '4');
    await page.click('text=Next');
    
    // Step 3: Add items
    await page.click('[data-menu-item="1"]');
    await page.click('text=Add to Order');
    await page.click('text=Next');
    
    // Step 4: Review and submit
    await page.click('text=Create Order');
    
    // Should navigate to order detail
    await page.waitForURL(/\/orders\/\d+$/);
    expect(await page.textContent('h1')).toContain('Order #');
});
```

---

This technical design provides a complete blueprint for implementing the Order Management Frontend module with best practices for React, TypeScript, and Next.js development.
