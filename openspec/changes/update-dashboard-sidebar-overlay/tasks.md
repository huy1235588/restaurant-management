# Implementation Tasks

## 1. Update Base UI Sidebar Component

- [x] 1.1 Modify `app/client/src/components/ui/sidebar.tsx` to support overlay mode by default
- [x] 1.2 Add z-index styling to ensure sidebar overlays content (z-50 or similar)
- [x] 1.3 Ensure backdrop/overlay element is rendered when sidebar is open
- [x] 1.4 Add smooth slide-in/slide-out animations (200-300ms transition)
- [x] 1.5 Implement click-outside detection to close sidebar
- [x] 1.6 Add Escape key handler to close sidebar
- [x] 1.7 Update ARIA attributes for accessibility (aria-expanded, aria-hidden, role)

## 2. Update TopBar Component with Logo

- [x] 2.1 Add application logo to `app/client/src/components/layouts/TopBar.tsx` next to SidebarTrigger
- [x] 2.2 Position toggle button at far left of header
- [x] 2.3 Position logo immediately adjacent to toggle button
- [x] 2.4 Calculate and document exact pixel position of logo (for alignment reference)
- [x] 2.5 Ensure logo remains visible when sidebar is collapsed
- [x] 2.6 Add appropriate spacing and visual hierarchy

## 3. Update DashboardSidebar Component

- [x] 3.1 Add logo at top of `app/client/src/components/layouts/DashboardSidebar.tsx` (in SidebarHeader)
- [x] 3.2 Apply CSS to align sidebar logo with header logo position (position: absolute or fixed calculations)
- [x] 3.3 Ensure logo dimensions and styling match header logo exactly
- [x] 3.4 Add navigation items below logo in SidebarContent
- [x] 3.5 Test visual alignment with header logo (pixel-perfect positioning)
- [x] 3.6 Ensure sidebar expands as overlay without pushing content

## 4. Handle Mobile-Specific Behavior

- [x] 4.1 Verify mobile sidebar behavior uses full-screen or near-full-screen overlay
- [x] 4.2 Consider consolidating `MobileSidebar.tsx` logic with main sidebar if redundant
- [x] 4.3 Ensure close button (X icon) is visible on mobile
- [x] 4.4 Test responsive breakpoints (desktop ≥768px, mobile <768px)
- [x] 4.5 Verify click-outside works correctly on mobile

## 5. Implement Click-Outside Detection

- [x] 5.1 Add click event listener to backdrop/overlay element
- [x] 5.2 Add click event listener to document when sidebar is open
- [x] 5.3 Prevent click-through to underlying content when clicking backdrop
- [x] 5.4 Ensure clicks inside sidebar content do NOT close the sidebar
- [x] 5.5 Clean up event listeners when sidebar closes or component unmounts

## 6. Animation and Transitions

- [x] 6.1 Add CSS transitions for sidebar slide-in (transform: translateX)
- [x] 6.2 Add backdrop fade-in/fade-out animation
- [x] 6.3 Use appropriate easing function (ease-in-out or similar)
- [x] 6.4 Set animation duration to 200-300ms
- [x] 6.5 Test for smooth performance (no jank or layout shifts)
- [x] 6.6 Consider using Framer Motion if more complex animations needed

## 7. Keyboard Accessibility

- [x] 7.1 Verify keyboard shortcut (Ctrl+B / Cmd+B) toggles sidebar
- [x] 7.2 Implement Escape key handler to close sidebar
- [x] 7.3 Manage focus: move to sidebar when opening, return to toggle when closing
- [x] 7.4 Test tab navigation within sidebar
- [x] 7.5 Ensure focus trap when sidebar is open (optional but recommended)

## 8. Testing and Validation

- [x] 8.1 Test sidebar overlay on desktop viewports (1920x1080, 1366x768)
- [x] 8.2 Test sidebar overlay on mobile viewports (375x667, 414x896)
- [x] 8.3 Test sidebar overlay on tablet viewports (768x1024)
- [x] 8.4 Verify logo alignment is pixel-perfect across different screen sizes
- [x] 8.5 Test click-outside functionality (backdrop click, content click)
- [x] 8.6 Test keyboard navigation (Escape, Tab, Ctrl+B)
- [ ] 8.7 Test with screen reader (NVDA, JAWS, or VoiceOver)
- [x] 8.8 Verify no layout shifts when sidebar opens/closes
- [x] 8.9 Check z-index stacking with other overlays (modals, dropdowns)

## 9. Documentation and Cleanup

- [x] 9.1 Update component JSDoc comments with overlay behavior
- [x] 9.2 Document logo alignment technique (CSS approach, pixel calculations)
- [x] 9.3 Add code comments for click-outside implementation
- [x] 9.4 Consider removing or refactoring `MobileSidebar.tsx` if consolidated
- [x] 9.5 Update any relevant documentation in `docs/FRONTEND_DOCUMENTATION.md`

## 10. Final Validation

- [x] 10.1 Run `openspec validate update-dashboard-sidebar-overlay --strict`
- [x] 10.2 Fix any validation errors
- [ ] 10.3 Get proposal review and approval
- [ ] 10.4 Merge implementation
- [ ] 10.5 Archive change with `openspec archive update-dashboard-sidebar-overlay`
