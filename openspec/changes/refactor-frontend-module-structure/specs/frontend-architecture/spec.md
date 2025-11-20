## ADDED Requirements

### Requirement: Feature-Based Module Structure
The frontend application SHALL organize code into feature-based modules with a standardized directory structure.

#### Scenario: Developer locates menu feature code
- **WHEN** a developer needs to find menu-related components
- **THEN** all menu code is in `src/modules/menu/` with clear subfolders (components, views, dialogs, services, hooks, types, utils)

#### Scenario: Developer creates new feature module
- **WHEN** a developer creates a new feature
- **THEN** they follow the standard structure pattern with components/, views/, dialogs/, services/, hooks/, types/, utils/ folders

#### Scenario: Module independence
- **WHEN** examining a feature module
- **THEN** all feature-specific code is colocated within that module
- **AND** the module only imports from shared components or other modules via barrel exports

### Requirement: Component Organization Pattern
Each module SHALL organize components into three distinct categories: components, views, and dialogs.

#### Scenario: Reusable UI component placement
- **WHEN** creating a small reusable UI piece (card, badge, filter)
- **THEN** it is placed in the module's `components/` folder

#### Scenario: Page-level view placement
- **WHEN** creating a complete page-level component (list view, grid view, detail view)
- **THEN** it is placed in the module's `views/` folder

#### Scenario: Modal dialog placement
- **WHEN** creating a modal interaction (form, confirmation, info display)
- **THEN** it is placed in the module's `dialogs/` folder under `single/` or `bulk/` subfolder

### Requirement: Service Colocation
Feature-specific services SHALL be colocated within their respective modules.

#### Scenario: Menu service location
- **WHEN** accessing menu-related API calls
- **THEN** the service is located at `src/modules/menu/services/menu.service.ts`
- **AND** it exports a `menuApi` object with methods

#### Scenario: Shared service location
- **WHEN** accessing authentication or file upload services
- **THEN** these shared services remain in `src/services/` as they are cross-cutting concerns

#### Scenario: Service independence
- **WHEN** a feature module has a service
- **THEN** it handles all API calls specific to that feature without depending on other feature services

### Requirement: Barrel Exports
Each module and subfolder SHALL provide barrel exports via index.ts files.

#### Scenario: Module-level import
- **WHEN** importing from a module
- **THEN** developers can import directly from the module: `import { MenuItemCard } from '@/modules/menu'`

#### Scenario: Subfolder exports
- **WHEN** a module has subfolders (components, dialogs, hooks)
- **THEN** each subfolder has an index.ts that exports all its contents

#### Scenario: Public API definition
- **WHEN** viewing a module's index.ts
- **THEN** it clearly defines the module's public API by exporting from subfolders

### Requirement: Consistent Naming Conventions
All files and folders SHALL follow consistent naming conventions.

#### Scenario: Component naming
- **WHEN** creating a component file
- **THEN** it uses PascalCase (e.g., MenuItemCard.tsx)

#### Scenario: Hook naming
- **WHEN** creating a custom hook
- **THEN** it uses camelCase with 'use' prefix (e.g., useMenuItems.ts)

#### Scenario: Service naming
- **WHEN** creating a service file
- **THEN** it uses kebab-case with '.service' suffix (e.g., menu.service.ts)

### Requirement: Module Documentation
Each feature module SHALL include a README.md documenting its structure and usage.

#### Scenario: Module README content
- **WHEN** reading a module's README.md
- **THEN** it documents:
  - Directory structure
  - Component categories and their purposes
  - Import examples
  - Design principles
  - Related documentation links

#### Scenario: New developer onboarding
- **WHEN** a new developer joins the project
- **THEN** they can understand module organization by reading module READMEs

## MODIFIED Requirements

### Requirement: Frontend Architecture Organization
The frontend SHALL organize code with clear separation between feature modules and shared components.

#### Scenario: Feature-specific code location
- **WHEN** code belongs to a specific feature
- **THEN** it is placed in `src/modules/[feature]/`

#### Scenario: Shared component location
- **WHEN** a component is used across multiple features
- **THEN** it is placed in `src/components/shared/` or `src/components/ui/`

#### Scenario: Layout component location
- **WHEN** organizing layout components (Header, Sidebar, Footer)
- **THEN** they are placed in `src/components/layouts/`

#### Scenario: Provider component location
- **WHEN** organizing context providers
- **THEN** they are placed in `src/components/providers/`
