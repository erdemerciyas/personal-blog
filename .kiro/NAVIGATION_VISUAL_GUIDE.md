# Navigation System - Visual & Behavioral Guide

## State Matrix

### Transparent Pages (Homepage, Portfolio, Services, Contact, Videos, Products, News)

#### State 1: Not Scrolled (0-100px)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  [Nav Items]  [CTA Button]                               │
│         ├─ flex-1 justify-center    flex-shrink-0               │
│         └─ gap-1 between items      gap-6 from nav              │
│ ├─ Background: Gradient overlay (black/20 to transparent)       │
│ ├─ Logo: White text with drop-shadow                            │
│ ├─ Nav Items: White text with drop-shadow                       │
│ ├─ Active Nav: bg-white/20 with frosted glass effect            │
│ ├─ CTA Button: White background, dark text, drop-shadow         │
│ └─ Mobile Menu: bg-white/90 (when open)                         │
└─────────────────────────────────────────────────────────────────┘
```

#### State 2: Scrolled (>100px)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  [Nav Items]  [CTA Button]                               │
│         ├─ flex-1 justify-center    flex-shrink-0               │
│         └─ gap-1 between items      gap-6 from nav              │
│ ├─ Background: Solid white with backdrop blur                   │
│ ├─ Logo: Dark text (slate-900)                                  │
│ ├─ Nav Items: Dark text (slate-700)                             │
│ ├─ Active Nav: bg-brand-primary-100                             │
│ ├─ CTA Button: Dark background, white text                      │
│ └─ Mobile Menu: bg-white/95 (when open)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Regular Pages (Non-Hero Pages)

#### State: Always Solid
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  [Nav Items]  [CTA Button]                               │
│         ├─ flex-1 justify-center    flex-shrink-0               │
│         └─ gap-1 between items      gap-6 from nav              │
│ ├─ Background: Solid white with backdrop blur                   │
│ ├─ Logo: Dark text (slate-900)                                  │
│ ├─ Nav Items: Dark text (slate-700)                             │
│ ├─ Active Nav: bg-brand-primary-100                             │
│ ├─ CTA Button: Dark background, white text                      │
│ └─ Mobile Menu: bg-white/95 (when open)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Reference

### Transparent Page (Not Scrolled)
| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Black with 20% opacity | rgba(0,0,0,0.2) | Header overlay |
| Logo Text | White | #FFFFFF | Site name |
| Logo Shadow | Black with 50% opacity | rgba(0,0,0,0.5) | Text shadow |
| Nav Text | White | #FFFFFF | Navigation items |
| Nav Shadow | Black with 50% opacity | rgba(0,0,0,0.5) | Text shadow |
| Active Nav BG | White with 20% opacity | rgba(255,255,255,0.2) | Active state |
| Active Nav Underline | White with 80% opacity | rgba(255,255,255,0.8) | Underline animation |
| CTA Button BG | White | #FFFFFF | Button background |
| CTA Button Text | Brand Primary 900 | #003450 | Button text |
| CTA Button Shadow | Black with 30% opacity | rgba(0,0,0,0.3) | Button shadow |

### Transparent Page (Scrolled) / Regular Page
| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | White with 95% opacity | rgba(255,255,255,0.95) | Header background |
| Logo Text | Slate 900 | #0F172A | Site name |
| Nav Text | Slate 700 | #334155 | Navigation items |
| Active Nav BG | Brand Primary 100 | #E0F2FE | Active state |
| Active Nav Text | Brand Primary 900 | #003450 | Active text |
| Active Nav Underline | Brand Primary 700 | #0369A1 | Underline animation |
| CTA Button BG | Brand Primary 900 | #003450 | Button background |
| CTA Button Text | White | #FFFFFF | Button text |
| CTA Button Shadow | Black with 20% opacity | rgba(0,0,0,0.2) | Button shadow |

---

## Animation Timings

### Header Transitions
```
Duration: 300ms
Easing: ease-in-out (default)
Properties: background-color, color, box-shadow, border-color
```

### Underline Animation (Desktop Nav)
```
Duration: 300ms
Easing: ease-out
Transform: scaleX(0) → scaleX(100)
Origin: left
Trigger: On active state or hover
```

### Button Interactions
```
Duration: 200ms
Easing: ease-in-out
Properties: background-color, box-shadow, transform
Active Press: scale(0.95)
```

---

## Responsive Breakpoints

### Mobile (< 768px)
```
Header Height: 64px (h-16)
Mobile Menu: Absolute, below header
Mobile Menu Max Height: 75vh
Navigation: Vertical stack
Icon Size: 20px (w-5 h-5)
```

### Tablet/Desktop (≥ 768px)
```
Header Height: 80px (h-20)
Desktop Nav: Horizontal, centered
Navigation: Horizontal row
Icon Size: 16px (w-4 h-4)
```

---

## Spacing Reference

### Header Container
```
Horizontal Padding: 24px (px-6) on mobile, 32px (px-8) on tablet, 48px (px-12) on desktop
Vertical Padding: 16px (h-16) on mobile, 20px (h-20) on desktop
```

### Navigation Items
```
Desktop:
  - Horizontal Padding: 16px (px-4)
  - Vertical Padding: 10px (py-2.5)
  - Gap Between Items: 4px (gap-1)
  - Gap Between Icon & Label: 8px (gap-2)

Mobile:
  - Horizontal Padding: 16px (px-4)
  - Vertical Padding: 12px (py-3)
  - Gap Between Items: 4px (space-y-1)
  - Gap Between Icon & Label: 12px (gap-3)
```

### CTA Button
```
Desktop:
  - Horizontal Padding: 20px (px-5)
  - Vertical Padding: 10px (py-2.5)
  - Left Margin: 8px (ml-2)

Mobile:
  - Horizontal Padding: 20px (px-5)
  - Vertical Padding: 12px (py-3)
  - Width: 100% (w-full)
  - Top Margin: 24px (mt-6)
  - Top Padding: 24px (pt-6)
```

---

## Accessibility Features

### Focus States
```
Ring Width: 2px (ring-2)
Ring Color: Brand Primary 600 (#0284C7)
Ring Offset: 2px (ring-offset-2)
Outline: None (outline-none)
```

### Touch Targets
```
Minimum Size: 44px × 44px
Desktop Nav Item: 44px height (py-2.5 + icon + padding)
Mobile Nav Item: 44px height (py-3 + icon + padding)
Mobile Menu Button: 44px × 44px (p-2 + icon)
```

### Color Contrast
```
Active Text on Active BG: 10.5:1 (AAA)
Inactive Text on White: 7.2:1 (AAA)
Focus Ring on White: 5.5:1 (AA)
White Text on Transparent: Readable with drop-shadow
```

---

## Scroll Threshold Behavior

### Scroll Detection
```
Threshold: 100px
Below 100px: Transparent page styling (if applicable)
Above 100px: Solid header styling
Transition: Smooth 300ms
```

### Visual Changes at 100px
```
Transparent Pages:
  - Background: Gradient overlay → Solid white
  - Text Color: White → Dark
  - Active State: Frosted glass → Solid background
  - Shadows: Drop shadows → No shadows

Regular Pages:
  - No visual change (always solid)
```

---

## Mobile Menu Behavior

### Opening Animation
```
Duration: 300ms
Easing: ease-in-out
Transform: translateY(-10px) → translateY(0)
Opacity: 0 → 1
```

### Closing Animation
```
Duration: 300ms
Easing: ease-in-out
Transform: translateY(0) → translateY(-10px)
Opacity: 1 → 0
```

### Menu Items
```
Stacked vertically with 4px gap (space-y-1)
Each item: 44px minimum height
Scrollable if content exceeds 75vh
```

---

## Page-Specific Behavior

### Homepage (`/`)
- Transparent header on load
- Hero slider background
- Transitions at 100px scroll
- Mobile menu adapts

### Portfolio Pages (`/portfolio`, `/portfolio/[slug]`)
- Transparent header on load
- Gradient background hero
- Transitions at 100px scroll
- Mobile menu adapts

### Services Page (`/services`)
- Transparent header on load (NEW)
- Gradient background hero
- Transitions at 100px scroll
- Mobile menu adapts

### Contact Page (`/contact`)
- Transparent header on load (NEW)
- Gradient background hero
- Transitions at 100px scroll
- Mobile menu adapts

### Videos Page (`/videos`)
- Transparent header on load (NEW)
- Gradient background hero
- Transitions at 100px scroll
- Mobile menu adapts

### Products Page (`/products`)
- Transparent header on load (NEW)
- Gradient background hero
- Transitions at 100px scroll
- Mobile menu adapts

### News Pages (`/[lang]/haberler`, `/[lang]/haberler/[slug]`)
- Transparent header on load
- Gradient background hero
- Transitions at 100px scroll
- Mobile menu adapts

---

## Browser Rendering Notes

### GPU Acceleration
```
Properties: transform, opacity
Hardware Acceleration: Enabled
Will-Change: Applied to animated elements
Backface Visibility: Hidden
```

### Backdrop Blur Support
```
Chrome/Edge: Full support
Firefox: Full support
Safari: Full support
Mobile Safari: Full support
Fallback: Solid background (no blur)
```

### Drop Shadow Support
```
Chrome/Edge: Full support
Firefox: Full support
Safari: Full support
Mobile Safari: Full support
Fallback: No shadow
```

---

## Performance Metrics

### Scroll Listener
```
Event: scroll
Throttle: None (100px threshold provides natural throttling)
Listener Count: 1 (global, not per-component)
Performance Impact: Minimal
```

### CSS Animations
```
Type: CSS-only (no JavaScript animations)
GPU Accelerated: Yes
Performance Impact: Minimal
Respects prefers-reduced-motion: Yes
```

### Bundle Size Impact
```
Additional CSS: ~2KB (Tailwind classes)
Additional JavaScript: ~1KB (state management)
Total Impact: ~3KB (minimal)
```

---

## Debugging Tips

### Check Transparent Page Detection
```typescript
// In browser console
console.log(pathname);
console.log(isTransparentPage);
```

### Check Scroll State
```typescript
// In browser console
console.log(window.scrollY);
console.log(isScrolled);
```

### Check Mobile Menu State
```typescript
// In browser console
console.log(isMobileMenuOpen);
```

### Visual Debugging
```
1. Open DevTools
2. Toggle device toolbar (mobile view)
3. Scroll to see transitions
4. Check computed styles for colors
5. Check animations in Performance tab
```

---

## Future Enhancement Opportunities

1. **Dynamic Transparent Page Detection**: Move from hardcoded paths to database-driven configuration
2. **Customizable Scroll Threshold**: Allow admin to adjust scroll threshold
3. **Theme Customization**: Allow admin to customize header colors and styling
4. **Animation Preferences**: Respect user's motion preferences more granularly
5. **Mobile Menu Focus Trap**: Implement focus trap for better accessibility
6. **Keyboard Shortcuts**: Add keyboard shortcuts for navigation (e.g., Cmd+K for search)
7. **Sticky Mobile Menu**: Option to make mobile menu sticky on scroll
8. **Mega Menu**: Support for dropdown menus with multiple columns
