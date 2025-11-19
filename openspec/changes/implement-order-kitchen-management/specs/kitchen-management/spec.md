# Kitchen Management Specification

## ADDED Requirements

### Requirement: Kitchen Order Reception
The system SHALL automatically receive orders from waiters in real-time and display them on the Kitchen Display System (KDS).

#### Scenario: Receive new order from waiter
- **WHEN** waiter sends order to kitchen (status changes to CONFIRMED)
- **THEN** system receives "order:confirmed" WebSocket event
- **AND** creates kitchen_order record with status PENDING
- **AND** displays order on KDS in "Waiting" section
- **AND** plays audio notification sound
- **AND** shows popup "New Order - Table X"

#### Scenario: Receive order with priority
- **WHEN** order has VIP or EXPRESS priority
- **THEN** system displays priority badge prominently
- **AND** sorts order to top of waiting list
- **AND** plays distinct audio alert for priority orders

#### Scenario: Receive order with special requests
- **WHEN** order contains items with special requests
- **THEN** system highlights special requests in yellow background
- **AND** displays requests in larger font
- **AND** ensures requests are visible without scrolling

#### Scenario: Auto-calculate prep time estimate
- **WHEN** kitchen receives new order
- **THEN** system sums prep times from menu items
- **AND** adds buffer time based on order size
- **AND** displays estimated total prep time
- **AND** starts countdown timer

### Requirement: Kitchen Display System Layout
The system SHALL provide a large-screen interface optimized for kitchen environment with clear visibility and minimal interaction.

#### Scenario: Display KDS dashboard
- **WHEN** chef accesses kitchen display
- **THEN** system displays fullscreen KDS layout
- **AND** shows statistics cards (orders waiting, in progress, ready)
- **AND** displays tab navigation (Waiting, Cooking, Ready)
- **AND** shows order cards in grid layout (3 columns on desktop)
- **AND** updates display every 5 seconds automatically

#### Scenario: Sort orders by priority and age
- **WHEN** KDS displays order list
- **THEN** system sorts by priority first (VIP > EXPRESS > NORMAL)
- **AND** within same priority, sorts by oldest first
- **AND** displays wait time prominently on each card

#### Scenario: Highlight overdue orders
- **WHEN** order wait time exceeds 20 minutes
- **THEN** system changes card border to red
- **AND** displays "OVERDUE" badge
- **AND** plays periodic alert sound every 5 minutes
- **AND** moves order to top of its priority group

#### Scenario: Filter orders by status
- **WHEN** chef clicks "Waiting" tab
- **THEN** system displays only orders with status PENDING or CONFIRMED
- **WHEN** chef clicks "Cooking" tab
- **THEN** system displays only orders with status PREPARING
- **WHEN** chef clicks "Ready" tab
- **THEN** system displays only orders with status READY

#### Scenario: Search orders on KDS
- **WHEN** chef enters order number or table number in search
- **THEN** system filters displayed orders to matches
- **AND** highlights matching text in cards
- **AND** shows count of filtered results

### Requirement: Order Card Display
The system SHALL display comprehensive order information on each kitchen card for easy reading from distance.

#### Scenario: Display order header
- **WHEN** order card rendered
- **THEN** system displays order number in large font
- **AND** shows table number
- **AND** displays priority badge if not NORMAL
- **AND** shows elapsed time since order created (auto-updating)

#### Scenario: Display order items
- **WHEN** order card rendered
- **THEN** system lists all items with quantities
- **AND** displays special requests per item in yellow
- **AND** shows checkbox for each item (for marking ready)
- **AND** indicates which items are ready with checkmark

#### Scenario: Display assigned chef
- **WHEN** order assigned to chef
- **THEN** system displays chef name on card
- **AND** shows chef's avatar or initials

#### Scenario: Display station assignment
- **WHEN** order assigned to station (e.g., GRILL)
- **THEN** system displays station badge
- **AND** color-codes card by station type

#### Scenario: Display timer
- **WHEN** order is in PREPARING status
- **THEN** system displays countdown timer
- **AND** shows progress bar (green <10min, yellow 10-20min, red >20min)
- **AND** updates every second

### Requirement: Chef Order Acknowledgment
The system SHALL allow chefs to acknowledge receipt of orders and start preparation.

#### Scenario: Start cooking order
- **WHEN** chef clicks "Start Cooking" on PENDING order
- **THEN** system displays confirmation dialog
- **AND** prompts chef to select their name (if multiple chefs)
- **WHEN** chef confirms
- **THEN** system changes kitchen_order status to PREPARING
- **AND** records startedAt timestamp
- **AND** updates order status to PREPARING
- **AND** moves card to "Cooking" tab
- **AND** starts prep time timer
- **AND** notifies waiter "Order #123 is being prepared"

#### Scenario: Multiple chefs start cooking
- **WHEN** multiple chefs present in kitchen
- **AND** chef clicks "Start Cooking"
- **THEN** system shows chef selection dropdown
- **AND** displays current workload per chef
- **AND** suggests least busy chef
- **WHEN** chef selected
- **THEN** system assigns order to that chef

#### Scenario: Cannot start already cooking order
- **WHEN** chef tries to start order already in PREPARING status
- **THEN** system prevents action
- **AND** displays message "Order already being prepared by [Chef Name]"

### Requirement: Item Status Tracking
The system SHALL allow chefs to update cooking status of individual items within an order.

#### Scenario: Mark item as preparing
- **WHEN** chef clicks checkbox next to item
- **AND** item status is PENDING
- **THEN** system changes item status to PREPARING
- **AND** displays partial checkmark or progress indicator

#### Scenario: Mark item as ready
- **WHEN** chef clicks checkbox next to item
- **AND** item status is PREPARING
- **THEN** system changes item status to READY
- **AND** displays full checkmark
- **AND** emits "kitchen:item_ready" event
- **AND** notifies waiter "Steak ready on Order #123"

#### Scenario: All items ready
- **WHEN** all items in order marked READY
- **THEN** system automatically enables "Mark Order Ready" button
- **AND** highlights button in green
- **AND** suggests chef to complete order

#### Scenario: Update progress percentage
- **WHEN** items marked ready
- **THEN** system calculates percentage (ready items / total items)
- **AND** displays progress bar on card
- **AND** shows percentage number (e.g., "75% complete")

### Requirement: Order Completion
The system SHALL allow chefs to mark orders as ready for pickup when all items are prepared.

#### Scenario: Complete order successfully
- **WHEN** chef clicks "Mark Ready" button
- **AND** all items have status READY
- **THEN** system displays confirmation dialog
- **AND** shows actual prep time vs estimated
- **WHEN** chef confirms
- **THEN** system changes kitchen_order status to READY
- **AND** records completedAt timestamp
- **AND** calculates actual prep time (completedAt - startedAt)
- **AND** updates order status to READY
- **AND** moves card to "Ready" tab
- **AND** emits "kitchen:order_ready" event
- **AND** sends notification to waiter with audio alert

#### Scenario: Cannot complete partial order
- **WHEN** chef tries to mark order ready
- **AND** some items still PENDING or PREPARING
- **THEN** system prevents completion
- **AND** displays message "All items must be ready before completing order"
- **AND** highlights incomplete items

#### Scenario: Waiter picks up order
- **WHEN** waiter confirms pickup (changes order to SERVING)
- **THEN** system changes kitchen_order status to COMPLETED
- **AND** removes order from KDS display after 30 seconds
- **AND** archives order for reporting

#### Scenario: Display completed orders briefly
- **WHEN** order marked READY
- **THEN** system keeps order visible on "Ready" tab
- **AND** displays "Awaiting Pickup" status
- **WHEN** 30 seconds elapsed and not picked up
- **THEN** system flashes card to alert kitchen
- **AND** plays reminder sound
- **WHEN** picked up
- **THEN** system removes card from display

### Requirement: Order Cancellation from Kitchen
The system SHALL allow chefs to cancel orders when preparation is not possible.

#### Scenario: Kitchen-initiated cancellation
- **WHEN** chef clicks "Cancel" on order
- **THEN** system displays cancellation dialog
- **AND** prompts for reason (out of ingredients, equipment failure, dish failed)
- **WHEN** chef provides reason and confirms
- **THEN** system changes kitchen_order status to CANCELLED
- **AND** updates order status to CANCELLED
- **AND** records cancellation reason and timestamp
- **AND** removes order from KDS
- **AND** emits "kitchen:order_cancelled" event
- **AND** notifies waiter immediately with reason

#### Scenario: Handle waiter cancellation request
- **WHEN** system receives "order:cancel_request" event
- **THEN** system displays modal on KDS
- **AND** shows order details and cancellation reason
- **AND** prompts chef to Accept or Reject
- **WHEN** chef clicks Accept
- **THEN** system cancels order as above
- **AND** emits "kitchen:cancel_accepted" event
- **WHEN** chef clicks Reject
- **THEN** system maintains current status
- **AND** prompts for rejection reason
- **AND** emits "kitchen:cancel_rejected" event with reason

#### Scenario: Cannot cancel completed order
- **WHEN** order status is READY or COMPLETED
- **AND** chef tries to cancel
- **THEN** system prevents cancellation
- **AND** displays message "Cannot cancel order already ready/completed"

### Requirement: Chef Assignment
The system SHALL allow assignment of orders to specific chefs or stations for workload management.

#### Scenario: Assign order to chef
- **WHEN** manager clicks "Assign Chef" on order
- **THEN** system displays chef selection dialog
- **AND** lists all active kitchen staff
- **AND** shows current workload for each (number of orders assigned)
- **WHEN** chef selected
- **THEN** system assigns order to chef
- **AND** displays chef name on order card
- **AND** records assignment in database

#### Scenario: Assign order to station
- **WHEN** manager clicks "Assign Station" on order
- **THEN** system displays station selection
- **AND** lists available stations (GRILL, FRY, STEAM, DESSERT, DRINKS)
- **AND** shows current orders at each station
- **WHEN** station selected
- **THEN** system assigns order to station
- **AND** color-codes card by station
- **AND** filters station's orders on that workstation display

#### Scenario: Auto-assign by item type
- **WHEN** order contains only grilled items
- **THEN** system suggests GRILL station
- **WHEN** order contains mixed item types
- **THEN** system creates virtual split (items routed to appropriate stations)
- **AND** tracks completion across stations

#### Scenario: Reassign order
- **WHEN** order already assigned to chef/station
- **AND** manager reassigns to different chef/station
- **THEN** system updates assignment
- **AND** notifies original assignee
- **AND** notifies new assignee

### Requirement: Priority Management
The system SHALL handle order prioritization based on VIP, EXPRESS, or NORMAL levels.

#### Scenario: Display VIP order
- **WHEN** order has VIP priority
- **THEN** system displays gold crown badge (👑)
- **AND** sorts order to top of list
- **AND** highlights card border in gold
- **AND** plays special VIP notification sound

#### Scenario: Display EXPRESS order
- **WHEN** order has EXPRESS priority
- **THEN** system displays red urgent badge (🔴)
- **AND** sorts order above NORMAL but below VIP
- **AND** highlights card border in red
- **AND** displays "RUSH" label

#### Scenario: Display NORMAL order
- **WHEN** order has NORMAL priority
- **THEN** system displays no priority badge (or white circle ⚪)
- **AND** sorts by oldest first within NORMAL group

#### Scenario: Change priority
- **WHEN** manager updates order priority (e.g., NORMAL → VIP)
- **THEN** system updates kitchen_order priority
- **AND** re-sorts order in display
- **AND** updates card styling
- **AND** notifies kitchen with priority change alert

### Requirement: Kitchen Timer and Alerts
The system SHALL track preparation time and alert kitchen staff of delays.

#### Scenario: Display elapsed time
- **WHEN** order displayed on KDS
- **THEN** system shows time since order created
- **AND** updates every second
- **AND** formats as "X minutes ago" or "HH:MM elapsed"

#### Scenario: Color-coded timer
- **WHEN** elapsed time < 10 minutes
- **THEN** system displays timer in green
- **WHEN** elapsed time 10-20 minutes
- **THEN** system displays timer in yellow
- **WHEN** elapsed time > 20 minutes
- **THEN** system displays timer in red
- **AND** plays alert sound
- **AND** displays "OVERDUE" badge

#### Scenario: Prep time comparison
- **WHEN** order completed
- **THEN** system displays actual prep time vs estimated
- **AND** highlights if over/under estimate
- **AND** calculates variance percentage
- **AND** records for performance analysis

#### Scenario: Alert on overdue
- **WHEN** order becomes overdue (>20 min)
- **THEN** system plays alert sound immediately
- **AND** displays desktop notification if browser supports
- **AND** repeats alert every 5 minutes until addressed

#### Scenario: Mute alerts
- **WHEN** chef toggles mute in KDS settings
- **THEN** system disables audio alerts
- **AND** continues visual alerts (red borders, badges)
- **AND** saves mute preference for session

### Requirement: Kitchen Performance Reports
The system SHALL provide performance metrics for kitchen operations and chef efficiency.

#### Scenario: View kitchen dashboard metrics
- **WHEN** manager accesses kitchen performance report
- **THEN** system displays total orders received today
- **AND** shows completion rate percentage
- **AND** displays average prep time
- **AND** shows count of overdue orders
- **AND** displays fastest and slowest prep times

#### Scenario: View chef performance
- **WHEN** manager views "Chef Performance" report
- **THEN** system lists each chef's statistics
- **AND** shows orders completed per chef
- **AND** calculates average prep time per chef
- **AND** displays overdue count per chef
- **AND** shows accuracy rate (actual vs estimated time)

#### Scenario: View item prep time analysis
- **WHEN** manager views "Item Prep Time" report
- **THEN** system lists all menu items
- **AND** shows average actual prep time per item
- **AND** compares to configured estimated time
- **AND** identifies items consistently over/under estimate
- **AND** suggests prep time adjustments

#### Scenario: View station workload
- **WHEN** manager views "Station Workload" report
- **THEN** system displays order count per station
- **AND** shows average prep time per station
- **AND** identifies bottleneck stations (slowest)
- **AND** suggests workload rebalancing

#### Scenario: Export kitchen reports
- **WHEN** manager clicks "Export" on report
- **THEN** system generates CSV with data
- **AND** includes all metrics and time periods
- **AND** downloads file to device

### Requirement: Kitchen Order Validation
The system SHALL validate kitchen operations to ensure data integrity and workflow compliance.

#### Scenario: Validate status transitions
- **WHEN** kitchen updates order status
- **THEN** system validates transition is allowed
- **AND** prevents skipping steps (e.g., PENDING → READY)
- **AND** logs invalid attempts

#### Scenario: Validate chef assignment
- **WHEN** order assigned to chef
- **THEN** system checks chef has "chef" role
- **AND** checks chef is currently active
- **AND** prevents assignment to inactive users

#### Scenario: Validate completion requirements
- **WHEN** chef tries to complete order
- **THEN** system checks all items marked READY
- **AND** prevents completion if items pending
- **AND** displays list of incomplete items

#### Scenario: Validate cancellation permissions
- **WHEN** user tries to cancel order
- **THEN** system checks user has chef or manager role
- **AND** prevents cancellation by unauthorized users
- **AND** logs cancellation attempts

### Requirement: Kitchen WebSocket Integration
The system SHALL communicate with Order Management in real-time via WebSocket events.

#### Scenario: Emit status change event
- **WHEN** kitchen updates order status
- **THEN** system emits "kitchen:status_changed" event
- **AND** includes order ID, old status, new status
- **AND** waiter receives update immediately

#### Scenario: Emit item ready event
- **WHEN** chef marks item ready
- **THEN** system emits "kitchen:item_ready" event
- **AND** includes order ID, item ID, item name
- **AND** waiter sees item status update

#### Scenario: Emit order ready event
- **WHEN** chef completes order
- **THEN** system emits "kitchen:order_ready" event
- **AND** includes order number, table, actual prep time
- **AND** waiter receives audio notification

#### Scenario: Listen for order events
- **WHEN** waiter creates or modifies order
- **THEN** kitchen receives WebSocket event
- **AND** updates KDS display immediately
- **AND** plays notification sound

#### Scenario: Handle connection loss
- **WHEN** WebSocket connection drops
- **THEN** system displays "Disconnected" warning banner
- **AND** attempts reconnection with exponential backoff
- **AND** queues events during disconnect
- **AND** replays queued events on reconnect
- **AND** refreshes KDS data from API

### Requirement: Kitchen Display Settings
The system SHALL provide configuration options for kitchen display preferences.

#### Scenario: Configure display layout
- **WHEN** chef accesses KDS settings
- **THEN** system shows layout options (grid columns, card size)
- **AND** allows toggling statistics cards
- **AND** allows customizing tab visibility
- **WHEN** settings saved
- **THEN** system applies immediately without refresh

#### Scenario: Configure audio settings
- **WHEN** chef accesses audio settings
- **THEN** system shows volume slider (0-100%)
- **AND** allows selecting notification sounds
- **AND** allows testing sounds
- **AND** provides mute toggle
- **WHEN** settings saved
- **THEN** system applies immediately

#### Scenario: Configure timer thresholds
- **WHEN** manager configures alert thresholds
- **THEN** system allows setting warning time (default 10 min)
- **AND** allows setting overdue time (default 20 min)
- **AND** previews color coding
- **WHEN** saved
- **THEN** system applies to all future orders

#### Scenario: Configure auto-refresh
- **WHEN** settings accessed
- **THEN** system shows refresh interval slider (5-60 seconds)
- **AND** allows disabling auto-refresh
- **WHEN** saved
- **THEN** system adjusts refresh timer

### Requirement: Kitchen Station Management
The system SHALL support creation and management of kitchen workstations.

#### Scenario: Create kitchen station
- **WHEN** manager creates new station
- **AND** provides name and type (GRILL, FRY, STEAM, DESSERT, DRINKS)
- **THEN** system creates station record
- **AND** makes station available for order assignment

#### Scenario: View station list
- **WHEN** manager views stations
- **THEN** system displays all stations
- **AND** shows station type and name
- **AND** displays active/inactive status
- **AND** shows current order count per station

#### Scenario: Deactivate station
- **WHEN** manager deactivates station
- **THEN** system sets isActive to false
- **AND** prevents new order assignments
- **AND** maintains existing assigned orders
- **AND** displays "Inactive" badge

#### Scenario: Filter KDS by station
- **WHEN** chef selects station filter
- **THEN** system displays only orders assigned to that station
- **AND** updates statistics for filtered view
