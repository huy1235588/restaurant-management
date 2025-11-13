# Responsive Design & Accessibility

## Tổng Quan

Hướng dẫn thiết kế responsive và accessibility cho table management UI, đảm bảo trải nghiệm tốt trên mọi thiết bị và cho mọi người dùng.

## Responsive Breakpoints

- **Desktop**: >1280px (Full features)
- **Tablet**: 768px - 1280px (Optimized layout)
- **Mobile**: <768px (Mobile-first design)

## Desktop Layout (>1280px)

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
├──────────────────┬──────────────────────────────────────────┤
│ Sidebar          │ Main Content (Floor Plan or List)        │
│ - Filters        │                                           │
│ - Quick Stats    │                                           │
│ - Saved Views    │                                           │
│                  │                                           │
│                  │                                           │
└──────────────────┴──────────────────────────────────────────┘
```

## Tablet Layout (768px - 1280px)

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Compact)                                             │
├─────────────────────────────────────────────────────────────┤
│ Main Content (Full Width)                                    │
│                                                               │
│ [Drawer Button] for Filters                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Layout (<768px)

```
┌─────────────────────┐
│ Header (Mobile)      │
├─────────────────────┤
│ Content (Stacked)    │
│                      │
│ [Card Layout]        │
│ [Card Layout]        │
│                      │
├─────────────────────┤
│ Bottom Nav           │
└─────────────────────┘
```

## Touch Gestures

- **Pinch**: Zoom floor plan
- **Swipe**: Pan canvas / Switch tabs
- **Double Tap**: Open details
- **Long Press**: Context menu

## Accessibility Features

### ARIA Labels

```html
<button
  role="button"
  aria-label="Table 5, capacity 6, available"
  aria-pressed="false"
>
  Table T5
</button>
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate elements |
| Enter | Activate |
| Space | Select |
| Arrow Keys | Move between tables |
| Esc | Close dialogs |

### Screen Reader Support

- Descriptive labels for all interactive elements
- Status announcements for changes
- Semantic HTML structure

### Color Contrast

- WCAG AA compliant (4.5:1 ratio)
- Not relying solely on color
- Pattern overlays for color-blind users

### Focus Indicators

```
┏━━━━━━━━━━┓
┃╔════════╗┃  ← Clear focus ring
┃║  T5    ║┃
┗━━━━━━━━━━┛
```

## Dark Mode Support

Auto-detect system preference or manual toggle

(Continuing with detailed responsive patterns, accessibility testing checklist, and implementation guidelines...)
