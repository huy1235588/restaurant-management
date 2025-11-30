# Kitchen Display System Module

## Overview

The Kitchen Display System (KDS) provides a real-time interface for kitchen staff to manage incoming orders, track preparation times, and communicate order readiness to waiters.

## Features

- **Real-time Order Queue**: WebSocket-based live updates for incoming orders
- **Priority-based Sorting**: Urgent → High → Normal → Low, then by creation time
- **Prep Time Tracking**: Auto-updating timers with color-coded performance indicators
- **Audio/Visual Notifications**: Sound alerts and browser notifications for new orders
- **One-tap Actions**: Quick buttons to start, mark ready, complete, or cancel orders
- **Responsive Design**: Optimized for kitchen tablets and monitors

## Module Structure

```
kitchen/
├── components/         # Reusable UI components
├── views/             # Page-level views
├── hooks/             # React Query hooks and custom hooks
├── services/          # API client services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
├── constants/         # Constants and configuration
└── README.md          # This file
```

## Usage

### Basic Integration

```typescript
import { KitchenDisplayView } from "@/modules/kitchen";

export default function KitchenPage() {
  return <KitchenDisplayView />;
}
```

### Using Hooks

```typescript
import { useKitchenOrders, useStartPreparing } from "@/modules/kitchen/hooks";

function MyComponent() {
  const { data: orders, isLoading } = useKitchenOrders();
  const startPreparing = useStartPreparing();

  const handleStart = (id: number) => {
    startPreparing.mutate(id);
  };

  // ...
}
```

## API Endpoints

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/kitchen/orders`                 | List all kitchen orders  |
| GET    | `/kitchen/orders/:id`             | Get order by ID          |
| PATCH  | `/kitchen/orders/:id/start`       | Start preparing order    |
| PATCH  | `/kitchen/orders/:id/ready`       | Mark order as ready      |
| PATCH  | `/kitchen/orders/:id/complete`    | Mark order as completed  |
| PATCH  | `/kitchen/orders/:id/cancel`      | Cancel kitchen order     |

## WebSocket Events

### Listening (Namespace: `/kitchen`)

- `order:new` - New order added to queue
- `order:update` - Order status updated
- `order:completed` - Order marked as completed

## Order Statuses

- **pending**: New order waiting for chef to start
- **ready**: Food is ready for pickup
- **completed**: Waiter has picked up the order
- **cancelled**: Order was cancelled

## Priority Levels

- **urgent** (weight: 4): VIP orders, complaints
- **high** (weight: 3): Large parties, time-sensitive
- **normal** (weight: 2): Standard orders (default)
- **low** (weight: 1): Pre-orders, non-urgent

## Configuration

Key configuration values in `constants/kitchen.constants.ts`:

- `REFETCH_INTERVAL`: 30s (polling fallback)
- `PREP_TIME_FAST`: < 10 minutes
- `PREP_TIME_SLOW`: > 30 minutes
- `WS_RECONNECTION_ATTEMPTS`: 5
- `DEFAULT_SOUND_VOLUME`: 0.8

## Permissions

- **kitchen.read**: Required to view kitchen orders
- **kitchen.write**: Required to update order status

## Development

### Running Tests

```bash
npm test kitchen
```

### Linting

```bash
npm run lint
```

## Performance Optimizations

- Optimistic UI updates for instant feedback
- Memoized filtered/sorted order lists
- Auto-update timers use efficient intervals
- Virtual scrolling for 50+ concurrent orders
- Code splitting for lazy-loaded components

## Accessibility

- Keyboard shortcuts (F5 refresh, F11 fullscreen)
- ARIA labels for screen readers
- High-contrast colors for kitchen environment
- Large touch targets (44x44px minimum)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- WebSocket support required
- Notification API support recommended

## Known Limitations

- Requires stable network connection for real-time updates
- Falls back to polling (30s) if WebSocket fails
- Audio notifications require user interaction to enable
- Maximum recommended concurrent orders: 50

## Future Enhancements

- Multi-station kitchen support (grill, salad, dessert)
- Dish-level tracking within orders
- Chef performance metrics dashboard
- Voice notifications
- Kitchen printer integration

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
