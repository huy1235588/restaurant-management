# Design Document: Add and Delete Table Tools

## Architecture

The Add and Delete tools integrate with the existing Visual Floor Plan editor architecture:

```
┌─────────────────────────────────────────────────────────────┐
│               Visual Floor Plan Editor                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              EditorToolbar                           │   │
│  │  [Select] [Pan] [Add] [Delete] [Grid] [Save]        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         VisualFloorPlanCanvas                        │   │
│  │                                                       │   │
│  │  • Tool State Management                             │   │
│  │  • Canvas Event Handlers                             │   │
│  │  • Collision Detection                               │   │
│  │  • Ghost Table Preview                               │   │
│  │  • Visual Feedback                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                 New Components                               │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │ QuickCreateDialog  │  │ DeleteConfirmDialog│            │
│  │ (Add Table)        │  │ (Delete Table)     │            │
│  └────────────────────┘  └────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              Zustand Store + API Layer                       │
│  • createTable()                                             │
│  • deleteTable()                                             │
│  • validateTablePlacement()                                  │
│  • recordAction() (for undo/redo)                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Add Table Tool

#### Tool Activation

**VisualFloorPlanView.tsx:**
```typescript
const [activeTool, setActiveTool] = useState<EditorTool>('select');
const [ghostTable, setGhostTable] = useState<GhostTable | null>(null);
const [isPlacingTable, setIsPlacingTable] = useState(false);

const handleToolChange = (tool: EditorTool) => {
  setActiveTool(tool);
  if (tool === 'add') {
    setIsPlacingTable(true);
  } else {
    setIsPlacingTable(false);
    setGhostTable(null);
  }
};
```

#### Ghost Table Preview

**GhostTablePreview.tsx (New Component):**
```typescript
interface GhostTablePreviewProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isValid: boolean; // false if collision detected
}

export function GhostTablePreview({ position, size, isValid }: GhostTablePreviewProps) {
  return (
    <div
      className={cn(
        "absolute border-2 border-dashed rounded-lg",
        "bg-opacity-20 transition-all pointer-events-none",
        isValid ? "border-blue-500 bg-blue-500" : "border-red-500 bg-red-500"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: `translate(-50%, -50%)`, // Center on cursor
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "text-xs font-semibold",
          isValid ? "text-blue-700" : "text-red-700"
        )}>
          {isValid ? "Click to place" : "Collision!"}
        </span>
      </div>
    </div>
  );
}
```

#### Canvas Click Handler

**VisualFloorPlanCanvas.tsx:**
```typescript
const handleCanvasClick = (event: React.MouseEvent) => {
  if (activeTool === 'add' && isPlacingTable) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate click position relative to canvas
    const x = (event.clientX - rect.left - panOffset.x) / zoom;
    const y = (event.clientY - rect.top - panOffset.y) / zoom;
    
    // Apply grid snapping if enabled
    const snappedPosition = showGrid 
      ? snapToGrid({ x, y }, gridSize) 
      : { x, y };
    
    // Check collision
    const hasCollision = detectCollision(
      snappedPosition,
      { width: 100, height: 100 }, // Default size
      tables
    );
    
    if (!hasCollision) {
      // Open quick create dialog
      setQuickCreateDialogOpen(true);
      setQuickCreatePosition(snappedPosition);
    } else {
      // Show error toast
      toast.error('Cannot place table here - collision detected');
    }
  }
};

const handleMouseMove = (event: React.MouseEvent) => {
  if (activeTool === 'add' && isPlacingTable) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (event.clientX - rect.left - panOffset.x) / zoom;
    const y = (event.clientY - rect.top - panOffset.y) / zoom;
    
    const snappedPosition = showGrid 
      ? snapToGrid({ x, y }, gridSize) 
      : { x, y };
    
    // Update ghost table preview
    const hasCollision = detectCollision(
      snappedPosition,
      { width: 100, height: 100 },
      tables
    );
    
    setGhostTable({
      position: snappedPosition,
      size: { width: 100, height: 100 },
      isValid: !hasCollision,
    });
  }
};
```

#### Quick Create Dialog

**QuickCreateTableDialog.tsx (New Component):**
```typescript
interface QuickCreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
  floor: number;
  onSuccess: (table: Table) => void;
}

export function QuickCreateTableDialog({
  open,
  onOpenChange,
  position,
  floor,
  onSuccess,
}: QuickCreateTableDialogProps) {
  const form = useForm<CreateTableInput>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      tableNumber: generateNextTableNumber(), // Auto-generate
      capacity: 4, // Default
      floor,
      positionX: position.x,
      positionY: position.y,
      width: 100,
      height: 100,
      rotation: 0,
      shape: 'rectangle',
    },
  });

  const handleSubmit = async (data: CreateTableInput) => {
    try {
      const newTable = await createTable(data);
      toast.success(`Table ${data.tableNumber} created`);
      onSuccess(newTable);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to create table');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
          <DialogDescription>
            Creating table at position ({position.x.toFixed(0)}, {position.y.toFixed(0)})
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tableNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Number *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 101" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Window Table" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Main Dining" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Table
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

#### Collision Detection Utility

**collision-detection.ts (New Utility):**
```typescript
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export function detectCollision(
  newTable: Rectangle,
  existingTables: Table[],
  buffer: number = 10 // Minimum spacing between tables
): boolean {
  for (const table of existingTables) {
    if (rectanglesOverlap(
      newTable,
      {
        x: table.positionX || 0,
        y: table.positionY || 0,
        width: table.width || 100,
        height: table.height || 100,
        rotation: table.rotation || 0,
      },
      buffer
    )) {
      return true;
    }
  }
  return false;
}

function rectanglesOverlap(
  rect1: Rectangle,
  rect2: Rectangle,
  buffer: number
): boolean {
  // Simple AABB collision for non-rotated rectangles
  if (!rect1.rotation && !rect2.rotation) {
    return !(
      rect1.x + rect1.width + buffer < rect2.x ||
      rect1.x > rect2.x + rect2.width + buffer ||
      rect1.y + rect1.height + buffer < rect2.y ||
      rect1.y > rect2.y + rect2.height + buffer
    );
  }
  
  // For rotated rectangles, use SAT (Separating Axis Theorem)
  // Implementation omitted for brevity
  return checkRotatedCollision(rect1, rect2, buffer);
}

export function snapToGrid(
  position: { x: number; y: number },
  gridSize: number
): { x: number; y: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

export function generateNextTableNumber(existingTables: Table[]): string {
  const numbers = existingTables
    .map(t => parseInt(t.tableNumber.replace(/\D/g, '')))
    .filter(n => !isNaN(n));
  
  if (numbers.length === 0) return '1';
  
  const maxNumber = Math.max(...numbers);
  return (maxNumber + 1).toString();
}
```

### 2. Delete Tool

#### Tool Activation

**VisualFloorPlanView.tsx:**
```typescript
const handleDeleteTool = () => {
  if (!selectedTableId) {
    toast.warning('Please select a table first');
    return;
  }
  
  const table = tables.find(t => t.tableId === selectedTableId);
  if (!table) return;
  
  // Open confirmation dialog
  setDeleteDialogOpen(true);
  setTableToDelete(table);
};

// Keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ... existing shortcuts ...
    
    if (e.key === 'Delete' && selectedTableId && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleDeleteTool();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedTableId]);
```

#### Visual Feedback

**DraggableTable.tsx:**
```typescript
const isDeleteMode = activeTool === 'delete';
const isSelected = tableId === selectedTableId;

return (
  <div
    className={cn(
      "absolute rounded-lg border-2 transition-all cursor-pointer",
      isSelected && "ring-2 ring-blue-500",
      isDeleteMode && isSelected && "ring-2 ring-red-500 bg-red-50",
      // ... other classes
    )}
    // ... other props
  >
    {isDeleteMode && isSelected && (
      <div className="absolute inset-0 bg-red-500 bg-opacity-10 flex items-center justify-center">
        <Trash2 className="w-8 h-8 text-red-500" />
      </div>
    )}
    {/* ... table content */}
  </div>
);
```

#### Delete Confirmation Dialog

**DeleteTableConfirmDialog.tsx (New Component):**
```typescript
interface DeleteTableConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  onConfirm: () => void;
}

export function DeleteTableConfirmDialog({
  open,
  onOpenChange,
  table,
  onConfirm,
}: DeleteTableConfirmDialogProps) {
  if (!table) return null;
  
  const validation = validateTableDeletion(table);
  const hasActiveOrder = table.status === 'occupied'; // Simplified check
  const hasReservation = table.status === 'reserved';
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Table {table.tableNumber}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You are about to delete <strong>{table.tableName || `Table ${table.tableNumber}`}</strong>.
            </p>
            
            {/* Table details */}
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <div><strong>Number:</strong> {table.tableNumber}</div>
              <div><strong>Capacity:</strong> {table.capacity} seats</div>
              <div><strong>Status:</strong> <TableStatusBadge status={table.status} /></div>
              {table.floor && <div><strong>Floor:</strong> {table.floor}</div>}
              {table.section && <div><strong>Section:</strong> {table.section}</div>}
            </div>
            
            {/* Warnings */}
            {hasActiveOrder && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Active Order Detected</AlertTitle>
                <AlertDescription>
                  This table has an active order. Deleting it may cause issues.
                  Please complete or cancel the order first.
                </AlertDescription>
              </Alert>
            )}
            
            {hasReservation && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Reservation Exists</AlertTitle>
                <AlertDescription>
                  This table has a reservation. Consider canceling the reservation first.
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-destructive font-medium">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={hasActiveOrder}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {hasActiveOrder ? 'Cannot Delete' : 'Delete Table'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function validateTableDeletion(table: Table): {
  canDelete: boolean;
  reason?: string;
} {
  if (table.status === 'occupied') {
    return {
      canDelete: false,
      reason: 'Table has an active order',
    };
  }
  
  // Add more validation as needed
  return { canDelete: true };
}
```

#### Delete Handler

**VisualFloorPlanView.tsx:**
```typescript
const handleConfirmDelete = async () => {
  if (!tableToDelete) return;
  
  try {
    // Record action for undo
    recordAction({
      type: 'delete',
      tableId: tableToDelete.tableId,
      previousState: tableToDelete,
    });
    
    // Delete from store and API
    await deleteTable(tableToDelete.tableId);
    
    // Visual feedback
    toast.success(`Table ${tableToDelete.tableNumber} deleted`);
    
    // Clear selection
    setSelectedTableId(null);
    setTableToDelete(null);
    setDeleteDialogOpen(false);
    
    // Switch back to select tool
    setActiveTool('select');
    
    // Mark as unsaved change
    setHasUnsavedChanges(true);
  } catch (error) {
    toast.error('Failed to delete table');
    console.error(error);
  }
};
```

## Cursor Management

**cursor-styles.css:**
```css
/* Add tool cursor */
.cursor-add-table {
  cursor: crosshair;
}

/* Delete tool cursor */
.cursor-delete-table {
  cursor: not-allowed;
}

/* Canvas when adding */
.canvas-add-mode {
  cursor: crosshair;
}

.canvas-add-mode:hover {
  cursor: crosshair;
}
```

**VisualFloorPlanCanvas.tsx:**
```typescript
const canvasClassName = cn(
  "relative w-full h-full overflow-hidden",
  activeTool === 'add' && "cursor-add-table",
  activeTool === 'delete' && "cursor-delete-table",
  activeTool === 'pan' && "cursor-grab",
  activeTool === 'select' && "cursor-default"
);
```

## State Management

**tableStore.ts enhancements:**
```typescript
interface TableState {
  // ... existing state ...
  
  // Add tool state
  ghostTable: GhostTable | null;
  isPlacingTable: boolean;
  
  // Actions
  setGhostTable: (ghost: GhostTable | null) => void;
  setIsPlacingTable: (placing: boolean) => void;
}

// Actions
setGhostTable: (ghost) => set({ ghostTable: ghost }),
setIsPlacingTable: (placing) => set({ isPlacingTable: placing }),
```

## Validation Rules

**table-validation.ts:**
```typescript
export interface TableValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTablePlacement(
  position: { x: number; y: number },
  size: { width: number; height: number },
  existingTables: Table[],
  canvasBounds: { width: number; height: number }
): TableValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check canvas bounds
  if (position.x < 0 || position.y < 0 ||
      position.x + size.width > canvasBounds.width ||
      position.y + size.height > canvasBounds.height) {
    errors.push('Table is outside canvas bounds');
  }
  
  // Check collision
  if (detectCollision({ ...position, ...size }, existingTables)) {
    errors.push('Table overlaps with existing table');
  }
  
  // Check spacing (warning only)
  const nearbyTables = findNearbyTables(position, existingTables, 20);
  if (nearbyTables.length > 0) {
    warnings.push('Table is very close to other tables');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateTableDeletion(table: Table): TableValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (table.status === 'occupied') {
    errors.push('Cannot delete table with active order');
  }
  
  if (table.status === 'reserved') {
    warnings.push('Table has a reservation');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

## Undo/Redo Integration

**action-history.ts:**
```typescript
export type EditorAction =
  | { type: 'create'; table: Table }
  | { type: 'delete'; tableId: string; previousState: Table }
  | { type: 'move'; tableId: string; from: Position; to: Position }
  | { type: 'resize'; tableId: string; from: Size; to: Size }
  | { type: 'rotate'; tableId: string; from: number; to: number };

export function recordAction(action: EditorAction): void {
  const { history, historyIndex } = useTableStore.getState();
  
  // Truncate future history if we're not at the end
  const newHistory = history.slice(0, historyIndex + 1);
  
  // Add new action
  newHistory.push(action);
  
  // Limit history size
  if (newHistory.length > 50) {
    newHistory.shift();
  }
  
  useTableStore.setState({
    history: newHistory,
    historyIndex: newHistory.length - 1,
  });
}

export async function undoAction(): Promise<void> {
  const { history, historyIndex, tables } = useTableStore.getState();
  
  if (historyIndex < 0) return;
  
  const action = history[historyIndex];
  
  switch (action.type) {
    case 'create':
      // Remove the created table
      await deleteTable(action.table.tableId);
      break;
      
    case 'delete':
      // Restore the deleted table
      await createTable(action.previousState);
      break;
      
    // ... other cases
  }
  
  useTableStore.setState({ historyIndex: historyIndex - 1 });
}
```

## Canvas Pan Boundaries

### Boundary Calculation

**pan-boundaries.ts (New Utility):**
```typescript
export interface CanvasBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface PanOffset {
  x: number;
  y: number;
}

/**
 * Calculate canvas boundaries based on table positions
 */
export function calculateCanvasBounds(
  tables: Table[],
  margin: number = 500,
  minCanvasSize: { width: number; height: number } = { width: 2000, height: 2000 }
): CanvasBounds {
  if (tables.length === 0) {
    // No tables - return default bounds
    return {
      minX: -margin,
      maxX: minCanvasSize.width + margin,
      minY: -margin,
      maxY: minCanvasSize.height + margin,
    };
  }
  
  // Find bounding box of all tables
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  tables.forEach(table => {
    const x = table.positionX || 0;
    const y = table.positionY || 0;
    const width = table.width || 100;
    const height = table.height || 100;
    
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + width);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + height);
  });
  
  // Add margin
  minX -= margin;
  maxX += margin;
  minY -= margin;
  maxY += margin;
  
  // Ensure minimum canvas size
  const currentWidth = maxX - minX;
  const currentHeight = maxY - minY;
  
  if (currentWidth < minCanvasSize.width) {
    const diff = minCanvasSize.width - currentWidth;
    minX -= diff / 2;
    maxX += diff / 2;
  }
  
  if (currentHeight < minCanvasSize.height) {
    const diff = minCanvasSize.height - currentHeight;
    minY -= diff / 2;
    maxY += diff / 2;
  }
  
  return { minX, maxX, minY, maxY };
}

/**
 * Constrain pan offset within boundaries
 */
export function constrainPanOffset(
  panOffset: PanOffset,
  canvasBounds: CanvasBounds,
  viewportSize: { width: number; height: number },
  zoom: number
): PanOffset {
  const scaledViewportWidth = viewportSize.width / zoom;
  const scaledViewportHeight = viewportSize.height / zoom;
  
  // Calculate max pan offset (how far right/down we can pan)
  const maxPanX = canvasBounds.maxX - scaledViewportWidth;
  const maxPanY = canvasBounds.maxY - scaledViewportHeight;
  
  // Constrain pan offset
  const constrainedX = Math.max(
    canvasBounds.minX,
    Math.min(maxPanX, panOffset.x)
  );
  
  const constrainedY = Math.max(
    canvasBounds.minY,
    Math.min(maxPanY, panOffset.y)
  );
  
  return {
    x: constrainedX,
    y: constrainedY,
  };
}

/**
 * Calculate center position to fit all tables in view
 */
export function calculateFitToViewOffset(
  tables: Table[],
  viewportSize: { width: number; height: number },
  zoom: number,
  padding: number = 50
): PanOffset {
  if (tables.length === 0) {
    return { x: 0, y: 0 };
  }
  
  const bounds = calculateCanvasBounds(tables, padding);
  
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  
  const offsetX = centerX - (viewportSize.width / zoom) / 2;
  const offsetY = centerY - (viewportSize.height / zoom) / 2;
  
  return { x: offsetX, y: offsetY };
}
```

### Pan Handler with Boundaries

**VisualFloorPlanCanvas.tsx:**
```typescript
const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
const [canvasBounds, setCanvasBounds] = useState<CanvasBounds | null>(null);
const canvasRef = useRef<HTMLDivElement>(null);

// Recalculate bounds when tables change
useEffect(() => {
  const bounds = calculateCanvasBounds(tables, 500);
  setCanvasBounds(bounds);
}, [tables]);

const handlePan = useCallback((deltaX: number, deltaY: number) => {
  setPanOffset(prev => {
    const newOffset = {
      x: prev.x + deltaX / zoom,
      y: prev.y + deltaY / zoom,
    };
    
    if (!canvasBounds || !canvasRef.current) return newOffset;
    
    const viewportSize = {
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
    };
    
    // Constrain within bounds
    return constrainPanOffset(newOffset, canvasBounds, viewportSize, zoom);
  });
}, [zoom, canvasBounds]);

// Fit to view button handler
const handleFitToView = useCallback(() => {
  if (!canvasRef.current) return;
  
  const viewportSize = {
    width: canvasRef.current.clientWidth,
    height: canvasRef.current.clientHeight,
  };
  
  const newOffset = calculateFitToViewOffset(tables, viewportSize, zoom);
  setPanOffset(newOffset);
}, [tables, zoom]);

// Reset view button handler
const handleResetView = useCallback(() => {
  setPanOffset({ x: 0, y: 0 });
  setZoom(1);
}, []);
```

### Toolbar Additions

**EditorToolbar.tsx:**
```typescript
// Add new buttons to toolbar
<Separator orientation="vertical" className="mx-1 h-6" />

<Button
  variant="outline"
  size="sm"
  onClick={onFitToView}
  title={t('tables.visualEditor.fitToView', 'Fit to View')}
>
  <Maximize2 className="w-4 h-4" />
</Button>

<Button
  variant="outline"
  size="sm"
  onClick={onResetView}
  title={t('tables.visualEditor.resetView', 'Reset View')}
>
  <Home className="w-4 h-4" />
</Button>
```

### Visual Boundary Indicator (Optional)

**BoundaryIndicator.tsx (New Component):**
```typescript
interface BoundaryIndicatorProps {
  bounds: CanvasBounds;
  visible: boolean;
}

export function BoundaryIndicator({ bounds, visible }: BoundaryIndicatorProps) {
  if (!visible) return null;
  
  return (
    <div
      className="absolute border-2 border-dashed border-gray-300 pointer-events-none opacity-50"
      style={{
        left: bounds.minX,
        top: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
      }}
    >
      <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
        Working Area
      </div>
    </div>
  );
}
```

## Performance Considerations

1. **Collision Detection Optimization:**
   - Use spatial partitioning (quadtree) for large table counts
   - Only check nearby tables within bounding box
   - Cache collision results during mouse move

2. **Ghost Table Rendering:**
   - Use CSS transforms for smooth positioning
   - Debounce collision checks during mouse move (16ms)
   - Use requestAnimationFrame for updates

3. **Dialog Rendering:**
   - Lazy load dialog components
   - Pre-populate form defaults to minimize render time
   - Use controlled components for instant feedback

4. **Pan Boundary Calculation:**
   - Memoize boundary calculations
   - Only recalculate when tables are added/removed/moved
   - Cache viewport size to avoid constant DOM queries

## 5. Duplicate Table Tool

### Duplicate Handler

**table-duplication.ts (New Utility):**
```typescript
export interface DuplicateOffset {
  x: number;
  y: number;
}

export function duplicateTable(
  table: Table,
  existingTables: Table[],
  offset: DuplicateOffset = { x: 50, y: 50 }
): Partial<Table> {
  return {
    tableNumber: generateNextTableNumber(existingTables),
    tableName: table.tableName ? `${table.tableName} (Copy)` : undefined,
    capacity: table.capacity,
    minCapacity: table.minCapacity,
    floor: table.floor,
    section: table.section,
    positionX: (table.positionX || 0) + offset.x,
    positionY: (table.positionY || 0) + offset.y,
    width: table.width,
    height: table.height,
    rotation: table.rotation,
    shape: table.shape,
    status: 'available', // Always start as available
    isActive: true,
  };
}

export function duplicateMultipleTables(
  tables: Table[],
  existingTables: Table[],
  offset: DuplicateOffset = { x: 50, y: 50 }
): Partial<Table>[] {
  return tables.map(table => duplicateTable(table, existingTables, offset));
}
```

**VisualFloorPlanView.tsx:**
```typescript
const handleDuplicate = useCallback(async () => {
  if (selectedTableIds.length === 0) {
    toast.warning('Please select table(s) to duplicate');
    return;
  }
  
  const tablesToDuplicate = tables.filter(t => 
    selectedTableIds.includes(t.tableId)
  );
  
  const duplicates = duplicateMultipleTables(tablesToDuplicate, tables);
  
  try {
    // Create all duplicates
    for (const duplicate of duplicates) {
      await createTable(duplicate);
      recordAction({ type: 'create', table: duplicate as Table });
    }
    
    toast.success(`Duplicated ${duplicates.length} table(s)`);
    setHasUnsavedChanges(true);
  } catch (error) {
    toast.error('Failed to duplicate tables');
  }
}, [selectedTableIds, tables]);

// Keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      handleDuplicate();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleDuplicate]);
```

## 6. Multi-Select & Bulk Operations

### Selection State Management

**selection-state.ts:**
```typescript
export type SelectionMode = 'single' | 'multi' | 'box';

export interface SelectionState {
  selectedIds: Set<string>;
  mode: SelectionMode;
  boxSelection: {
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
  };
}

export function toggleSelection(
  currentSelection: Set<string>,
  tableId: string,
  mode: 'add' | 'remove' | 'toggle' = 'toggle'
): Set<string> {
  const newSelection = new Set(currentSelection);
  
  if (mode === 'add' || (mode === 'toggle' && !newSelection.has(tableId))) {
    newSelection.add(tableId);
  } else {
    newSelection.delete(tableId);
  }
  
  return newSelection;
}

export function selectInBox(
  tables: Table[],
  boxStart: { x: number; y: number },
  boxEnd: { x: number; y: number }
): Set<string> {
  const minX = Math.min(boxStart.x, boxEnd.x);
  const maxX = Math.max(boxStart.x, boxEnd.x);
  const minY = Math.min(boxStart.y, boxEnd.y);
  const maxY = Math.max(boxStart.y, boxEnd.y);
  
  const selected = new Set<string>();
  
  tables.forEach(table => {
    const x = table.positionX || 0;
    const y = table.positionY || 0;
    const width = table.width || 100;
    const height = table.height || 100;
    
    // Check if table intersects with selection box
    if (x < maxX && x + width > minX && y < maxY && y + height > minY) {
      selected.add(table.tableId);
    }
  });
  
  return selected;
}
```

### Selection Box Component

**SelectionBox.tsx (New Component):**
```typescript
interface SelectionBoxProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  zoom: number;
}

export function SelectionBox({ start, end, zoom }: SelectionBoxProps) {
  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  
  return (
    <div
      className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 pointer-events-none"
      style={{
        left: minX,
        top: minY,
        width,
        height,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
    />
  );
}
```

### Bulk Move Handler

**VisualFloorPlanCanvas.tsx:**
```typescript
const handleBulkDrag = useCallback((delta: { x: number; y: number }) => {
  if (selectedTableIds.size === 0) return;
  
  const updates = Array.from(selectedTableIds).map(tableId => {
    const table = tables.find(t => t.tableId === tableId);
    if (!table) return null;
    
    return {
      tableId,
      positionX: (table.positionX || 0) + delta.x,
      positionY: (table.positionY || 0) + delta.y,
    };
  }).filter(Boolean);
  
  // Update all positions
  updates.forEach(update => {
    updateTablePosition(update.tableId, update.positionX, update.positionY);
  });
  
  setHasUnsavedChanges(true);
}, [selectedTableIds, tables]);
```

## 7. Alignment & Distribution Tools

### Alignment Utilities

**alignment-tools.ts (New Utility):**
```typescript
export type AlignmentType = 
  | 'left' | 'right' | 'top' | 'bottom' 
  | 'center-horizontal' | 'center-vertical';

export type DistributionType = 'horizontal' | 'vertical';

export interface AlignmentResult {
  tableId: string;
  positionX: number;
  positionY: number;
}

export function alignTables(
  tables: Table[],
  type: AlignmentType
): AlignmentResult[] {
  if (tables.length < 2) return [];
  
  const results: AlignmentResult[] = [];
  
  switch (type) {
    case 'left': {
      const minX = Math.min(...tables.map(t => t.positionX || 0));
      tables.forEach(table => {
        results.push({
          tableId: table.tableId,
          positionX: minX,
          positionY: table.positionY || 0,
        });
      });
      break;
    }
    
    case 'right': {
      const maxX = Math.max(...tables.map(t => 
        (t.positionX || 0) + (t.width || 100)
      ));
      tables.forEach(table => {
        results.push({
          tableId: table.tableId,
          positionX: maxX - (table.width || 100),
          positionY: table.positionY || 0,
        });
      });
      break;
    }
    
    case 'top': {
      const minY = Math.min(...tables.map(t => t.positionY || 0));
      tables.forEach(table => {
        results.push({
          tableId: table.tableId,
          positionX: table.positionX || 0,
          positionY: minY,
        });
      });
      break;
    }
    
    case 'bottom': {
      const maxY = Math.max(...tables.map(t => 
        (t.positionY || 0) + (t.height || 100)
      ));
      tables.forEach(table => {
        results.push({
          tableId: table.tableId,
          positionX: table.positionX || 0,
          positionY: maxY - (table.height || 100),
        });
      });
      break;
    }
    
    case 'center-horizontal': {
      const avgX = tables.reduce((sum, t) => 
        sum + (t.positionX || 0) + (t.width || 100) / 2, 0
      ) / tables.length;
      
      tables.forEach(table => {
        results.push({
          tableId: table.tableId,
          positionX: avgX - (table.width || 100) / 2,
          positionY: table.positionY || 0,
        });
      });
      break;
    }
    
    case 'center-vertical': {
      const avgY = tables.reduce((sum, t) => 
        sum + (t.positionY || 0) + (t.height || 100) / 2, 0
      ) / tables.length;
      
      tables.forEach(table => {
        results.push({
          tableId: table.tableId,
          positionX: table.positionX || 0,
          positionY: avgY - (table.height || 100) / 2,
        });
      });
      break;
    }
  }
  
  return results;
}

export function distributeTables(
  tables: Table[],
  type: DistributionType
): AlignmentResult[] {
  if (tables.length < 3) return [];
  
  const sorted = type === 'horizontal'
    ? [...tables].sort((a, b) => (a.positionX || 0) - (b.positionX || 0))
    : [...tables].sort((a, b) => (a.positionY || 0) - (b.positionY || 0));
  
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  
  const results: AlignmentResult[] = [];
  
  if (type === 'horizontal') {
    const totalWidth = sorted.reduce((sum, t) => sum + (t.width || 100), 0);
    const availableSpace = (last.positionX || 0) + (last.width || 100) - (first.positionX || 0) - totalWidth;
    const gap = availableSpace / (tables.length - 1);
    
    let currentX = first.positionX || 0;
    sorted.forEach((table, index) => {
      results.push({
        tableId: table.tableId,
        positionX: currentX,
        positionY: table.positionY || 0,
      });
      currentX += (table.width || 100) + gap;
    });
  } else {
    const totalHeight = sorted.reduce((sum, t) => sum + (t.height || 100), 0);
    const availableSpace = (last.positionY || 0) + (last.height || 100) - (first.positionY || 0) - totalHeight;
    const gap = availableSpace / (tables.length - 1);
    
    let currentY = first.positionY || 0;
    sorted.forEach((table, index) => {
      results.push({
        tableId: table.tableId,
        positionX: table.positionX || 0,
        positionY: currentY,
      });
      currentY += (table.height || 100) + gap;
    });
  }
  
  return results;
}
```

### Alignment Toolbar Component

**AlignmentToolbar.tsx (New Component):**
```typescript
interface AlignmentToolbarProps {
  visible: boolean;
  onAlign: (type: AlignmentType) => void;
  onDistribute: (type: DistributionType) => void;
  selectedCount: number;
}

export function AlignmentToolbar({
  visible,
  onAlign,
  onDistribute,
  selectedCount,
}: AlignmentToolbarProps) {
  if (!visible || selectedCount < 2) return null;
  
  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-background border shadow-lg rounded-lg p-2 flex items-center gap-1 z-50">
      <span className="text-xs text-muted-foreground px-2">
        {selectedCount} selected
      </span>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Alignment buttons */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAlign('left')}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>
        
        {/* Similar for other alignment options */}
      </TooltipProvider>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Distribution buttons (only if 3+ selected) */}
      {selectedCount >= 3 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDistribute('horizontal')}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDistribute('vertical')}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
```

## 8. Zoom to Selection

**zoom-utilities.ts:**
```typescript
export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateZoomToFit(
  bounds: ViewportBounds,
  viewportSize: { width: number; height: number },
  padding: number = 50
): { zoom: number; panOffset: { x: number; y: number } } {
  const scaleX = viewportSize.width / (bounds.width + padding * 2);
  const scaleY = viewportSize.height / (bounds.height + padding * 2);
  
  const zoom = Math.min(scaleX, scaleY, 2); // Max 200% zoom
  
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  
  const panOffset = {
    x: centerX - viewportSize.width / (2 * zoom),
    y: centerY - viewportSize.height / (2 * zoom),
  };
  
  return { zoom, panOffset };
}

export function getTablesBounds(tables: Table[]): ViewportBounds {
  if (tables.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  const minX = Math.min(...tables.map(t => t.positionX || 0));
  const minY = Math.min(...tables.map(t => t.positionY || 0));
  const maxX = Math.max(...tables.map(t => (t.positionX || 0) + (t.width || 100)));
  const maxY = Math.max(...tables.map(t => (t.positionY || 0) + (t.height || 100)));
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
```

**VisualFloorPlanView.tsx:**
```typescript
const handleZoomToSelection = useCallback(() => {
  if (selectedTableIds.size === 0) {
    toast.warning('No tables selected');
    return;
  }
  
  const selectedTables = tables.filter(t => selectedTableIds.has(t.tableId));
  const bounds = getTablesBounds(selectedTables);
  
  if (!canvasRef.current) return;
  
  const viewportSize = {
    width: canvasRef.current.clientWidth,
    height: canvasRef.current.clientHeight,
  };
  
  const { zoom: newZoom, panOffset: newOffset } = calculateZoomToFit(
    bounds,
    viewportSize,
    100 // padding
  );
  
  // Animate zoom and pan
  animateViewChange(zoom, panOffset, newZoom, newOffset, 500);
}, [selectedTableIds, tables, zoom, panOffset]);

// Keyboard shortcut: F key
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleZoomToSelection();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleZoomToSelection]);
```

## 9. Ruler & Measurement Tools

### Ruler Components

**HorizontalRuler.tsx (New Component):**
```typescript
interface RulerProps {
  zoom: number;
  panOffset: number;
  width: number;
  unit: 'px' | 'cm' | 'in';
}

export function HorizontalRuler({ zoom, panOffset, width, unit }: RulerProps) {
  const tickInterval = unit === 'px' ? 50 : 10; // 50px or 10cm
  const ticks = [];
  
  const startValue = Math.floor(panOffset / tickInterval) * tickInterval;
  const endValue = startValue + width / zoom;
  
  for (let value = startValue; value <= endValue; value += tickInterval) {
    const position = (value - panOffset) * zoom;
    
    ticks.push(
      <div
        key={value}
        className="absolute flex flex-col items-center"
        style={{ left: position }}
      >
        <div className="w-px h-3 bg-gray-400" />
        <span className="text-[10px] text-gray-500 mt-0.5">
          {formatRulerValue(value, unit)}
        </span>
      </div>
    );
  }
  
  return (
    <div className="absolute top-0 left-0 right-0 h-8 bg-gray-50 border-b border-gray-200 overflow-hidden">
      {ticks}
    </div>
  );
}
```

### Measurement Overlay

**MeasurementOverlay.tsx (New Component):**
```typescript
interface MeasurementOverlayProps {
  table: Table;
  mode: 'move' | 'resize' | 'rotate' | null;
}

export function MeasurementOverlay({ table, mode }: MeasurementOverlayProps) {
  if (!mode) return null;
  
  const x = table.positionX || 0;
  const y = table.positionY || 0;
  const width = table.width || 100;
  const height = table.height || 100;
  const rotation = table.rotation || 0;
  
  return (
    <div className="absolute pointer-events-none">
      {mode === 'move' && (
        <div
          className="absolute bg-black text-white text-xs px-2 py-1 rounded"
          style={{
            left: x + width / 2,
            top: y - 30,
            transform: 'translate(-50%, 0)',
          }}
        >
          X: {x.toFixed(0)}, Y: {y.toFixed(0)}
        </div>
      )}
      
      {mode === 'resize' && (
        <div
          className="absolute bg-black text-white text-xs px-2 py-1 rounded"
          style={{
            left: x + width / 2,
            top: y - 30,
            transform: 'translate(-50%, 0)',
          }}
        >
          {width.toFixed(0)} × {height.toFixed(0)}
        </div>
      )}
      
      {mode === 'rotate' && (
        <div
          className="absolute bg-black text-white text-xs px-2 py-1 rounded"
          style={{
            left: x + width / 2,
            top: y - 30,
            transform: 'translate(-50%, 0)',
          }}
        >
          {rotation.toFixed(0)}°
        </div>
      )}
    </div>
  );
}
```

## 10. Lock/Unlock Tables

### Lock State Management

**table-locking.ts:**
```typescript
export interface LockState {
  lockedTableIds: Set<string>;
}

export function toggleLock(
  currentLocked: Set<string>,
  tableId: string
): Set<string> {
  const newLocked = new Set(currentLocked);
  
  if (newLocked.has(tableId)) {
    newLocked.delete(tableId);
  } else {
    newLocked.add(tableId);
  }
  
  return newLocked;
}

export function isTableLocked(
  lockedTableIds: Set<string>,
  tableId: string
): boolean {
  return lockedTableIds.has(tableId);
}
```

**VisualFloorPlanView.tsx:**
```typescript
const [lockedTableIds, setLockedTableIds] = useState<Set<string>>(new Set());

const handleToggleLock = useCallback(() => {
  if (selectedTableIds.size === 0) {
    toast.warning('Please select table(s) to lock/unlock');
    return;
  }
  
  const allLocked = Array.from(selectedTableIds).every(id => 
    lockedTableIds.has(id)
  );
  
  setLockedTableIds(prev => {
    const newLocked = new Set(prev);
    
    selectedTableIds.forEach(id => {
      if (allLocked) {
        newLocked.delete(id);
      } else {
        newLocked.add(id);
      }
    });
    
    return newLocked;
  });
  
  toast.success(
    allLocked 
      ? `Unlocked ${selectedTableIds.size} table(s)` 
      : `Locked ${selectedTableIds.size} table(s)`
  );
}, [selectedTableIds, lockedTableIds]);

// Keyboard shortcut: Ctrl+L
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      handleToggleLock();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleToggleLock]);
```

**DraggableTable.tsx:**
```typescript
const isLocked = lockedTableIds.has(tableId);

// Prevent drag if locked
const handleDragStart = (e: DragEvent) => {
  if (isLocked) {
    e.preventDefault();
    toast.warning('Table is locked. Unlock to edit.');
    return;
  }
  // ... normal drag logic
};

return (
  <div
    className={cn(
      "absolute rounded-lg border-2 transition-all",
      isLocked && "opacity-85 cursor-not-allowed",
      // ... other classes
    )}
    draggable={!isLocked}
    onDragStart={handleDragStart}
  >
    {isLocked && (
      <div className="absolute top-1 right-1 bg-gray-800 text-white rounded p-1">
        <Lock className="w-3 h-3" />
      </div>
    )}
    {/* ... table content */}
  </div>
);
```

## Accessibility

- Add ARIA labels to tool buttons
- Ensure keyboard shortcuts are documented
- Provide screen reader announcements for tool activation
- Make dialogs keyboard-navigable
- Support Escape key to cancel operations
- Add focus indicators for selected tables
- Announce selection count to screen readers
- Support Tab navigation through tools

## Documentation Updates

Add to user guide:
- Add Table tool usage instructions
- Delete tool usage instructions
- Duplicate tool usage (Ctrl+D)
- Multi-select techniques (Shift+Click, selection box)
- Alignment and distribution tools
- Zoom to selection (F key)
- Ruler and measurements (R key)
- Lock/unlock tables (Ctrl+L)
- Keyboard shortcut reference
- Collision detection explanation
- Best practices for table placement

Add to developer guide:
- Collision detection algorithm
- Tool state management patterns
- Undo/redo implementation
- Validation rules
- Selection state management
- Alignment algorithms
- Performance optimization for multi-select
- Lock state persistence

---

**Version**: 2.0.0
**Last Updated**: November 2025
