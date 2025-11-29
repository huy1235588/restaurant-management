## ADDED Requirements

### Requirement: Consistent i18n Usage Across All Modules
Tất cả các module frontend PHẢI sử dụng react-i18next để hiển thị text, không sử dụng hardcoded strings.

#### Scenario: Categories module displays translated text
- **WHEN** user views the categories list
- **THEN** all UI text (titles, labels, buttons, error messages) are displayed using translation keys
- **AND** text changes appropriately when language is switched

#### Scenario: Kitchen module displays translated text
- **WHEN** user views the kitchen display
- **THEN** all UI text (status labels, filter buttons, time displays, dialogs) are displayed using translation keys
- **AND** text changes appropriately when language is switched

#### Scenario: Products module displays translated text
- **WHEN** user views the products/inventory section
- **THEN** all UI text are displayed using translation keys
- **AND** text changes appropriately when language is switched

### Requirement: Complete Translation Coverage
Mọi text hiển thị cho người dùng PHẢI có translation keys đầy đủ trong cả file en.json và vi.json.

#### Scenario: All translation keys exist in both locale files
- **WHEN** a translation key is used in any component
- **THEN** the key MUST exist in both `locales/en.json` and `locales/vi.json`
- **AND** both translations are meaningful and accurate

#### Scenario: New translation keys follow naming convention
- **WHEN** adding a new translation key
- **THEN** key MUST follow pattern `{module}.{category}.{key}` (e.g., `kitchen.status.pending`)
- **AND** key name MUST be in camelCase

### Requirement: Translation Fallback Behavior
Hệ thống PHẢI hiển thị fallback text hợp lý khi translation key không tồn tại.

#### Scenario: Missing translation displays fallback
- **WHEN** a translation key is missing for current language
- **THEN** system SHOULD display the fallback text (second parameter of t() function)
- **AND** no error is thrown to the console

### Requirement: Language Switching
Người dùng PHẢI có thể chuyển đổi giữa các ngôn ngữ mà không cần reload trang.

#### Scenario: Switch from English to Vietnamese
- **WHEN** user changes language setting from English to Vietnamese
- **THEN** all translated text in the current view updates immediately to Vietnamese
- **AND** no page reload is required

#### Scenario: Switch from Vietnamese to English
- **WHEN** user changes language setting from Vietnamese to English
- **THEN** all translated text in the current view updates immediately to English
- **AND** no page reload is required

## MODIFIED Requirements

### Requirement: Module Component Structure
Các component trong mỗi module PHẢI import và sử dụng useTranslation hook từ react-i18next.

#### Scenario: Component uses useTranslation hook
- **WHEN** a component needs to display user-facing text
- **THEN** component MUST import useTranslation from 'react-i18next'
- **AND** destructure `t` function using `const { t } = useTranslation()`
- **AND** use `t('key', 'fallback')` for all displayed text

#### Scenario: Dynamic text with interpolation
- **WHEN** component needs to display text with dynamic values
- **THEN** use interpolation syntax: `t('key', { variable: value })`
- **AND** translation string contains placeholder: `{{variable}}`

## Notes

### Translation Key Structure by Module

```
common.              # Shared keys (actions, status, etc.)
  ├── actions.       # Action buttons (save, cancel, delete, etc.)
  ├── status.        # Status labels  
  ├── validation.    # Form validation messages
  └── ...

categories.          # Categories module
  ├── title
  ├── actions.
  ├── messages.
  └── ...

kitchen.             # Kitchen display module
  ├── title
  ├── status.
  ├── actions.
  ├── keyboard.
  └── ...

products.            # Products/inventory module
  ├── title
  ├── ...
  └── ...

tables.              # Tables module (already partially implemented)
menu.                # Menu module (already partially implemented)
orders.              # Orders module (already partially implemented)
billing.             # Billing module (already partially implemented)
reservations.        # Reservations module (already partially implemented)
```

### Files to be Modified

| Module | Files to Update |
|--------|-----------------|
| categories | CategoryList.tsx, CategoryCard.tsx, dialogs/*.tsx |
| kitchen | KitchenDisplayView.tsx, KitchenOrderCard.tsx, KitchenStats.tsx, LoadingState.tsx, ErrorState.tsx, EmptyState.tsx |
| products | All view and component files |
| tables | Verify and add missing keys |
| menu | Verify and add missing keys |
| order | Verify and add missing keys |
| bills | Verify and add missing keys |
| reservations | Verify and add missing keys |
| locales | en.json, vi.json |
