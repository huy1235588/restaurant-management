## ADDED Requirements

### Requirement: Settings Admin Page
The system SHALL provide an admin page for managing restaurant settings.

#### Scenario: Admin navigates to settings page
- **GIVEN** an authenticated admin user
- **WHEN** clicking "Settings" in the sidebar menu
- **THEN** the system displays the restaurant settings form

#### Scenario: Settings page loads existing data
- **GIVEN** settings exist in the database
- **WHEN** admin opens the settings page
- **THEN** all form fields are populated with current values

### Requirement: Settings Form Organization
The system SHALL organize settings into logical tabs for better UX.

#### Scenario: Tabs display correctly
- **GIVEN** admin is on settings page
- **WHEN** viewing the form
- **THEN** settings are organized into tabs: General, Contact, Operating Hours, Social Media, Images

#### Scenario: Tab navigation works
- **GIVEN** admin is on settings page
- **WHEN** clicking on a different tab
- **THEN** the corresponding form section is displayed

### Requirement: General Settings Form
The system SHALL provide form fields for general restaurant information.

#### Scenario: General settings editable
- **GIVEN** admin is on General tab
- **WHEN** editing fields
- **THEN** can modify: restaurant name, tagline, description, about title, about content

#### Scenario: Highlights management
- **GIVEN** admin is on General tab
- **WHEN** managing highlights
- **THEN** can add, edit, remove highlight items (icon, label, value)

### Requirement: Contact Settings Form
The system SHALL provide form fields for contact information.

#### Scenario: Contact info editable
- **GIVEN** admin is on Contact tab
- **WHEN** editing fields
- **THEN** can modify: address, phone number, email, map embed URL

#### Scenario: Map preview
- **GIVEN** admin enters valid Google Maps embed URL
- **WHEN** URL is entered
- **THEN** a preview of the embedded map is displayed

### Requirement: Operating Hours Form
The system SHALL provide form for managing operating hours.

#### Scenario: Operating hours as dynamic list
- **GIVEN** admin is on Operating Hours tab
- **WHEN** viewing the form
- **THEN** operating hours are shown as editable list with day and hours fields

#### Scenario: Add operating hours entry
- **GIVEN** admin is on Operating Hours tab
- **WHEN** clicking "Add Hours" button
- **THEN** a new row is added with empty day and hours fields

#### Scenario: Remove operating hours entry
- **GIVEN** admin is on Operating Hours tab with multiple entries
- **WHEN** clicking remove button on an entry
- **THEN** that entry is removed from the list

### Requirement: Social Links Form
The system SHALL provide form for managing social media links.

#### Scenario: Social links as dynamic list
- **GIVEN** admin is on Social Media tab
- **WHEN** viewing the form
- **THEN** social links are shown as editable list with platform, URL, icon fields

#### Scenario: Platform selection
- **GIVEN** admin is adding/editing social link
- **WHEN** selecting platform
- **THEN** can choose from: Facebook, Instagram, TikTok, Twitter, YouTube, Zalo

### Requirement: Images Settings Form
The system SHALL provide form for managing image URLs.

#### Scenario: Image URLs editable
- **GIVEN** admin is on Images tab
- **WHEN** editing fields
- **THEN** can modify: hero image URL, about image URL, logo URL

#### Scenario: Image preview
- **GIVEN** admin enters valid image URL
- **WHEN** URL is entered
- **THEN** a preview thumbnail of the image is displayed

### Requirement: Settings Save Action
The system SHALL save all settings with a single action.

#### Scenario: Save all settings
- **GIVEN** admin has made changes across multiple tabs
- **WHEN** clicking "Save" button
- **THEN** all settings are saved to database in single request

#### Scenario: Save success feedback
- **GIVEN** settings saved successfully
- **WHEN** save completes
- **THEN** success toast notification is displayed

#### Scenario: Save error handling
- **GIVEN** settings save fails (validation or server error)
- **WHEN** save completes with error
- **THEN** error message is displayed with details

### Requirement: Form Validation
The system SHALL validate form inputs before submission.

#### Scenario: Required field validation
- **GIVEN** admin leaves restaurant name empty
- **WHEN** attempting to save
- **THEN** validation error is shown for required fields

#### Scenario: Email format validation
- **GIVEN** admin enters invalid email format
- **WHEN** field loses focus or save attempted
- **THEN** validation error is shown for email field

#### Scenario: URL format validation
- **GIVEN** admin enters invalid URL for image fields
- **WHEN** field loses focus or save attempted
- **THEN** validation error is shown for URL fields

### Requirement: Settings Sidebar Navigation
The system SHALL add settings to admin sidebar menu.

#### Scenario: Settings menu item visible
- **GIVEN** admin user is logged in
- **WHEN** viewing sidebar
- **THEN** "Settings" menu item is visible with appropriate icon

#### Scenario: Settings menu item for manager
- **GIVEN** manager user is logged in
- **WHEN** viewing sidebar
- **THEN** "Settings" menu item is visible (managers can view/edit settings)

#### Scenario: Settings hidden from non-admin roles
- **GIVEN** waiter/chef/cashier user is logged in
- **WHEN** viewing sidebar
- **THEN** "Settings" menu item is NOT visible

