# Visual Floor Plan Editor

A comprehensive visual editor for restaurant floor plan management with drag-and-drop functionality, real-time collision detection, and advanced layout tools.

## Overview

The Visual Floor Plan Editor provides an intuitive, CAD-like interface for designing and managing restaurant layouts across multiple floors. It combines HTML5 Canvas for performance with React DOM for interactivity and accessibility.

## Features Implemented

### ✅ Phase 1: Foundation & Core Canvas

#### Database & Backend
- ✅ Database migrations for floor plan tables
- ✅ Prisma schema models (FloorPlanLayout)
- ✅ Floor plan feature module in backend
- ✅ Position and layout controllers with CRUD operations
- ✅ Validation schemas with Zod
- ✅ Swagger/OpenAPI documentation

#### API Endpoints
- ✅ GET `/api/floor-plans/layouts/:floor` - Get layouts for a floor
- ✅ GET `/api/floor-plans/layouts/:layoutId/detail` - Get layout by ID
- ✅ POST `/api/floor-plans/layouts` - Create new layout
- ✅ PUT `/api/floor-plans/layouts/:layoutId` - Update layout
- ✅ DELETE `/api/floor-plans/layouts/:layoutId` - Delete layout
- ✅ POST `/api/floor-plans/layouts/:layoutId/activate` - Activate layout
- ✅ PATCH `/api/floor-plans/positions` - Update table positions in bulk

#### Frontend Foundation
- ✅ Visual editor feature module structure
- ✅ Zustand stores (EditorStore, LayoutStore, HistoryStore)
- ✅ TypeScript types and interfaces
- ✅ API client functions
- ✅ Routing to visual editor page

#### Canvas Rendering
- ✅ Canvas element with grid rendering
- ✅ Grid toggle functionality
- ✅ Configurable grid size (stored in state)
- ✅ Responsive canvas sizing
- ✅ Hybrid Canvas/DOM layering
- ✅ Table components on DOM layer

#### View Controls
- ✅ Zoom in/out functions (25%-200%)
- ✅ Zoom controls in toolbar
- ✅ Reset zoom to 100%
- ✅ Pan state management

### ✅ Phase 2: Editing Tools & Interactions

#### Tool System
- ✅ Tool abstraction (select, pan, add, delete)
- ✅ Select tool with click selection
- ✅ Tool state management in EditorStore
- ✅ Tool toolbar UI with active states

#### Select Tool Features
- ✅ Single table selection
- ✅ Selection outline rendering (via CSS)
- ✅ Resize handles visualization (8 points)
- ✅ Multi-select with Shift+Click
- ✅ Deselection on empty area click
- ✅ Properties panel updates on selection
- ✅ Visual feedback for selected state

#### Drag & Drop System
- ✅ @dnd-kit/core integration
- ✅ Draggable table components
- ✅ Drag start/end handlers
- ✅ Real-time position updates during drag
- ✅ Elevated shadow and opacity effects
- ✅ Table position state management

#### Collision Detection
- ✅ AABB collision detection algorithm
- ✅ Collision check function for rectangles
- ✅ Real-time collision detection during drag
- ✅ Red outline for colliding tables
- ✅ Collision prevention on drop
- ✅ Error toast for invalid placement

#### Grid Snapping
- ✅ Grid snap algorithm (Math.round)
- ✅ Snap-to-grid on drag release
- ✅ Alignment guide calculations (for future implementation)

### ✅ Phase 4: History & Advanced Features

#### Undo/Redo System
- ✅ Action interface and types
- ✅ HistoryStore with stack management
- ✅ Action recording on edit operations
- ✅ Undo/redo functions
- ✅ Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- ✅ Undo/redo buttons in toolbar
- ✅ Button disabled states
- ✅ Action limit (50 actions max)
- ✅ Clear redo stack on new action

#### Properties Panel
- ✅ PropertiesPanel component
- ✅ Display table information (number, status, capacity)
- ✅ Position display (X, Y coordinates)
- ✅ Dimensions display (width, height)
- ✅ Position input fields for precise placement
- ✅ Quick action buttons (Delete, Duplicate)
- ✅ Multi-selection info display

#### Keyboard Shortcuts
- ✅ Save layout (Ctrl+S)
- ✅ Undo (Ctrl+Z)
- ✅ Redo (Ctrl+Shift+Z)

#### Fullscreen Mode
- ✅ Fullscreen toggle button in toolbar

## Architecture

### Frontend Structure
```
src/features/visual-editor/
├── components/
│   ├── EditorCanvas.tsx        # Canvas layer with grid
│   ├── EditorToolbar.tsx       # Toolbar with tools and controls
│   ├── TableComponent.tsx      # Draggable table component
│   ├── PropertiesPanel.tsx     # Properties panel for selected tables
│   ├── VisualEditorPage.tsx    # Main editor page
│   └── index.ts
├── stores/
│   ├── editorStore.ts          # Editor state (tools, zoom, pan, grid)
│   ├── layoutStore.ts          # Layout and table positions
│   ├── historyStore.ts         # Undo/redo history
│   └── index.ts
├── utils/
│   └── geometry.ts             # Collision detection, snapping, alignment
├── api/
│   └── floorPlanApi.ts         # API client functions
├── hooks/
│   ├── useFloorPlanData.ts     # Load floor plan data
│   └── index.ts
├── types/
│   └── index.ts                # TypeScript type definitions
└── index.ts
```

### Backend Structure
```
src/features/floor-plan/
├── floor-plan.controller.ts    # Request handlers
├── floor-plan.service.ts       # Business logic
├── floor-plan.repository.ts    # Database operations
├── floor-plan.routes.ts        # API routes
├── dtos/
│   └── floor-plan.dto.ts       # Data transfer objects
├── validators/
│   └── floor-plan.schema.ts    # Zod validation schemas
└── index.ts
```

## Usage

### Accessing the Editor
1. Navigate to `/tables` in the application
2. Click the "Visual" view mode button in the table header
3. The visual floor plan editor will be displayed

### Basic Operations

#### Selecting Tables
- Click a table to select it
- Shift+Click to multi-select
- Click empty canvas area to deselect all

#### Moving Tables
- Drag selected tables to move them
- Grid snapping is applied on drop
- Red outline indicates collision

#### Zooming
- Use zoom in/out buttons in toolbar
- Zoom level displayed in toolbar (25%-200%)
- Reset zoom button returns to 100%

#### Floor Management
- Use floor selector dropdown to switch between floors
- Warning shown if there are unsaved changes
- Each floor maintains independent table positions

#### Saving Changes
- Click "Save Positions" button or press Ctrl+S to save current table positions
- Unsaved changes indicator (*) shown in toolbar
- Toast notification on successful save

#### Saving Layouts
- Click "Save as Layout" button to save current arrangement as a named layout
- Provide name and optional description
- Layout includes table positions, grid settings, and zoom level

#### Loading Layouts
- Click "Load Layout" button to see all saved layouts for current floor
- Click a layout to select it, then click "Load Selected"
- Delete layouts using the trash icon

#### Undo/Redo
- Ctrl+Z to undo
- Ctrl+Shift+Z to redo
- Button states show availability

## Technology Stack

- **React 18** - UI framework
- **Next.js 16** - App framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **@dnd-kit/core** - Drag and drop
- **HTML5 Canvas** - Grid rendering
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### ✅ Phase 3: Floor & Layout Management

#### Floor Management
- ✅ FloorSelector component with dropdown
- ✅ Floor switching functionality
- ✅ Unsaved changes detection and warning
- ✅ Floor data loading per floor
- ✅ Floor-specific state isolation

#### Layout Saving & Loading
- ✅ Save button in toolbar with unsaved indicator
- ✅ Ctrl+S keyboard shortcut
- ✅ Batch position update API integration
- ✅ Save success/error notifications
- ✅ SaveLayoutDialog component
- ✅ Layout name and description inputs
- ✅ Layout data serialization to JSONB
- ✅ LoadLayoutDialog component
- ✅ Layout list with metadata
- ✅ Load layout functionality
- ✅ Delete layout with confirmation

## Remaining Work

### Phase 3: Additional Features (Not Completed)
- Layout templates (Restaurant, Cafe, Fine Dining, Bar, Banquet)
- Duplicate layout feature
- Activate layout functionality
- Floor data caching
- Number key shortcuts for floor switching
- Better unsaved changes dialog (Save & Switch, Discard & Switch options)

### Additional Features (Not Started)
- Pan tool implementation
- Add table tool with ghost preview
- Delete tool with confirmation
- Ctrl+Scroll zoom
- Keyboard shortcuts for tools (V, H, T)
- Grid toggle with G key
- Fullscreen mode with F key
- Resize handle drag functionality
- Smooth animations
- Shift+Drag to disable snapping
- Alignment guide visualization
- Performance optimizations
- Accessibility enhancements
- Comprehensive testing
- Documentation and tutorials

## Performance Considerations

- Hybrid rendering (Canvas + DOM) for optimal performance
- Collision detection optimized for real-time feedback
- Zustand for minimal re-renders
- Future: Virtual scrolling for 100+ tables
- Future: Spatial partitioning for collision checks

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader compatible
- Toast notifications for feedback

## API Integration

The editor integrates with:
- `/api/tables` - Get tables by floor
- `/api/floor-plans/positions` - Update positions
- `/api/floor-plans/layouts` - Manage layouts

## Development Notes

- Database migrations already applied
- Backend fully implemented and documented
- Frontend foundation complete with core functionality
- Ready for phase 3 (floor management) and additional polish

## Testing

### Manual Testing Checklist
- [ ] Load floor plan data
- [x] Select/deselect tables
- [x] Drag tables
- [x] Collision detection
- [x] Grid snapping
- [x] Undo/redo
- [x] Save positions
- [ ] Zoom controls
- [ ] Properties panel edits

### Future Automated Tests
- Unit tests for geometry utils
- Integration tests for API endpoints
- E2E tests for workflows
- Performance tests with 100+ tables
- Accessibility tests with axe-core

## Contributing

When adding new features:
1. Update types in `types/index.ts`
2. Add state management in appropriate store
3. Create UI components in `components/`
4. Add utility functions in `utils/`
5. Update API client if needed
6. Add to tasks checklist in OpenSpec
7. Update this README

## License

Part of the Restaurant Management System project.
