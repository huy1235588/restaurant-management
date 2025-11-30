## ADDED Requirements

### Requirement: Restaurant Settings Data Storage
The system SHALL store restaurant configuration in the database as a single-row table.

#### Scenario: Settings table exists with default data
- **GIVEN** the database has been migrated and seeded
- **WHEN** querying the restaurant_settings table
- **THEN** a single row exists with default restaurant information

#### Scenario: Settings contain all required fields
- **GIVEN** the restaurant_settings table exists
- **WHEN** examining the schema
- **THEN** it contains: name, tagline, description, aboutTitle, aboutContent, address, phone, email, mapEmbedUrl, heroImage, aboutImage, logoUrl, operatingHours (JSON), socialLinks (JSON), highlights (JSON), updatedAt

### Requirement: Public Settings Retrieval
The system SHALL allow unauthenticated access to read restaurant settings.

#### Scenario: Anonymous user fetches settings
- **GIVEN** an unauthenticated request
- **WHEN** GET /api/restaurant-settings is called
- **THEN** the system returns 200 with all restaurant settings

#### Scenario: Empty database returns empty object
- **GIVEN** no settings exist in database
- **WHEN** GET /api/restaurant-settings is called
- **THEN** the system returns 200 with empty object or default values

### Requirement: Admin Settings Update
The system SHALL allow admin users to update restaurant settings.

#### Scenario: Admin updates settings successfully
- **GIVEN** an authenticated admin user
- **WHEN** PUT /api/restaurant-settings is called with valid data
- **THEN** the system updates the settings and returns 200 with updated data

#### Scenario: Non-admin cannot update settings
- **GIVEN** an authenticated non-admin user (waiter, chef, cashier)
- **WHEN** PUT /api/restaurant-settings is called
- **THEN** the system returns 403 Forbidden

#### Scenario: Unauthenticated user cannot update settings
- **GIVEN** an unauthenticated request
- **WHEN** PUT /api/restaurant-settings is called
- **THEN** the system returns 401 Unauthorized

#### Scenario: Invalid data rejected
- **GIVEN** an authenticated admin user
- **WHEN** PUT /api/restaurant-settings is called with invalid data (e.g., invalid email format)
- **THEN** the system returns 400 with validation errors

### Requirement: Settings Validation
The system SHALL validate settings data before saving.

#### Scenario: Email format validation
- **GIVEN** settings update request
- **WHEN** email field contains invalid format
- **THEN** the system returns validation error for email field

#### Scenario: URL format validation
- **GIVEN** settings update request
- **WHEN** image URL fields contain invalid URLs
- **THEN** the system returns validation error for URL fields

#### Scenario: JSON array fields validation
- **GIVEN** settings update request
- **WHEN** operatingHours, socialLinks, or highlights contain invalid structure
- **THEN** the system returns validation error describing expected structure

