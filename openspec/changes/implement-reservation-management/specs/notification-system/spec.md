# Spec: Notification System

**Capability:** `notification-system`  
**Change:** `implement-reservation-management`  
**Type:** New Capability

## ADDED Requirements

### Requirement: Automated Confirmation Email

The system MUST send automated confirmation email immediately after reservation creation.

#### Scenario: Send email confirmation

**Given** a reservation is successfully created  
**And** customer email "john@example.com" is provided  
**When** the reservation is saved  
**Then** system sends confirmation email within 30 seconds:
  - Subject: "Reservation Confirmed - [Restaurant Name]"
  - Content includes: Date, Time, Party size, Table, Special requests
  - Contains: Restaurant details and contact information
**And** email status is logged: "Sent at 2024-12-16 10:30:25"

#### Scenario: Handle missing email address

**Given** a reservation is created without customer email  
**When** the reservation is saved  
**Then** the system completes the reservation normally  
**And** does not attempt to send email
