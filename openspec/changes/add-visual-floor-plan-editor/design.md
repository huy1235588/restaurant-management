# Design Document: Visual Floor Plan Editor

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Visual Editor Feature Module                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │ Canvas Layer │  │ Editor Tools │  │ Floor       │ │  │
│  │  │ (HTML5)      │  │ (React)      │  │ Selector    │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │ Table        │  │ Drag & Drop  │  │ Properties  │ │  │
│  │  │ Components   │  │ (@dnd-kit)   │  │ Panel       │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↕ HTTP/WS                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Floor Plan API Module                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │ Layout       │  │ Position     │  │ Template    │ │  │
│  │  │ Controller   │  │ Controller   │  │ Controller  │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Prisma ORM                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  - table_positions                                           │
│  - floor_plan_layouts                                        │
│  - restaurant_tables (existing)                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Hybrid Rendering Strategy

**Decision**: Use HTML5 Canvas for static elements (grid, background) and React DOM for interactive elements (tables, controls)

**Rationale**:
- **Canvas Advantages**: Better performance for static graphics, grid rendering, and background patterns
- **DOM Advantages**: Superior interactivity, accessibility, event handling, and React integration
- **Hybrid Benefits**: Combines strengths of both approaches

**Implementation**:
```typescript
// Canvas layer (static)
- Grid overlay (drawn on canvas)
- Background patterns
- Alignment guides (temporary)

// DOM layer (interactive)
- Table components (draggable)
- Toolbar controls
- Properties panel
- Dialogs and modals
```

**Alternatives Considered**:
- Pure Canvas: Rejected due to accessibility and complex event handling
- Pure DOM/SVG: Rejected due to grid rendering performance concerns

### 2. State Management Architecture

**Decision**: Use Zustand for editor state with separate stores per concern

**Rationale**:
- Lightweight and performant
- Easy to integrate with React
- Good TypeScript support
- Minimal boilerplate

**Store Structure**:
```typescript
// EditorStore - Core editor state
interface EditorStore {
  currentTool: Tool;
  selectedTableIds: number[];
  zoom: number;
  pan: { x: number; y: number };
  gridEnabled: boolean;
  currentFloor: number;
  setTool: (tool: Tool) => void;
  selectTable: (id: number) => void;
  // ... other actions
}

// LayoutStore - Layout and table positions
interface LayoutStore {
  tables: TablePosition[];
  unsavedChanges: boolean;
  loadLayout: (floor: number) => Promise<void>;
  saveLayout: () => Promise<void>;
  updateTablePosition: (id: number, position: Position) => void;
  // ... other actions
}

// HistoryStore - Undo/redo
interface HistoryStore {
  history: Action[];
  currentIndex: number;
  push: (action: Action) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
```

**Alternatives Considered**:
- Redux: Too much boilerplate for this use case
- Context API: Performance concerns with frequent updates
- React Query: Better for server state, not local editor state

### 3. Floor Management Strategy

**Decision**: Load one floor at a time, maintain separate position data per floor

**Rationale**:
- Reduces memory footprint
- Improves performance
- Natural separation of concerns
- Simplifies state management

**Implementation**:
- Each floor has independent layout data
- Switching floors loads new dataset
- Warn on unsaved changes before switching
- Backend stores floor ID with each position record

**Data Flow**:
```
User selects Floor 2
  → Check unsaved changes (warn if any)
  → Clear current canvas
  → Fetch Floor 2 table positions
  → Load tables onto canvas
  → Update floor selector UI
```

### 4. Manual Save Strategy

**Decision**: Require explicit user action to save changes (no auto-save)

**Rationale**:
- Prevents accidental changes from being persisted
- Gives users control over when to commit
- Aligns with desktop CAD software UX
- Allows experimentation without consequences

**Implementation**:
- Track dirty state in store
- Show unsaved changes indicator (*)
- Warn on navigation away with unsaved changes
- Keyboard shortcut (Ctrl+S) for quick save
- API batches all position updates in single request

**Considerations**:
- Could add auto-save as future opt-in preference
- Implement session recovery for crash scenarios

### 5. Drag & Drop Implementation

**Decision**: Use `@dnd-kit/core` library with custom collision detection

**Rationale**:
- Well-maintained, modern library
- Excellent accessibility support
- Flexible and extensible
- Good TypeScript support
- Better than react-dnd for modern React

**Collision Detection Algorithm**:
```typescript
// AABB (Axis-Aligned Bounding Box) collision
function checkCollision(rect1: Rect, rect2: Rect): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Grid snapping
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}
```

**Features**:
- Real-time collision detection during drag
- Visual feedback (red outline on collision)
- Grid snapping when enabled
- Alignment guides (snap to other tables)
- Smooth animations

### 6. Database Schema Design

**Decision**: Create two new tables: `table_positions` and `floor_plan_layouts`

**Rationale**:
- Separate concerns: positions vs saved layouts
- Allows multiple saved layouts per floor
- Links to existing `restaurant_tables` table
- Efficient queries per floor

**Schema**:
```sql
-- Current table positions (one per table)
CREATE TABLE table_positions (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES restaurant_tables(table_id) ON DELETE CASCADE,
  floor INTEGER NOT NULL DEFAULT 1,
  x INTEGER NOT NULL DEFAULT 0,
  y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 80,
  height INTEGER NOT NULL DEFAULT 80,
  rotation INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(table_id, floor)
);

-- Saved layout configurations
CREATE TABLE floor_plan_layouts (
  layout_id SERIAL PRIMARY KEY,
  layout_name VARCHAR(100) NOT NULL,
  floor INTEGER NOT NULL,
  description TEXT,
  layout_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(user_id)
);

CREATE INDEX idx_table_positions_floor ON table_positions(floor);
CREATE INDEX idx_floor_plan_layouts_floor ON floor_plan_layouts(floor);
```

**layout_data JSONB structure**:
```json
{
  "version": "1.0",
  "floor": 2,
  "canvasSettings": {
    "gridSize": 20,
    "zoom": 100
  },
  "tables": [
    {
      "tableId": 1,
      "x": 100,
      "y": 200,
      "width": 80,
      "height": 80,
      "rotation": 0
    }
  ]
}
```

### 7. API Design

**Decision**: RESTful API with batch operations support

**Endpoints**:
```
# Position Management
GET    /api/floor-plans/positions?floor={floor}
PUT    /api/floor-plans/positions/batch
GET    /api/floor-plans/positions/:tableId

# Layout Management
GET    /api/floor-plans/layouts?floor={floor}
POST   /api/floor-plans/layouts
GET    /api/floor-plans/layouts/:layoutId
PUT    /api/floor-plans/layouts/:layoutId
DELETE /api/floor-plans/layouts/:layoutId
POST   /api/floor-plans/layouts/:layoutId/activate

# Template Management
GET    /api/floor-plans/templates
GET    /api/floor-plans/templates/:templateId
POST   /api/floor-plans/templates/:templateId/apply
```

**Batch Update Request**:
```json
{
  "floor": 2,
  "positions": [
    {
      "tableId": 1,
      "x": 150,
      "y": 200,
      "width": 80,
      "height": 80,
      "rotation": 0
    },
    {
      "tableId": 2,
      "x": 250,
      "y": 200,
      "width": 80,
      "height": 80,
      "rotation": 0
    }
  ]
}
```

### 8. Keyboard Shortcuts System

**Decision**: Implement centralized keyboard event handler with modifier support

**Implementation**:
```typescript
interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: 'v', action: () => setTool('select'), description: 'Select Tool' },
  { key: 'h', action: () => setTool('pan'), description: 'Pan Tool' },
  { key: 't', action: () => setTool('add'), description: 'Add Table' },
  { key: 's', ctrl: true, action: saveLayout, description: 'Save Layout' },
  { key: 'z', ctrl: true, action: undo, description: 'Undo' },
  { key: 'z', ctrl: true, shift: true, action: redo, description: 'Redo' },
  // ... more shortcuts
];
```

### 9. Performance Optimization Strategy

**Techniques**:
1. **Virtual Scrolling**: Only render visible tables (for 100+ tables)
2. **Memoization**: React.memo for table components
3. **Debouncing**: Debounce drag events (16ms - 60fps)
4. **RequestAnimationFrame**: Smooth animations
5. **Canvas Caching**: Cache static canvas content
6. **Lazy Loading**: Load floor data on demand
7. **Optimistic Updates**: Update UI immediately, sync to server async

**Benchmarks to Meet**:
- 100 tables: < 16ms frame time (60fps)
- Pan/Zoom: Smooth at 60fps
- Drag: No lag or stutter
- Load time: < 500ms per floor
- Save time: < 1s for 100 tables

### 10. Accessibility Considerations

**Requirements**:
- Keyboard navigation for all features
- Screen reader support (ARIA labels)
- Focus indicators (visible outlines)
- Color contrast (WCAG AA)
- Alternative text for visual elements

**Implementation**:
```typescript
// Table component accessibility
<div
  role="button"
  tabIndex={0}
  aria-label={`Table ${tableNumber}, ${status}, capacity ${capacity}`}
  aria-pressed={isSelected}
  onKeyDown={handleKeyDown}
>
  {/* table content */}
</div>

// Keyboard navigation
function handleKeyDown(e: KeyboardEvent) {
  switch(e.key) {
    case 'ArrowUp':
      moveTable(0, -gridSize);
      break;
    case 'ArrowDown':
      moveTable(0, gridSize);
      break;
    // ... other arrow keys
    case 'Delete':
      deleteTable();
      break;
  }
}
```

## Technology Stack Justification

### Frontend Technologies
- **Next.js 16**: Existing framework, App Router for modern patterns
- **TypeScript**: Type safety for complex state management
- **Zustand**: Lightweight, performant state management
- **@dnd-kit/core**: Modern, accessible drag and drop
- **HTML5 Canvas**: Performance for grid and backgrounds
- **React**: Component-based UI with good ecosystem

### Backend Technologies
- **Express**: Existing framework
- **Prisma**: Existing ORM for type-safe database access
- **PostgreSQL**: Existing database with JSONB support for layouts
- **Socket.io**: Existing real-time infrastructure (for status updates)

## Security Considerations

1. **Authorization**: Verify user permissions before layout operations
2. **Input Validation**: Validate all position and layout data
3. **Rate Limiting**: Prevent abuse of batch update endpoints
4. **SQL Injection**: Use Prisma parameterized queries
5. **XSS Protection**: Sanitize layout names and descriptions

## Testing Strategy

1. **Unit Tests**: Individual tool functions, collision detection, grid snapping
2. **Integration Tests**: API endpoints, database operations
3. **E2E Tests**: Full editor workflows (Playwright)
4. **Performance Tests**: 100+ tables rendering, drag performance
5. **Accessibility Tests**: Keyboard navigation, screen reader (axe-core)
6. **Visual Regression**: Canvas rendering consistency (Percy/Chromatic)

## Deployment Considerations

1. **Feature Flag**: Roll out gradually with feature flag
2. **Database Migration**: Add new tables with zero downtime
3. **Backward Compatibility**: Existing table management unchanged
4. **Monitoring**: Track performance metrics, error rates
5. **Rollback Plan**: Feature flag can disable editor instantly

## Open Questions

1. Should we implement real-time collaboration in Phase 1 or defer?
   - **Recommendation**: Defer to future, focus on core functionality
   
2. How to handle custom table shapes (circle, oval)?
   - **Recommendation**: Support in Phase 3, start with rectangles
   
3. Mobile/tablet support priority?
   - **Recommendation**: Basic view support only, full editing is desktop-first
   
4. Import from external floor plan tools?
   - **Recommendation**: Future enhancement, manual setup for v1

## Success Metrics

1. **Adoption**: 80%+ of restaurants use visual editor within 3 months
2. **Performance**: 60fps maintained with 100+ tables
3. **Satisfaction**: 4.5+ star rating in user feedback
4. **Error Rate**: < 1% of save operations fail
5. **Accessibility**: Pass WCAG AA audit
