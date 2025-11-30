## ADDED Requirements

### Requirement: Menu RBAC Protection
The system SHALL restrict menu item create, update, and delete operations to users with admin or manager roles only.

#### Scenario: Admin creates menu item
- **WHEN** an authenticated user with admin role sends POST request to `/menu`
- **THEN** the system SHALL allow the operation and create the menu item

#### Scenario: Manager creates menu item
- **WHEN** an authenticated user with manager role sends POST request to `/menu`
- **THEN** the system SHALL allow the operation and create the menu item

#### Scenario: Waiter attempts to create menu item
- **WHEN** an authenticated user with waiter role sends POST request to `/menu`
- **THEN** the system SHALL return 403 Forbidden response
- **AND** the menu item SHALL NOT be created

#### Scenario: Chef attempts to delete menu item
- **WHEN** an authenticated user with chef role sends DELETE request to `/menu/:id`
- **THEN** the system SHALL return 403 Forbidden response

---

### Requirement: Category RBAC Protection
The system SHALL restrict category create, update, and delete operations to users with admin or manager roles only.

#### Scenario: Manager updates category
- **WHEN** an authenticated user with manager role sends PUT request to `/categories/:id`
- **THEN** the system SHALL allow the operation and update the category

#### Scenario: Waiter attempts to delete category
- **WHEN** an authenticated user with waiter role sends DELETE request to `/categories/:id`
- **THEN** the system SHALL return 403 Forbidden response

---

### Requirement: Staff RBAC Protection
The system SHALL restrict staff management operations based on role hierarchy where admin has full access, manager has limited access, and other roles can only view their own information.

#### Scenario: Admin creates staff
- **WHEN** an authenticated user with admin role sends POST request to `/staff`
- **THEN** the system SHALL allow the operation and create the staff record

#### Scenario: Manager attempts to create staff
- **WHEN** an authenticated user with manager role sends POST request to `/staff`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Admin changes staff role
- **WHEN** an authenticated user with admin role sends PATCH request to `/staff/:id/role`
- **THEN** the system SHALL allow the operation and update the role

#### Scenario: Manager attempts to change staff role
- **WHEN** an authenticated user with manager role sends PATCH request to `/staff/:id/role`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Manager deactivates staff
- **WHEN** an authenticated user with manager role sends PATCH request to `/staff/:id/deactivate`
- **THEN** the system SHALL allow the operation

#### Scenario: Waiter views staff list
- **WHEN** an authenticated user with waiter role sends GET request to `/staff`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Waiter views own staff profile
- **WHEN** an authenticated user with waiter role sends GET request to `/staff/:id` where id matches their own staffId
- **THEN** the system SHALL allow the operation and return their profile

---

### Requirement: Table RBAC Protection
The system SHALL restrict table create, update, and delete operations to users with admin or manager roles only.

#### Scenario: Manager creates table
- **WHEN** an authenticated user with manager role sends POST request to `/tables`
- **THEN** the system SHALL allow the operation and create the table

#### Scenario: Chef attempts to create table
- **WHEN** an authenticated user with chef role sends POST request to `/tables`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Waiter views tables
- **WHEN** an authenticated user with waiter role sends GET request to `/tables`
- **THEN** the system SHALL allow the operation and return the table list

---

### Requirement: Order RBAC Protection
The system SHALL restrict order creation to admin, manager, and waiter roles, and order status updates to admin and manager roles only.

#### Scenario: Waiter creates order
- **WHEN** an authenticated user with waiter role sends POST request to `/orders`
- **THEN** the system SHALL allow the operation and create the order

#### Scenario: Chef attempts to create order
- **WHEN** an authenticated user with chef role sends POST request to `/orders`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Waiter adds items to order
- **WHEN** an authenticated user with waiter role sends PATCH request to `/orders/:id/items`
- **THEN** the system SHALL allow the operation

#### Scenario: Cashier attempts to add items to order
- **WHEN** an authenticated user with cashier role sends PATCH request to `/orders/:id/items`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Manager cancels order
- **WHEN** an authenticated user with manager role sends DELETE request to `/orders/:id`
- **THEN** the system SHALL allow the operation and cancel the order

#### Scenario: Waiter attempts to cancel order
- **WHEN** an authenticated user with waiter role sends DELETE request to `/orders/:id`
- **THEN** the system SHALL return 403 Forbidden response

---

### Requirement: Kitchen RBAC Protection
The system SHALL restrict kitchen order status updates to admin, manager, and chef roles only.

#### Scenario: Chef updates kitchen order status
- **WHEN** an authenticated user with chef role sends PATCH request to `/kitchen/:id/status`
- **THEN** the system SHALL allow the operation and update the status

#### Scenario: Waiter views kitchen orders
- **WHEN** an authenticated user with waiter role sends GET request to `/kitchen`
- **THEN** the system SHALL allow the operation and return kitchen orders

#### Scenario: Waiter attempts to update kitchen order status
- **WHEN** an authenticated user with waiter role sends PATCH request to `/kitchen/:id/status`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Cashier attempts to view kitchen orders
- **WHEN** an authenticated user with cashier role sends GET request to `/kitchen`
- **THEN** the system SHALL return 403 Forbidden response

---

### Requirement: Billing RBAC Protection
The system SHALL restrict billing operations based on role where payment processing requires cashier role or higher, and discount application requires manager role or higher.

#### Scenario: Cashier creates bill
- **WHEN** an authenticated user with cashier role sends POST request to `/bills`
- **THEN** the system SHALL allow the operation and create the bill

#### Scenario: Waiter creates bill
- **WHEN** an authenticated user with waiter role sends POST request to `/bills`
- **THEN** the system SHALL allow the operation and create the bill

#### Scenario: Chef attempts to create bill
- **WHEN** an authenticated user with chef role sends POST request to `/bills`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Manager applies discount
- **WHEN** an authenticated user with manager role sends PATCH request to `/bills/:id/discount`
- **THEN** the system SHALL allow the operation and apply the discount

#### Scenario: Cashier attempts to apply discount
- **WHEN** an authenticated user with cashier role sends PATCH request to `/bills/:id/discount`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Cashier processes payment
- **WHEN** an authenticated user with cashier role sends POST request to `/bills/:id/payment`
- **THEN** the system SHALL allow the operation and process the payment

#### Scenario: Waiter attempts to process payment
- **WHEN** an authenticated user with waiter role sends POST request to `/bills/:id/payment`
- **THEN** the system SHALL return 403 Forbidden response

---

### Requirement: Reservation RBAC Protection
The system SHALL restrict reservation creation to admin, manager, and waiter roles, and deletion to admin and manager roles only.

#### Scenario: Waiter creates reservation
- **WHEN** an authenticated user with waiter role sends POST request to `/reservations`
- **THEN** the system SHALL allow the operation and create the reservation

#### Scenario: Chef attempts to create reservation
- **WHEN** an authenticated user with chef role sends POST request to `/reservations`
- **THEN** the system SHALL return 403 Forbidden response

#### Scenario: Manager deletes reservation
- **WHEN** an authenticated user with manager role sends DELETE request to `/reservations/:id`
- **THEN** the system SHALL allow the operation and delete the reservation

#### Scenario: Waiter attempts to delete reservation
- **WHEN** an authenticated user with waiter role sends DELETE request to `/reservations/:id`
- **THEN** the system SHALL return 403 Forbidden response

---

### Requirement: Consistent Error Response for Unauthorized Access
The system SHALL return a consistent 403 Forbidden response with descriptive message when a user attempts to access a resource without the required role.

#### Scenario: Forbidden response format
- **WHEN** any authenticated user attempts to access an endpoint without the required role
- **THEN** the system SHALL return HTTP status 403
- **AND** the response body SHALL contain an error message indicating the required role(s)
- **AND** the response body SHALL contain the user's current role
