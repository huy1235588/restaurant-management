# Category Management Specification

## ADDED Requirements

### Requirement: Category List Display
The system SHALL display category list with filtering and sorting capabilities to allow users to view and organize categories efficiently.

#### Scenario: Manager views all active categories

**Given** the manager is authenticated and has access to menu management

**When** they navigate to `/menu/categories`

**Then** the system displays a list of all categories with `isActive = true`

**And** each category shows:
- Category name
- Description (truncated if long)
- Thumbnail image or placeholder
- Number of menu items in category
- Status indicator (active/inactive)
- Display order
- Created/updated timestamps
- Action buttons (Edit, Delete, View Items)

**And** categories are sorted by `displayOrder` ascending by default

---

#### Scenario: Manager filters categories by active status

**Given** the manager is viewing the category list

**When** they select "Show Inactive" from the status filter

**Then** the system displays categories with `isActive = false`

**And** inactive categories are visually distinguished (e.g., grayed out or labeled)

---

#### Scenario: Manager searches categories by name

**Given** the manager is viewing the category list

**When** they enter "Dessert" in the search field

**Then** the system filters categories where `categoryName` contains "Dessert" (case-insensitive)

**And** the list updates in real-time as they type (debounced by 300ms)

---

#### Scenario: Manager sorts categories by creation date

**Given** the manager is viewing the category list

**When** they select "Sort by: Newest First" from the sort dropdown

**Then** categories are reordered by `createdAt` descending

**And** the sort preference is saved in browser local storage

---

### Requirement: Create New Category

The system SHALL allow users to create new categories with validation including mandatory and optional fields and image upload.

#### Scenario: Manager creates a valid category

**Given** the manager is on the category list page

**When** they click "Add New Category" button

**Then** a modal/form opens with fields:
- Category Name (required, max 100 chars)
- Description (optional, max 500 chars)
- Display Order (number, default 0)
- Status (Active/Inactive toggle, default Active)
- Image Upload (optional, max 5MB, JPG/PNG/WebP)

**When** they fill in:
- Category Name: "Appetizers"
- Description: "Start your meal with these delicious starters"
- Display Order: 1
- Status: Active
- Upload image: appetizers.jpg

**And** click "Save"

**Then** the system validates all fields

**And** uploads the image to storage service

**And** sends POST request to `/categories` with:
```json
{
  "categoryName": "Appetizers",
  "description": "Start your meal with these delicious starters",
  "displayOrder": 1,
  "isActive": true,
  "imageUrl": "https://storage.../appetizers.jpg"
}
```

**And** on success, displays "Category created successfully" toast

**And** closes the form

**And** refreshes the category list showing the new category

---

#### Scenario: Manager attempts to create duplicate category

**Given** a category "Appetizers" already exists

**When** the manager tries to create another category with name "Appetizers"

**And** submits the form

**Then** the backend returns 400 error "Category name already exists"

**And** the form displays error message under the Category Name field

**And** the form remains open for correction

---

#### Scenario: Manager uploads invalid image format

**Given** the manager is creating a new category

**When** they upload a file "menu.pdf"

**Then** the system validates file type client-side

**And** displays error "Only JPG, PNG, and WebP images are allowed"

**And** prevents form submission

---

#### Scenario: Manager uploads oversized image

**Given** the manager is creating a new category

**When** they upload an image larger than 5MB

**Then** the system validates file size client-side

**And** displays error "Image must be less than 5MB"

**And** prevents form submission

---

### Requirement: Update Existing Category

The system SHALL allow users to update existing categories including modifying all fields and replacing category images.

#### Scenario: Manager updates category description

**Given** a category "Appetizers" exists with ID 5

**When** the manager clicks "Edit" button on the category

**Then** a form opens pre-filled with current values:
- Category Name: "Appetizers"
- Description: "Start your meal with these delicious starters"
- Display Order: 1
- Status: Active
- Current Image: (displayed as thumbnail)

**When** they change Description to "Light bites to whet your appetite"

**And** click "Save"

**Then** the system sends PUT request to `/categories/5` with updated data

**And** on success, displays "Category updated successfully" toast

**And** the category list refreshes showing updated description

---

#### Scenario: Manager replaces category image

**Given** the manager is editing category "Appetizers"

**And** the category has existing image "old-appetizers.jpg"

**When** they upload new image "new-appetizers.jpg"

**Then** the system shows preview of new image

**When** they click "Save"

**Then** the system uploads new image to storage

**And** sends PUT request with new `imageUrl`

**And** the old image is replaced in the database

**Note**: Old image cleanup on storage is handled by backend

---

#### Scenario: Manager updates display order

**Given** the manager wants to reorder categories

**When** they edit "Desserts" category and change Display Order from 3 to 1

**And** save changes

**Then** the system updates the category

**And** the category list re-sorts automatically

**And** "Desserts" appears at position 1 in the list

---

### Requirement: Delete Category with Safety Checks

The system SHALL allow users to delete categories with validation to prevent data inconsistency and ensure referential integrity.

#### Scenario: Manager deletes empty category

**Given** a category "Seasonal Items" exists with 0 menu items

**When** the manager clicks "Delete" button

**Then** a confirmation dialog appears: "Are you sure you want to delete 'Seasonal Items'? This action cannot be undone."

**When** they confirm

**Then** the system sends DELETE request to `/categories/:id`

**And** on success (204 No Content), displays "Category deleted successfully" toast

**And** removes the category from the list

---

#### Scenario: Manager attempts to delete category with items

**Given** a category "Main Course" has 15 menu items

**When** the manager clicks "Delete" button

**Then** a warning dialog appears: "Cannot delete 'Main Course' because it contains 15 menu items. Please move or delete all items first."

**And** the delete action is blocked

**Note**: Backend enforces this with foreign key constraint (onDelete: Restrict)

---

#### Scenario: Manager cancels category deletion

**Given** the manager clicks "Delete" on a category

**When** the confirmation dialog appears

**And** they click "Cancel"

**Then** the dialog closes

**And** no API request is sent

**And** the category remains in the list

---

### Requirement: View Category Details

The system SHALL allow users to view complete category information and all associated menu items within that category.

#### Scenario: Manager views category details

**Given** a category "Beverages" exists with ID 8

**When** the manager clicks "View Details" or clicks on the category card

**Then** the system navigates to `/menu/categories/8`

**And** displays full category information:
- Large category image
- Category name
- Full description
- Status (Active/Inactive)
- Display order
- Created date
- Last updated date
- Number of items

**And** displays a list of all menu items with `categoryId = 8`

**And** items show: name, price, availability, image thumbnail

---

#### Scenario: Manager navigates to edit from details view

**Given** the manager is viewing category details

**When** they click "Edit Category" button

**Then** the edit form opens with current values

---

### Requirement: Toggle Category Active Status

The system SHALL allow users to quickly activate or deactivate categories without opening the full edit form.

#### Scenario: Manager deactivates a category

**Given** a category "Summer Specials" has `isActive = true`

**When** the manager clicks the status toggle switch

**Then** the system sends PATCH request to update `isActive = false`

**And** displays "Category deactivated" toast

**And** the category is visually marked as inactive

**And** associated menu items remain in database but category is hidden from customer-facing menus

---

#### Scenario: Manager reactivates a category

**Given** a category has `isActive = false`

**When** the manager clicks the status toggle switch

**Then** the system updates `isActive = true`

**And** displays "Category activated" toast

**And** the category becomes visible again

---

### Requirement: Category Statistics Display

The system SHALL display aggregate statistics about categories to aid management decisions.

#### Scenario: Manager views category statistics dashboard

**Given** the manager is on the category list page

**Then** the system displays statistics cards at the top:
- Total Categories: (count of all categories)
- Active Categories: (count where `isActive = true`)
- Inactive Categories: (count where `isActive = false`)
- Total Menu Items: (sum of items across all categories)

---

#### Scenario: Statistics update after category changes

**Given** the statistics show "Total Categories: 8"

**When** the manager creates a new category

**Then** the statistics card updates to "Total Categories: 9"

**And** "Active Categories" increments by 1

---

### Requirement: Handle Empty States

The system SHALL provide helpful guidance when no categories exist or search returns no results.

#### Scenario: Manager views empty category list

**Given** no categories exist in the system

**When** the manager navigates to category list

**Then** an empty state illustration is displayed

**And** shows message: "No categories yet. Create your first category to organize your menu."

**And** displays prominent "Add New Category" button

---

#### Scenario: No results from search

**Given** the manager searches for "Pizza"

**And** no categories match the search

**Then** displays empty state: "No categories found matching 'Pizza'"

**And** shows "Clear Search" button

---

### Requirement: Responsive Design for Mobile

The system SHALL provide responsive category management interface that adapts to different screen sizes including mobile and tablet devices.

#### Scenario: Manager uses category management on mobile

**Given** the manager accesses category list on a mobile device (< 640px width)

**Then** categories display in single-column layout

**And** action buttons are reorganized for touch targets (minimum 44x44px)

**And** images are optimized for mobile bandwidth

**And** filters collapse into a slide-out drawer

---

#### Scenario: Manager uses category management on tablet

**Given** the manager accesses on tablet (640px - 1024px)

**Then** categories display in 2-column grid

**And** filters remain visible in sidebar

**And** all features remain accessible

---

## Related Capabilities

- **menu-management**: Menu items depend on categories via foreign key relationship
- **dashboard-navigation**: Category management is accessed from main dashboard menu
