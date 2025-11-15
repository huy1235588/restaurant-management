# Menu Management Specification

## ADDED Requirements

### Requirement: Display Menu Items in Multiple View Modes

The system SHALL display menu items in multiple view modes (grid, list, table) optimized for different tasks and user preferences.

#### Scenario: Manager views menu items in grid mode (default)

**Given** the manager is authenticated and navigates to `/menu`

**Then** the system displays menu items in a grid layout (3-4 columns on desktop)

**And** each card shows:
- Item image or placeholder (aspect ratio 4:3)
- Item name
- Category badge
- Price (formatted as currency)
- Availability status indicator (green dot if available)
- Quick action buttons (Edit, Delete, Toggle Availability)

**And** items are paginated (20 per page)

**And** the view mode button shows "Grid" as active

---

#### Scenario: Manager switches to list view

**Given** the manager is viewing menu items in grid mode

**When** they click the "List View" button

**Then** items display in a compact list layout (one item per row)

**And** each row shows:
- Small thumbnail image (64x64px)
- Item name and code
- Category name
- Price
- Availability toggle switch
- Preparation time
- Action buttons (Edit, Delete, View Details)

**And** the view preference is saved to localStorage

**And** more items fit on screen compared to grid view

---

#### Scenario: Manager switches to table view

**Given** the manager is viewing menu items

**When** they click "Table View" button

**Then** items display in a data table with columns:
- ID
- Code
- Name
- Category
- Price
- Cost
- Margin (calculated)
- Availability
- Status
- Actions

**And** columns are sortable (click header to sort)

**And** the table supports horizontal scrolling on mobile

---

#### Scenario: View preference persists across sessions

**Given** the manager selected "List View" in previous session

**When** they return to the menu page

**Then** the system loads list view automatically

**And** retrieves preference from localStorage key: `menu-view-mode`

---

### Requirement: Search and Filter Menu Items

The system SHALL allow users to search and filter menu items using multiple criteria including name, category, availability, price range, and dietary attributes.

#### Scenario: Manager searches by item name

**Given** the manager is viewing menu items

**When** they type "Chicken" in the search box

**Then** the system sends GET request to `/menu?search=Chicken` (debounced 300ms)

**And** displays items where `itemName` contains "Chicken" (case-insensitive)

**And** also searches in `description` and `itemCode` fields

**And** shows "X results for 'Chicken'" message

---

#### Scenario: Manager filters by category

**Given** the manager is viewing all menu items

**When** they select "Main Course" from category dropdown

**Then** the system filters to show only items with matching `categoryId`

**And** updates URL to `/menu?categoryId=3`

**And** the filter remains active when navigating back

---

#### Scenario: Manager filters by availability

**Given** the manager wants to see out-of-stock items

**When** they select "Out of Stock" from availability filter

**Then** the system displays items where `isAvailable = false`

**And** these items are visually distinct (e.g., grayed out, "Out of Stock" badge)

---

#### Scenario: Manager applies multiple filters

**Given** the manager wants to find vegetarian appetizers under 100k VND

**When** they set filters:
- Category: "Appetizers"
- Vegetarian: Yes
- Price Range: "Under 100,000"

**Then** the system sends request: `/menu?categoryId=1&isVegetarian=true&maxPrice=100000`

**And** displays items matching ALL criteria (AND logic)

**And** shows active filter chips above results

**And** each chip has an X button to remove individual filter

---

#### Scenario: Manager clears all filters

**Given** multiple filters are active

**When** the manager clicks "Clear All Filters" button

**Then** all filters reset to default values

**And** the system displays all items (paginated)

**And** URL updates to `/menu` without query parameters

---

#### Scenario: Manager filters by spicy level

**Given** the manager is viewing menu items

**When** they select "Medium Spicy (3-4)" from spicy level filter

**Then** items with `spicyLevel IN (3, 4)` are displayed

**And** spicy level is shown on each item card with chili pepper icons

---

#### Scenario: Manager filters by preparation time

**Given** the manager wants quick-serve items

**When** they select "Quick (<15 min)" from preparation time filter

**Then** items with `preparationTime < 15` are displayed

**And** preparation time is shown on item cards

---

### Requirement: Create New Menu Item

The system SHALL allow users to create new menu items with comprehensive fields including basic information, pricing, details, status, and image upload.

#### Scenario: Manager creates a complete menu item

**Given** the manager is on the menu items page

**When** they click "Add New Dish" button

**Then** a form modal opens with sections:

**Basic Information:**
- Item Code (required, unique, max 20 chars, auto-generated suggestion)
- Item Name (required, max 100 chars)
- Category (required, dropdown of active categories)
- Description (optional, max 1000 chars, rich text)

**Pricing:**
- Price (required, number, min 0)
- Cost (optional, number, min 0)
- Margin % (calculated: (price-cost)/price * 100, read-only display)

**Details:**
- Preparation Time (optional, number in minutes)
- Spicy Level (optional, 0-5 scale)
- Calories (optional, number)
- Is Vegetarian (checkbox, default false)

**Status:**
- Is Available (toggle, default true)
- Is Active (toggle, default true)
- Display Order (number, default 0)

**Media:**
- Image Upload (optional, max 5MB, JPG/PNG/WebP, with preview)

**When** the manager fills in:
```json
{
  "itemCode": "MC-001",
  "itemName": "Grilled Salmon",
  "categoryId": 3,
  "description": "Fresh Atlantic salmon grilled to perfection with herbs",
  "price": 250000,
  "cost": 120000,
  "preparationTime": 20,
  "spicyLevel": 0,
  "calories": 450,
  "isVegetarian": false,
  "isAvailable": true,
  "isActive": true,
  "displayOrder": 10,
  "imageUrl": "https://storage.../salmon.jpg"
}
```

**And** clicks "Save"

**Then** the system validates all fields with Zod schema

**And** sends POST request to `/menu`

**And** on success (201 Created), displays "Menu item created successfully" toast

**And** navigates to menu list or shows the new item details

---

#### Scenario: Manager creates item with auto-generated code

**Given** the manager is creating a new menu item

**When** the form loads

**Then** the Item Code field shows a suggested code based on category (e.g., "AP-001" for Appetizers)

**And** the manager can accept or modify this code

**And** uniqueness is validated on submit

---

#### Scenario: Manager uploads menu item image

**Given** the manager is creating a menu item

**When** they click "Upload Image" or drag-and-drop an image

**Then** the system validates file (type, size) client-side

**And** shows upload progress bar

**And** uploads to `/storage/upload` with folder: "menu-items"

**And** on success, displays image preview

**And** stores returned URL in form state

**And** if form is cancelled, no orphaned image remains (handled by cleanup job)

---

#### Scenario: Form validation prevents submission

**Given** the manager is creating a menu item

**When** they leave Item Name empty

**And** attempt to submit

**Then** the form displays error "Item name is required" under the field

**And** the field is highlighted in red

**And** submit button remains disabled until fixed

**And** no API request is sent

---

#### Scenario: Manager receives backend validation error

**Given** the manager submits a menu item with code "MC-001"

**And** that code already exists

**Then** the backend returns 400 error

**And** the form displays "Item code already exists. Please use a unique code."

**And** the form remains open for correction

---

### Requirement: Update Existing Menu Item

The system SHALL allow users to update all fields of existing menu items including pricing, details, category, and images.

#### Scenario: Manager updates menu item price

**Given** a menu item "Grilled Salmon" exists with price 250,000 VND

**When** the manager clicks "Edit" on the item

**Then** the edit form opens pre-filled with current values

**When** they change Price to 275,000 VND

**And** click "Save"

**Then** the system sends PUT request to `/menu/:id` with all fields

**And** on success, displays "Menu item updated successfully" toast

**And** the item list refreshes showing new price

---

#### Scenario: Manager updates multiple fields simultaneously

**Given** the manager is editing "Grilled Salmon"

**When** they update:
- Price: 275,000 → 280,000
- Preparation Time: 20 → 25
- Description: (add "Served with seasonal vegetables")
- Replace image with new photo

**And** save changes

**Then** all fields are updated in a single API call

**And** the updated item reflects all changes

---

#### Scenario: Manager changes item category

**Given** a menu item is in category "Appetizers"

**When** the manager edits the item and changes category to "Main Course"

**And** saves

**Then** the item's `categoryId` is updated

**And** the item appears under "Main Course" in filtered views

**And** statistics for both categories update accordingly

---

### Requirement: Toggle Menu Item Availability

The system SHALL allow users to quickly toggle menu item availability status without opening the full edit form.

#### Scenario: Manager marks item as unavailable

**Given** a menu item "Grilled Salmon" has `isAvailable = true`

**When** the manager clicks the availability toggle switch on the item card

**Then** the system sends PATCH request to `/menu/:id/availability` with `{ isAvailable: false }`

**And** displays "Item marked as unavailable" toast

**And** the item is visually marked (grayed out, "Out of Stock" badge)

**And** the toggle updates instantly (optimistic update)

**And** if API call fails, the toggle reverts and shows error toast

---

#### Scenario: Manager makes item available again

**Given** an item is marked unavailable

**When** the manager toggles availability on

**Then** the system updates `isAvailable = true`

**And** displays "Item is now available" toast

**And** visual indicators are removed

---

#### Scenario: Bulk availability toggle

**Given** the manager selects multiple items using checkboxes

**When** they click "Mark as Unavailable" from bulk actions

**Then** the system sends batch PATCH request for all selected items

**And** updates all items' availability

**And** displays "X items marked as unavailable" toast

---

### Requirement: Delete Menu Item

The system SHALL allow users to delete menu items with confirmation dialogs and safety measures to prevent accidental deletion and maintain data integrity.

#### Scenario: Manager deletes menu item not in orders

**Given** a menu item "Test Dish" exists

**And** it has never been ordered (no order_items records)

**When** the manager clicks "Delete" button

**Then** a confirmation dialog appears: "Are you sure you want to delete 'Test Dish'? This action cannot be undone."

**When** they confirm

**Then** the system sends DELETE request to `/menu/:id`

**And** on success (204), displays "Menu item deleted successfully" toast

**And** removes item from the list

---

#### Scenario: Manager attempts to delete item with order history

**Given** a menu item "Popular Dish" has been ordered (order_items exist)

**When** the manager clicks "Delete"

**Then** a warning dialog appears: "Cannot delete 'Popular Dish' because it exists in order history. You can mark it as Inactive instead."

**And** provides button "Mark as Inactive"

**And** the delete action is blocked

**Note**: Backend enforces with foreign key constraint (onDelete: Restrict)

---

#### Scenario: Manager cancels deletion

**Given** the manager clicks "Delete" on an item

**When** the confirmation dialog appears

**And** they click "Cancel"

**Then** the dialog closes without sending API request

**And** the item remains in the list

---

### Requirement: View Menu Item Details

The system SHALL allow users to view comprehensive menu item information including all attributes, pricing, status, and metadata.

#### Scenario: Manager views menu item details page

**Given** a menu item with ID 42 exists

**When** the manager clicks on the item card or "View Details"

**Then** the system navigates to `/menu/42`

**And** displays comprehensive item information:
- Large image (or placeholder)
- Item code and name
- Category name (linked)
- Full description
- Price and cost (with margin calculation)
- All attributes (spicy level, vegetarian, calories)
- Preparation time
- Display order
- Availability and active status
- Created date and updated date
- Metadata (created by, last updated by - if tracked)

**And** shows action buttons: "Edit", "Delete", "Duplicate"

---

#### Scenario: Manager duplicates menu item

**Given** the manager is viewing item details

**When** they click "Duplicate" button

**Then** the create form opens pre-filled with current item data

**And** Item Code is cleared (must be unique)

**And** Item Name has " (Copy)" appended

**And** all other fields match the original

**When** they save

**Then** a new menu item is created with new ID

---

### Requirement: Menu Statistics Dashboard

The system SHALL display aggregate statistics about menu items including totals, availability counts, and new items.

#### Scenario: Manager views menu statistics

**Given** the manager is on the menu items page

**Then** statistics cards display at the top:
- Total Dishes: (count of all menu items)
- Available: (count where `isAvailable = true`)
- Out of Stock: (count where `isAvailable = false`)
- New This Month: (count where `createdAt` is in current month)

---

#### Scenario: Statistics update in real-time

**Given** statistics show "Total Dishes: 85"

**When** the manager creates a new item

**Then** statistics update to "Total Dishes: 86"

**And** "Available" increments by 1 (if item is available)

**And** "New This Month" increments by 1

---

### Requirement: Sort Menu Items

The system SHALL allow users to sort menu items by various criteria including price, name, date created, and display order.

#### Scenario: Manager sorts by price ascending

**Given** the manager is viewing menu items

**When** they select "Sort by: Price (Low to High)"

**Then** items reorder with lowest price first

**And** URL updates to `/menu?sortBy=price&sortOrder=asc`

---

#### Scenario: Manager sorts by name alphabetically

**Given** menu items are displayed

**When** the manager selects "Sort by: Name (A-Z)"

**Then** items reorder alphabetically by `itemName`

**And** Vietnamese characters are sorted correctly (e.g., "Bún" before "Cơm")

---

#### Scenario: Manager sorts by newest first

**Given** the manager wants to see recently added items

**When** they select "Sort by: Newest First"

**Then** items reorder by `createdAt` descending

**And** most recently created items appear first

---

#### Scenario: Manager sorts by display order

**Given** the manager wants to see menu in presentation order

**When** they select "Sort by: Display Order"

**Then** items reorder by `displayOrder` ascending

**And** this is useful for arranging printed menu order

---

### Requirement: Pagination for Large Datasets

The system SHALL provide pagination for efficient handling of large menu item collections with configurable page sizes.

#### Scenario: Manager navigates paginated results

**Given** the restaurant has 150 menu items

**And** page size is 20 items

**Then** page 1 displays items 1-20

**And** pagination controls show: [< Prev] [1] [2] [3] [4] [5] [Next >]

**When** the manager clicks page 3

**Then** URL updates to `/menu?page=3`

**And** items 41-60 are displayed

**And** pagination controls highlight page 3

---

#### Scenario: Manager changes page size

**Given** the manager is viewing 20 items per page

**When** they select "Show 50 per page" from page size dropdown

**Then** the list displays 50 items

**And** pagination controls recalculate total pages

**And** preference is saved to localStorage

---

### Requirement: Responsive Design for Mobile

The system SHALL provide responsive menu management interface optimized for mobile and tablet devices with touch-friendly controls.

#### Scenario: Manager uses menu management on mobile

**Given** the manager accesses `/menu` on mobile device (< 640px)

**Then** items display in single-column list (forced list view)

**And** search and filters collapse into slide-out drawer

**And** action buttons are touch-optimized (44x44px minimum)

**And** images are lazy-loaded and optimized for bandwidth

**And** FAB (Floating Action Button) appears for "Add New Dish"

---

#### Scenario: Manager edits item on mobile

**Given** the manager is on mobile

**When** they edit a menu item

**Then** the form displays in full-screen modal

**And** inputs are large enough for touch

**And** image upload supports camera capture (if available)

**And** keyboard appears with numeric keypad for price fields

---

### Requirement: Handle Empty and Error States

The system SHALL provide helpful feedback and recovery options for empty states and error conditions.

#### Scenario: No menu items exist

**Given** no menu items are in the database

**When** the manager navigates to menu page

**Then** displays empty state illustration

**And** shows message: "No menu items yet. Create your first dish to get started."

**And** displays prominent "Add New Dish" button

---

#### Scenario: Search returns no results

**Given** the manager searches for "Sushi"

**And** no items match

**Then** displays empty state: "No menu items found matching 'Sushi'"

**And** shows "Clear Search" button

**And** suggests: "Try different keywords or browse all items"

---

#### Scenario: API request fails

**Given** the manager is viewing menu items

**When** the API request to `/menu` fails (network error or 500)

**Then** displays error state with message: "Failed to load menu items. Please try again."

**And** shows "Retry" button

**And** logs error for debugging

---

### Requirement: Loading States for Async Operations

The system SHALL provide visual feedback during asynchronous operations including skeleton screens and loading indicators.

#### Scenario: Initial page load shows skeleton

**Given** the manager navigates to menu page

**When** data is being fetched

**Then** skeleton cards are displayed matching the layout

**And** skeleton includes placeholders for: image, title, price, buttons

**And** skeleton count matches page size (e.g., 20 skeletons)

---

#### Scenario: Search shows loading overlay

**Given** the manager types in search box

**When** debounce completes and API request is sent

**Then** a subtle loading spinner appears next to search input

**And** existing results remain visible (no flash)

**And** when results return, list updates smoothly

---

#### Scenario: Form submission shows loading

**Given** the manager submits create/edit form

**Then** submit button shows loading spinner

**And** button text changes to "Saving..."

**And** form inputs become disabled

**And** user cannot resubmit while loading

---

### Requirement: Keyboard Navigation and Accessibility

The system SHALL provide full keyboard navigation support and screen reader compatibility for accessible menu management.

#### Scenario: Manager navigates menu list with keyboard

**Given** the manager is on menu page

**When** they press Tab key

**Then** focus moves through interactive elements in logical order:
1. Search input
2. Filter dropdowns
3. View mode buttons
4. First menu item card
5. Action buttons on card
6. Next item card
7. Pagination controls

**And** focus is clearly visible (outline or highlight)

---

#### Scenario: Manager uses keyboard shortcuts

**Given** the manager is on menu page

**When** they press "N" key

**Then** "Add New Dish" modal opens (if shortcut enabled)

**When** they press "F" key

**Then** focus moves to search/filter input

**When** they press "/" key

**Then** search input is focused

---

#### Scenario: Screen reader announces item count

**Given** a screen reader user loads menu page

**Then** screen reader announces: "Menu items page. 85 items found. Grid view selected."

**When** they navigate to an item

**Then** screen reader announces: "Grilled Salmon, Main Course, 250,000 Vietnamese Dong, Available, Edit button, Delete button"

---

### Requirement: Form Autosave

The system SHALL provide automatic form data persistence to prevent data loss during menu item creation and editing.

#### Scenario: Form data persists on accidental close

**Given** the manager is creating a menu item

**And** has filled in multiple fields

**When** they accidentally close the browser tab

**And** reopen the create form within 24 hours

**Then** the system restores form data from localStorage

**And** displays message: "We restored your unsaved changes. Click here to clear."

---

#### Scenario: Manager clears autosaved data

**Given** autosaved form data exists

**When** the manager clicks "Clear draft" or successfully submits form

**Then** localStorage draft is removed

---

## Related Capabilities

- **category-management**: Menu items belong to categories via `categoryId` foreign key
- **order-management**: Menu items are ordered through order_items table
- **kitchen-management**: Menu items display in kitchen orders with preparation details
- **dashboard-navigation**: Menu management is accessed from main dashboard
