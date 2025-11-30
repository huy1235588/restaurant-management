## ADDED Requirements

### Requirement: Landing Page Structure
The system SHALL provide a single-page landing website for customers to view restaurant information.

The landing page MUST include the following sections in order:
- Navigation header with logo, section links, and language switcher
- Hero section with restaurant branding and call-to-action
- About section introducing the restaurant
- Menu section displaying featured food items
- Reservation section with booking form
- Contact section with restaurant information
- Footer with copyright and social links

#### Scenario: Customer visits homepage
- **GIVEN** a customer navigates to the root URL `/`
- **WHEN** the page loads
- **THEN** the system displays all sections of the landing page
- **AND** the navigation header is visible and sticky
- **AND** smooth scroll navigation works between sections

#### Scenario: Mobile responsive layout
- **GIVEN** a customer visits the homepage on a mobile device
- **WHEN** the page loads
- **THEN** all sections adapt to mobile viewport
- **AND** the navigation collapses into a hamburger menu
- **AND** images and content scale appropriately

---

### Requirement: Hero Section Display
The system SHALL display a prominent hero section at the top of the landing page.

The hero section MUST include:
- Restaurant name/logo
- Tagline or welcome message
- Background image or gradient
- Primary CTA button ("Đặt Bàn" / "Book Table")
- Secondary CTA button ("Xem Menu" / "View Menu")

#### Scenario: Hero section renders correctly
- **GIVEN** a customer views the landing page
- **WHEN** the hero section is visible
- **THEN** the restaurant name is prominently displayed
- **AND** both CTA buttons are visible and clickable
- **AND** clicking "Đặt Bàn" scrolls to reservation section
- **AND** clicking "Xem Menu" scrolls to menu section

---

### Requirement: About Section Display
The system SHALL display an about section introducing the restaurant.

The about section MUST include:
- Brief description of the restaurant (2-3 paragraphs)
- At least one restaurant image
- Optional: key highlights (years in business, signature dishes, etc.)

#### Scenario: About section renders correctly
- **GIVEN** a customer views the landing page
- **WHEN** scrolling to the about section
- **THEN** the restaurant description is displayed
- **AND** restaurant image(s) are loaded
- **AND** content is readable on both mobile and desktop

---

### Requirement: Featured Menu Display
The system SHALL display a selection of featured menu items from the database.

The menu section MUST:
- Fetch menu items from the backend API
- Display 6-8 featured items maximum
- Show item image, name, price, and brief description
- Support filtering by category (optional tabs)
- Include a CTA to view full menu

#### Scenario: Menu items load successfully
- **GIVEN** the menu section is visible
- **WHEN** the API call completes successfully
- **THEN** featured menu items are displayed in a grid layout
- **AND** each item shows image, name, price (formatted in VND)
- **AND** loading skeleton is shown while fetching

#### Scenario: Menu items fail to load
- **GIVEN** the menu section is visible
- **WHEN** the API call fails
- **THEN** an error message is displayed
- **AND** a retry button is available

#### Scenario: Empty menu state
- **GIVEN** the menu section is visible
- **WHEN** no menu items are available in the database
- **THEN** a friendly "Coming soon" message is displayed

---

### Requirement: Online Reservation Form
The system SHALL provide an inline reservation form for customers to book tables.

The reservation form MUST collect:
- Customer name (required)
- Phone number (required, validated)
- Reservation date (required, future dates only)
- Reservation time (required, within operating hours)
- Party size (required, 1-20 guests)
- Special requests (optional, textarea)

#### Scenario: Successful reservation submission
- **GIVEN** a customer fills in valid reservation details
- **WHEN** the customer submits the form
- **THEN** the system creates a reservation with status `pending`
- **AND** a success message is displayed with reservation code
- **AND** the form is reset for new bookings

#### Scenario: Reservation validation errors
- **GIVEN** a customer submits the form with invalid data
- **WHEN** validation fails
- **THEN** error messages are displayed next to invalid fields
- **AND** the form is not submitted

#### Scenario: Reservation API failure
- **GIVEN** a customer submits a valid reservation
- **WHEN** the API call fails
- **THEN** an error toast notification is shown
- **AND** the form data is preserved for retry

#### Scenario: Date/Time restrictions
- **GIVEN** a customer selects a reservation date
- **WHEN** choosing date and time
- **THEN** past dates are disabled
- **AND** times outside operating hours are disabled or show warning

---

### Requirement: Contact Information Display
The system SHALL display restaurant contact information and location.

The contact section MUST include:
- Physical address
- Phone number (clickable on mobile)
- Email address (clickable mailto link)
- Operating hours for each day
- Map placeholder or embedded map

#### Scenario: Contact section renders correctly
- **GIVEN** a customer views the contact section
- **WHEN** the section is visible
- **THEN** all contact information is displayed
- **AND** phone number is clickable (tel: link)
- **AND** email is clickable (mailto: link)
- **AND** operating hours are clearly formatted

---

### Requirement: Navigation and Scroll Behavior
The system SHALL provide smooth navigation between landing page sections.

#### Scenario: Sticky navigation header
- **GIVEN** a customer scrolls down the page
- **WHEN** scrolling past the hero section
- **THEN** the navigation header remains visible (sticky)
- **AND** the header may change appearance (e.g., add background)

#### Scenario: Smooth scroll to sections
- **GIVEN** a customer clicks a navigation link
- **WHEN** the link targets a section (e.g., #menu, #reservation)
- **THEN** the page smoothly scrolls to that section
- **AND** the URL hash is updated

#### Scenario: Mobile navigation menu
- **GIVEN** a customer views the page on mobile
- **WHEN** clicking the hamburger menu icon
- **THEN** a mobile menu overlay opens
- **AND** clicking a menu item scrolls to section and closes menu

---

### Requirement: Theme and Language Support
The system SHALL support dark/light mode and multiple languages on the landing page.

#### Scenario: Dark mode toggle
- **GIVEN** a customer is viewing the landing page
- **WHEN** toggling dark mode
- **THEN** all sections update to dark theme colors
- **AND** the preference is persisted

#### Scenario: Language switching
- **GIVEN** a customer is viewing the landing page
- **WHEN** changing language from EN to VI (or vice versa)
- **THEN** all text content updates to the selected language
- **AND** the preference is persisted
- **AND** page does not reload (client-side switch)

---

### Requirement: Footer Display
The system SHALL display a footer at the bottom of the landing page.

The footer MUST include:
- Copyright notice with current year
- Quick links to sections
- Social media links (if applicable)
- Optional: Back to top button

#### Scenario: Footer renders correctly
- **GIVEN** a customer scrolls to the bottom of the page
- **WHEN** the footer is visible
- **THEN** copyright information is displayed
- **AND** section links are functional
- **AND** social media icons link to external pages (open in new tab)

---

### Requirement: SEO and Performance
The system SHALL be optimized for search engines and performance.

#### Scenario: SEO metadata
- **GIVEN** a search engine crawls the landing page
- **WHEN** parsing the page
- **THEN** proper meta title and description are present
- **AND** Open Graph tags are included for social sharing
- **AND** semantic HTML is used (header, main, section, footer)

#### Scenario: Performance optimization
- **GIVEN** a customer loads the landing page
- **WHEN** the page renders
- **THEN** images are lazy-loaded where appropriate
- **AND** above-the-fold content loads quickly (LCP < 2.5s target)
- **AND** animations respect `prefers-reduced-motion` setting
