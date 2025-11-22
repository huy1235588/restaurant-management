# Reservation Management - Spec Deltas

## MODIFIED Requirements

### Requirement: Reservation Check-in (Seated)
When a customer arrives and the staff checks them in, the system SHALL transition the reservation to `seated` status AND automatically create an associated order in a single atomic transaction.

#### Scenario: Check-in creates order automatically
- **GIVEN** a reservation with status `confirmed`
- **WHEN** staff performs check-in (transition to `seated`)
- **THEN** the system SHALL:
  - Update reservation status to `seated`
  - Set reservation `seatedAt` timestamp
  - Update table status to `occupied`
  - Create a new order with:
    - `reservationId` linking to the reservation
    - `tableId` from reservation
    - `customerName` from reservation
    - `customerPhone` from reservation `phoneNumber`
    - `partySize` from reservation
    - `status` as `pending`
    - `staffId` as the user performing check-in
  - Create audit trail for reservation status change
  - Return both reservation and order data

#### Scenario: Transaction rollback on failure
- **GIVEN** a reservation ready to be seated
- **WHEN** any step in the check-in transaction fails (e.g., table update error)
- **THEN** the system SHALL:
  - Rollback all changes in the transaction
  - Keep reservation status as `confirmed` (unchanged)
  - Log error details for debugging
  - Return error message to staff

#### Scenario: Prevent duplicate orders
- **GIVEN** a reservation that already has an associated order
- **WHEN** staff attempts to check-in again
- **THEN** the system SHALL:
  - Detect existing order via `reservationId` foreign key
  - Return the existing reservation and order
  - NOT create a duplicate order

#### Scenario: Check-in response includes order
- **GIVEN** successful check-in operation
- **WHEN** API returns response
- **THEN** the response SHALL include:
  - `reservation` object with updated status and `seatedAt`
  - `order` object with all created order details
  - Success message indicating both actions completed

## MODIFIED Requirements

### Requirement: Reservation Completion
When a reservation is completed (customer leaves), the system SHALL update the reservation status to `completed` and handle any associated order lifecycle.

#### Scenario: Complete reservation with active order
- **GIVEN** a reservation with status `seated` and an active order (not `completed`)
- **WHEN** staff completes the reservation
- **THEN** the system SHALL:
  - Check if associated order exists via `reservationId`
  - Prevent completion and return error: "Cannot complete reservation while order is active. Please complete or cancel the order first."

#### Scenario: Complete reservation after order completed
- **GIVEN** a reservation with status `seated` and order status `completed`
- **WHEN** staff completes the reservation
- **THEN** the system SHALL:
  - Update reservation status to `completed`
  - Set `completedAt` timestamp
  - Update table status to `available`
  - Create audit log entry

## MODIFIED Requirements

### Requirement: Reservation Cancellation
When a reservation is cancelled, the system SHALL handle cascading effects on associated orders if the reservation was already seated.

#### Scenario: Cancel seated reservation with pending order
- **GIVEN** a reservation with status `seated` and an order with status `pending` (no items added)
- **WHEN** staff cancels the reservation
- **THEN** the system SHALL:
  - Update reservation status to `cancelled`
  - Cancel the associated order (status `cancelled`)
  - Update table status to `available`
  - Record cancellation reason for both reservation and order

#### Scenario: Cancel seated reservation with items in order
- **GIVEN** a reservation with status `seated` and an order containing items
- **WHEN** staff attempts to cancel the reservation
- **THEN** the system SHALL:
  - Prevent cancellation and return error: "Cannot cancel reservation with active order items. Please handle the order first."
  - Suggest staff to either complete or cancel the order separately

#### Scenario: Cancel confirmed reservation (not seated)
- **GIVEN** a reservation with status `confirmed` (no order exists)
- **WHEN** staff cancels the reservation
- **THEN** the system SHALL:
  - Update reservation status to `cancelled`
  - Update table status to `available`
  - NOT attempt to cancel any order (none exists)

## ADDED Requirements

### Requirement: Order-Reservation Linking
The system SHALL maintain a bidirectional relationship between reservations and orders to support integrated workflows.

#### Scenario: Query reservation with order
- **GIVEN** a seated reservation with associated order
- **WHEN** fetching reservation details
- **THEN** the response SHALL include:
  - All reservation fields
  - Nested `order` object if exists (joined via `reservationId`)
  - NULL for `order` if reservation not yet seated

#### Scenario: Filter orders by reservation
- **GIVEN** multiple orders in the system
- **WHEN** querying orders with filter `hasReservation=true`
- **THEN** return only orders where `reservationId IS NOT NULL`

#### Scenario: Identify walk-in orders
- **GIVEN** orders created without reservation (walk-in customers)
- **WHEN** displaying order list
- **THEN** orders with `reservationId = NULL` SHALL be labeled as "Walk-in"

## ADDED Requirements

### Requirement: Audit Trail for Integrated Operations
The system SHALL log audit trails for both reservation and order actions during integrated operations.

#### Scenario: Audit check-in with order creation
- **GIVEN** successful check-in operation
- **WHEN** transaction completes
- **THEN** the system SHALL create audit logs:
  - Reservation audit: action `seat`, changes `{ oldStatus: 'confirmed', newStatus: 'seated', orderCreated: true }`
  - Order audit (if implemented): action `create`, changes `{ source: 'reservation', reservationId: X }`
