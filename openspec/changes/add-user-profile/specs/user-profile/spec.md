# User Profile Management

## ADDED Requirements

### Requirement: View Profile

The system SHALL display user profile information when authenticated user navigates to profile page.

- **GIVEN** user is authenticated
- **WHEN** user navigates to profile page
- **THEN** system displays user's account information (username, email, phone)
- **AND** system displays user's staff information (fullName, address, dateOfBirth, hireDate)
- **AND** system displays user's role with appropriate badge

#### Scenario: User views their profile

- **GIVEN** user "admin" is logged in
- **WHEN** user clicks on profile link in user menu
- **THEN** user is redirected to `/admin/profile`
- **AND** profile page displays username "admin"
- **AND** profile page displays email "admin@restaurant.com"
- **AND** profile page displays role badge "Admin"

### Requirement: Update Profile Information

The system SHALL allow authenticated users to update their profile information.

- **GIVEN** user is authenticated
- **WHEN** user submits profile update form with valid data
- **THEN** system updates account email if changed
- **AND** system updates account phoneNumber if changed
- **AND** system updates staff fullName if changed
- **AND** system updates staff address if changed
- **AND** system returns updated profile data

#### Scenario: User updates their email

- **GIVEN** user is on profile page
- **WHEN** user clicks "Edit Profile" button
- **AND** user changes email to "newemail@example.com"
- **AND** user clicks "Save"
- **THEN** system updates email in database
- **AND** system shows success toast "Profile updated successfully"
- **AND** dialog closes
- **AND** profile page shows new email

#### Scenario: User tries to use existing email

- **GIVEN** email "existing@example.com" is used by another account
- **WHEN** user tries to update email to "existing@example.com"
- **THEN** system returns 409 Conflict error
- **AND** error message "Email already exists" is displayed

### Requirement: Change Password

The system SHALL allow authenticated users to change their password.

- **GIVEN** user is authenticated
- **WHEN** user submits change password form with correct current password
- **THEN** system verifies current password
- **AND** system hashes new password
- **AND** system updates password in database
- **AND** system returns success response

#### Scenario: User changes password successfully

- **GIVEN** user is on profile page
- **WHEN** user clicks "Change Password" button
- **AND** user enters correct current password
- **AND** user enters new password (min 6 chars)
- **AND** user confirms new password
- **AND** user clicks "Change Password"
- **THEN** system verifies current password
- **AND** system updates password
- **AND** system shows success toast "Password changed successfully"
- **AND** dialog closes

#### Scenario: User enters wrong current password

- **GIVEN** user is on change password dialog
- **WHEN** user enters incorrect current password
- **AND** user clicks "Change Password"
- **THEN** system returns 401 Unauthorized error
- **AND** error message "Current password is incorrect" is displayed

#### Scenario: Password confirmation mismatch

- **GIVEN** user is on change password dialog
- **WHEN** user enters newPassword "password123"
- **AND** user enters confirmPassword "password456"
- **THEN** form validation shows error "Passwords do not match"
- **AND** submit button is disabled

### Requirement: Profile UI Components

The system SHALL provide reusable UI components for profile management with i18n support.

- **GIVEN** profile module is implemented
- **THEN** system provides ProfileInfoCard component
- **AND** system provides EditProfileDialog component
- **AND** system provides ChangePasswordDialog component
- **AND** all components support i18n (Vietnamese and English)

#### Scenario: Profile page renders correctly

- **GIVEN** user navigates to profile page
- **THEN** page displays ProfileInfoCard with user information
- **AND** page displays "Edit Profile" button
- **AND** page displays "Change Password" button
- **AND** all text is translated based on current language setting

