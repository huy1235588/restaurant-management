## MODIFIED Requirements

### Requirement: Homepage Data Source
The homepage SHALL fetch restaurant information from the API instead of hardcoded config.

#### Scenario: Homepage loads settings from API
- **GIVEN** the homepage is accessed
- **WHEN** the page loads
- **THEN** restaurant information is fetched from GET /api/restaurant-settings

#### Scenario: API unavailable fallback
- **GIVEN** the API is unavailable or returns error
- **WHEN** the homepage loads
- **THEN** restaurant information falls back to restaurant.config.ts values

#### Scenario: Cached settings for performance
- **GIVEN** settings were previously fetched
- **WHEN** navigating within the site and returning to homepage
- **THEN** cached settings are used to avoid redundant API calls

### Requirement: Header Component Data
The header component SHALL display restaurant name from API settings.

#### Scenario: Restaurant name in header
- **GIVEN** settings loaded successfully
- **WHEN** header renders
- **THEN** restaurant name from API is displayed (not hardcoded)

### Requirement: Hero Section Data
The hero section SHALL display dynamic content from API settings.

#### Scenario: Hero displays API data
- **GIVEN** settings loaded successfully
- **WHEN** hero section renders
- **THEN** tagline and hero image URL from API are displayed

### Requirement: About Section Data
The about section SHALL display dynamic content from API settings.

#### Scenario: About displays API data
- **GIVEN** settings loaded successfully
- **WHEN** about section renders
- **THEN** about title, content, image, and highlights from API are displayed

### Requirement: Contact Section Data
The contact section SHALL display dynamic contact info from API settings.

#### Scenario: Contact displays API data
- **GIVEN** settings loaded successfully
- **WHEN** contact section renders
- **THEN** address, phone, email, operating hours, and map from API are displayed

### Requirement: Footer Component Data
The footer SHALL display dynamic content from API settings.

#### Scenario: Footer displays API data
- **GIVEN** settings loaded successfully
- **WHEN** footer renders
- **THEN** restaurant name and social links from API are displayed

