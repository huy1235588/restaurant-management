# Update Dashboard Sidebar to Overlay Mode with Logo Alignment

## Why

The current dashboard sidebar implementation uses a persistent layout that takes up screen space. Users need a cleaner, more space-efficient navigation experience where the sidebar appears as an overlay when needed, while maintaining visual continuity between the collapsed and expanded states through pixel-perfect logo alignment.

## What Changes

- Modify sidebar behavior from persistent to overlay mode (slides over content instead of pushing it)
- Implement pixel-perfect logo positioning between header and expanded sidebar states
- Add click-outside functionality to close the overlay sidebar
- Ensure sidebar toggle button and logo remain visible in header when sidebar is collapsed
- Maintain responsive behavior for both desktop and mobile viewports
- Create smooth visual transition when sidebar expands/collapses

## Impact

### Affected Specs
- `dashboard-navigation` (NEW capability - to be created)

### Affected Code
- `app/client/src/components/layouts/DashboardSidebar.tsx` - Main sidebar component behavior
- `app/client/src/components/layouts/TopBar.tsx` - Header with toggle button and logo placement
- `app/client/src/components/ui/sidebar.tsx` - Base sidebar UI primitives
- `app/client/src/components/layouts/MobileSidebar.tsx` - Mobile-specific sidebar (may be consolidated)

### User Experience Impact
- **Positive**: More screen space for main content, cleaner interface
- **Neutral**: Slight change in muscle memory for navigation access
- **No Breaking Changes**: Core navigation functionality remains the same
