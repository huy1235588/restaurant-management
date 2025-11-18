# Kitchen Display System Specification

## ADDED Requirements

### Requirement: Full-Screen Kitchen Display Interface
The system SHALL provide dedicated full-screen kitchen display interface optimized for large monitors and touchscreen operation in kitchen environment.

#### Scenario: Display KDS in full-screen mode
- **WHEN** chef opens kitchen display page
- **THEN** system displays full-screen kanban layout with three columns (Pending, In Progress, Ready) showing all active kitchen orders

#### Scenario: Show order cards with essential information
- **WHEN** order is displayed on KDS
- **THEN** card shows order number, table number, priority badge, elapsed time, items list with special requests highlighted, and action buttons

#### Scenario: Auto-refresh order display
- **WHEN** new order arrives or status changes
- **THEN** system updates display in real-time without page refresh via WebSocket

#### Scenario: Display statistics summary
- **WHEN** chef views KDS header
- **THEN** system shows count of orders in each status (Pending: 12, In Progress: 8, Ready: 5) with average wait times

#### Scenario: Scale UI for kitchen environment
- **WHEN** KDS is displayed on large monitor (32"+) or tablet
- **THEN** system renders with large fonts, high contrast colors, and touch-friendly button sizes (min 44px)

### Requirement: Multi-Priority Order System
The system SHALL implement three-level priority system with automatic prioritization based on wait time and manual priority flags.

#### Scenario: Display VIP priority orders
- **WHEN** order is marked as VIP priority
- **THEN** system displays order with gold badge (👑), moves to top of queue, and highlights with gold border

#### Scenario: Display Express priority orders
- **WHEN** order is marked as Express or wait time exceeds 20 minutes
- **THEN** system displays order with red badge (🔴), sorts above normal priority, and plays alert sound

#### Scenario: Auto-escalate long-waiting orders
- **WHEN** pending order wait time exceeds 20 minutes
- **THEN** system automatically changes priority to Express, moves to top of queue, and sends escalation notification

#### Scenario: Sort orders by priority and age
- **WHEN** multiple orders are in same column
- **THEN** system sorts by priority (VIP > Express > Normal) then by age (oldest first within same priority)

#### Scenario: Flash priority indicator for critical orders
- **WHEN** Express order waits more than 25 minutes
- **THEN** system animates order card with pulsing red border and plays continuous alert sound

### Requirement: Chef Assignment and Workload Management
The system SHALL enable chef assignment to orders and display workload distribution across kitchen team.

#### Scenario: Assign chef when accepting order
- **WHEN** chef clicks "Start Preparing" on pending order
- **THEN** system prompts to select chef from dropdown showing current workload (e.g., "Chef Hai - 3 orders, 8 items") and assigns selected chef

#### Scenario: Display chef workload dashboard
- **WHEN** manager views KDS settings or workload tab
- **THEN** system shows each chef with assigned orders count, total items, and average prep time

#### Scenario: Suggest chef for balanced workload
- **WHEN** assigning order to chef
- **THEN** system highlights chef with lowest current workload as suggested assignment

#### Scenario: Filter orders by assigned chef
- **WHEN** chef selects personal filter on KDS
- **THEN** system displays only orders assigned to that chef

#### Scenario: Reassign order to different chef
- **WHEN** manager reassigns order from one chef to another
- **THEN** system updates assignment, notifies both chefs, and updates workload counters

### Requirement: Workstation Management
The system SHALL support multiple kitchen workstations with station-specific order filtering and displays.

#### Scenario: Create kitchen workstations
- **WHEN** admin configures workstations (Grill, Fryer, Steamer, Dessert)
- **THEN** system saves station definitions with menu item type mappings

#### Scenario: Auto-route orders to stations
- **WHEN** order contains items mapped to specific station (e.g., grilled items → Grill station)
- **THEN** system displays order on that station's KDS view and hides from other stations

#### Scenario: Filter KDS by workstation
- **WHEN** chef selects workstation filter (e.g., "Grill")
- **THEN** system displays only orders containing items for that workstation

#### Scenario: Display cross-station dependencies
- **WHEN** order has items from multiple stations
- **THEN** system shows order on all relevant station displays with items highlighted per station

#### Scenario: Track station performance
- **WHEN** manager views station analytics
- **THEN** system shows prep times, throughput, and delays per workstation

### Requirement: Item-Level Status Tracking
The system SHALL track and display preparation status for individual items within orders with independent timers.

#### Scenario: Display item status checkboxes
- **WHEN** chef views order in "In Progress" column
- **THEN** each item shows checkbox and status dropdown (Preparing, Almost Ready, Ready) with individual elapsed timer

#### Scenario: Update single item status
- **WHEN** chef marks item as ready while other items still preparing
- **THEN** system updates that item status, shows checkmark, and maintains order in "In Progress" until all items ready

#### Scenario: Track individual item prep times
- **WHEN** item status changes from Preparing to Ready
- **THEN** system records actual prep time for that specific item for analytics

#### Scenario: Auto-complete order when all items ready
- **WHEN** last item in order is marked ready
- **THEN** system automatically moves entire order to "Ready" column and sends waiter notification

#### Scenario: Show prep progress percentage
- **WHEN** chef views order with mixed item statuses
- **THEN** system displays progress bar showing percentage of items completed (e.g., "2/4 items ready - 50%")

### Requirement: Real-Time Preparation Timers
The system SHALL display and update elapsed time timers for all active orders and items in real-time.

#### Scenario: Display order elapsed time
- **WHEN** order is displayed on KDS
- **THEN** system shows elapsed time since order creation updating every second (e.g., "⏱ 5 min 23 sec")

#### Scenario: Show estimated vs actual time
- **WHEN** order is in progress
- **THEN** system displays estimated prep time vs actual elapsed with progress bar (e.g., "8/15 min - 53%")

#### Scenario: Color-code timer by status
- **WHEN** elapsed time approaches or exceeds estimated time
- **THEN** system changes timer color (green < 80%, yellow 80-100%, red > 100% of estimated)

#### Scenario: Track time from acceptance to completion
- **WHEN** chef accepts order
- **THEN** system starts prep timer from acceptance time (not order creation) for accurate kitchen performance tracking

#### Scenario: Display average prep time per dish type
- **WHEN** chef views item details
- **THEN** system shows historical average prep time for that item to set expectations

### Requirement: Batch Cooking Suggestions
The system SHALL analyze pending orders and suggest grouping similar items for batch preparation efficiency.

#### Scenario: Detect batch cooking opportunities
- **WHEN** multiple pending orders contain same item
- **THEN** system displays batch suggestion badge (e.g., "3x Beef Steak across orders #001, #003, #005")

#### Scenario: Group items for batch cooking
- **WHEN** chef clicks batch suggestion
- **THEN** system displays grouped view showing all orders requiring same item with option to start batch

#### Scenario: Track batch cooking progress
- **WHEN** chef starts batch cooking multiple instances of same item
- **THEN** system links all instances to single batch tracking timer

#### Scenario: Distribute completed batch items
- **WHEN** batch cooking completes
- **THEN** system marks all linked items as ready across multiple orders

#### Scenario: Calculate batch efficiency savings
- **WHEN** manager views batch analytics
- **THEN** system shows time saved by batch cooking vs individual preparation

### Requirement: Audio and Visual Notification System
The system SHALL provide configurable multi-channel notification system for kitchen events with sound alerts and visual indicators.

#### Scenario: Play sound alert for new orders
- **WHEN** new order arrives in kitchen
- **THEN** system plays notification sound (bell chime) at configured volume and flashes "NEW ORDER" banner

#### Scenario: Play escalation alert for overdue orders
- **WHEN** order wait time exceeds 25 minutes
- **THEN** system plays continuous alert sound (urgent beep every 5 seconds) until acknowledged

#### Scenario: Configure notification preferences
- **WHEN** chef accesses notification settings
- **THEN** system allows enabling/disabling sound, adjusting volume (0-10 scale), selecting sound type, and setting mute duration

#### Scenario: Mute notifications temporarily
- **WHEN** chef clicks "Mute" button
- **THEN** system silences all sounds for configurable duration (5/10/15/30 minutes) and shows mute indicator

#### Scenario: Visual-only mode for noisy environments
- **WHEN** kitchen is too noisy for sound alerts
- **THEN** system provides visual-only mode with screen flash, border animation, and badge notifications

### Requirement: Keyboard Shortcuts for Hands-Free Operation
The system SHALL support comprehensive keyboard shortcuts to enable hands-free navigation and actions without touching screen.

#### Scenario: Navigate orders with arrow keys
- **WHEN** chef presses up/down arrow keys
- **THEN** system moves selection highlight between visible orders

#### Scenario: Start preparing with keyboard
- **WHEN** chef presses "S" key while order selected
- **THEN** system moves order to "In Progress" and prompts for chef assignment

#### Scenario: Mark order ready with keyboard
- **WHEN** chef presses "R" key while order in progress
- **THEN** system marks all items ready and moves order to "Ready" column

#### Scenario: Access help overlay
- **WHEN** chef presses "H" key
- **THEN** system displays keyboard shortcut reference overlay

#### Scenario: Quick filter by priority
- **WHEN** chef presses number keys 1-3
- **THEN** system filters display (1=VIP only, 2=Express only, 3=Normal only, 0=show all)

### Requirement: Order Cancellation Handling
The system SHALL display and manage order/item cancellation requests from waitstaff with approval workflow.

#### Scenario: Receive cancellation request notification
- **WHEN** waiter requests item cancellation
- **THEN** system displays prominent popup on KDS with order details, item to cancel, cancellation reason, and approve/reject buttons

#### Scenario: Approve cancellation if not started
- **WHEN** chef approves cancellation for item not yet started
- **THEN** system removes item from order, notifies waiter of approval, and recalculates order completion

#### Scenario: Reject cancellation if already prepared
- **WHEN** chef rejects cancellation because item already cooked
- **THEN** system notifies waiter of rejection with reason and keeps item in order

#### Scenario: Partial order cancellation
- **WHEN** some items cancelled while others remain
- **THEN** system updates order display showing cancelled items as strikethrough and continues prep on remaining items

#### Scenario: Log cancellation decisions
- **WHEN** chef approves or rejects cancellation
- **THEN** system records decision with timestamp, chef ID, and reason for reporting

### Requirement: Kitchen Performance Analytics
The system SHALL provide comprehensive analytics dashboard for kitchen performance monitoring and optimization.

#### Scenario: Display daily kitchen metrics
- **WHEN** manager accesses kitchen analytics
- **THEN** system shows total orders, completion rate, average prep time, overdue count, and cancellation rate for selected period

#### Scenario: Show chef performance comparison
- **WHEN** manager views chef analytics
- **THEN** system displays table comparing each chef's orders completed, average prep time, delays, and efficiency rating

#### Scenario: Analyze prep time by dish
- **WHEN** manager views dish analytics
- **THEN** system shows each menu item with order count, average prep time, min/max times, and trend chart

#### Scenario: Track peak hour performance
- **WHEN** manager selects time analysis
- **THEN** system displays hourly breakdown of order volume, wait times, and delays to identify bottlenecks

#### Scenario: Generate kitchen performance report
- **WHEN** manager clicks export report
- **THEN** system generates PDF or CSV with comprehensive kitchen metrics for selected date range

### Requirement: Search and Filter Capabilities
The system SHALL provide advanced search and filtering to help chefs quickly locate specific orders on busy displays.

#### Scenario: Search by order number
- **WHEN** chef enters order number in search field
- **THEN** system highlights matching order and scrolls to its position

#### Scenario: Search by table number
- **WHEN** chef enters table number
- **THEN** system filters display to show only orders for that table

#### Scenario: Filter by priority level
- **WHEN** chef selects priority filter (VIP, Express, Normal)
- **THEN** system shows only orders matching selected priority level

#### Scenario: Filter by assigned chef
- **WHEN** chef selects "My Orders" filter
- **THEN** system shows only orders assigned to current logged-in chef

#### Scenario: Combine multiple filters
- **WHEN** chef applies multiple filters (e.g., Express + My Orders)
- **THEN** system shows orders matching all filter criteria with AND logic

### Requirement: Drag-and-Drop Order Management
The system SHALL support drag-and-drop interaction to move orders between status columns intuitively.

#### Scenario: Drag order to In Progress
- **WHEN** chef drags order card from Pending to In Progress column
- **THEN** system prompts for chef assignment, updates status to PREPARING, and starts timer

#### Scenario: Drag order to Ready
- **WHEN** chef drags order from In Progress to Ready column
- **THEN** system validates all items ready, updates status, and sends waiter notification

#### Scenario: Prevent invalid status transitions
- **WHEN** chef attempts to drag order from Ready back to Pending
- **THEN** system rejects drop, returns order to original position, and displays error message

#### Scenario: Reorder within same column
- **WHEN** chef drags order within same column
- **THEN** system allows manual reordering for custom prioritization

#### Scenario: Touch-friendly drag interaction
- **WHEN** using touchscreen device
- **THEN** system supports long-press to initiate drag with visual feedback and larger drop targets

### Requirement: Special Request Highlighting
The system SHALL prominently display and emphasize special requests and dietary notes to prevent errors.

#### Scenario: Highlight special requests with icons
- **WHEN** order contains items with special requests (e.g., "no onions", "less spicy")
- **THEN** system displays requests in bold red text with warning icons (🚫, 🌶️, ⚠️)

#### Scenario: Show allergen warnings
- **WHEN** item has allergen-related special request
- **THEN** system displays with red background and allergen symbol for maximum visibility

#### Scenario: Confirm special request acknowledgment
- **WHEN** chef starts preparing order with special requests
- **THEN** system requires checkbox confirmation that special requests were noted

#### Scenario: Display prep instructions for modifications
- **WHEN** item has complex modification request
- **THEN** system shows expanded view with step-by-step instructions for modification

### Requirement: Multi-Device Synchronization
The system SHALL synchronize KDS state across multiple displays and devices in real-time for consistent kitchen view.

#### Scenario: Sync status changes across devices
- **WHEN** chef updates order status on one KDS display
- **THEN** all other connected KDS displays update immediately via WebSocket

#### Scenario: Show active users indicator
- **WHEN** multiple chefs are logged into KDS
- **THEN** system displays count of active users and their names in header

#### Scenario: Handle concurrent status updates
- **WHEN** two chefs update same order simultaneously
- **THEN** system uses last-write-wins with notification to both chefs about concurrent update

#### Scenario: Recover from connection loss
- **WHEN** KDS loses network connection
- **THEN** system displays offline indicator, queues local changes, and syncs when reconnected

### Requirement: Prep Time Configuration and Learning
The system SHALL use configured prep times for estimates and learn from actual times to improve accuracy.

#### Scenario: Use menu item prep time for estimate
- **WHEN** order arrives with items having defined prep times
- **THEN** system calculates total estimated prep time by summing item prep times and displays on order card

#### Scenario: Adjust estimates based on order complexity
- **WHEN** order contains many items or special requests
- **THEN** system adds complexity multiplier (10-30%) to estimated prep time

#### Scenario: Learn from actual prep times
- **WHEN** orders are completed
- **THEN** system tracks actual vs estimated prep time and adjusts future estimates using weighted average

#### Scenario: Display prep time accuracy
- **WHEN** chef views kitchen analytics
- **THEN** system shows estimate accuracy percentage (e.g., "Estimates within 20% accuracy: 85% of orders")

### Requirement: Emergency Override and Manual Controls
The system SHALL provide manager override capabilities for exceptional situations requiring immediate intervention.

#### Scenario: Manager force-completes stuck order
- **WHEN** manager activates emergency override and force-completes order
- **THEN** system moves order to Ready, logs override action with reason, and notifies relevant staff

#### Scenario: Manager clears overdue alerts
- **WHEN** manager acknowledges known delays (e.g., equipment failure)
- **THEN** system silences alerts for specified orders until resolved

#### Scenario: Manager manually reorders priority
- **WHEN** manager drags orders to custom positions overriding automatic sorting
- **THEN** system maintains manual order until manager resets or orders complete

#### Scenario: Emergency kitchen reset
- **WHEN** manager triggers emergency reset (system error recovery)
- **THEN** system reloads all orders from database, re-syncs state, and logs reset event

### Requirement: Accessibility and Internationalization
The system SHALL support accessibility features and multiple languages for diverse kitchen staff.

#### Scenario: Support high contrast mode
- **WHEN** chef enables high contrast mode
- **THEN** system increases contrast ratio to WCAG AAA standard (7:1) for better visibility in bright kitchen lighting

#### Scenario: Adjust text size
- **WHEN** chef changes text size setting
- **THEN** system scales all text (small/normal/large/extra large) while maintaining layout

#### Scenario: Support Vietnamese and English
- **WHEN** chef selects language preference
- **THEN** system displays all UI text, labels, and status names in selected language

#### Scenario: Keyboard-only navigation
- **WHEN** chef navigates using only keyboard (Tab, Arrow keys, Enter)
- **THEN** system provides full functionality without mouse/touch input

### Requirement: Print and Export Capabilities
The system SHALL support printing kitchen tickets and exporting order data for documentation and training.

#### Scenario: Print kitchen ticket on demand
- **WHEN** chef clicks print button on order
- **THEN** system sends formatted ticket to configured kitchen printer with items, special requests, and priority

#### Scenario: Auto-print on order arrival
- **WHEN** new order arrives and auto-print enabled
- **THEN** system automatically prints kitchen ticket as backup to digital display

#### Scenario: Export daily kitchen log
- **WHEN** manager exports daily kitchen log
- **THEN** system generates CSV with all orders, prep times, chef assignments, and delays for record keeping

#### Scenario: Screenshot for training
- **WHEN** trainer takes screenshot of KDS
- **THEN** system captures anonymized version suitable for training materials
