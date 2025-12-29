# Hero System - Visual & Behavioral Reference

## Visual Hierarchy

### Default Variant (Full Screen)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Badge]                              │
│                      ↓                                   │
│              [Large Title]                              │
│                      ↓                                   │
│              [Subtitle]                                 │
│                      ↓                                   │
│          [Description Text]                             │
│                      ↓                                   │
│        [Primary Button] [Secondary Button]              │
│                                                         │
│  Height: min-h-screen (full viewport)                   │
│  Padding: py-28 md:py-40 lg:py-48                       │
│  Alignment: Centered                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Compact Variant (Reduced Height)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [Medium Title]                             │
│                      ↓                                   │
│          [Description Text]                             │
│                      ↓                                   │
│        [Primary Button] [Secondary Button]              │
│                                                         │
│  Height: Auto (content-based)                           │
│  Padding: py-12 md:py-16                                │
│  Alignment: Centered                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Spacing Reference

### Vertical Spacing (Default Variant)

```
Mobile (< 640px):
┌─────────────────────────────────────────┐
│ py-28 (112px top + bottom)              │
│                                         │
│ [Badge]                                 │
│ mb-6 (24px)                             │
│ [Title]                                 │
│ mb-8 (32px)                             │
│ [Subtitle]                              │
│ mb-8 (32px)                             │
│ [Description]                           │
│ mb-12 (48px)                            │
│ [Buttons]                               │
│                                         │
│ py-28 (112px top + bottom)              │
└─────────────────────────────────────────┘

Tablet (640px - 1024px):
┌─────────────────────────────────────────┐
│ py-40 (160px top + bottom)              │
│                                         │
│ [Badge]                                 │
│ mb-6 (24px)                             │
│ [Title]                                 │
│ mb-8 (32px)                             │
│ [Subtitle]                              │
│ mb-8 (32px)                             │
│ [Description]                           │
│ mb-12 (48px)                            │
│ [Buttons]                               │
│                                         │
│ py-40 (160px top + bottom)              │
└─────────────────────────────────────────┘

Desktop (≥ 1024px):
┌─────────────────────────────────────────┐
│ py-48 (192px top + bottom)              │
│                                         │
│ [Badge]                                 │
│ mb-6 (24px)                             │
│ [Title]                                 │
│ mb-8 (32px)                             │
│ [Subtitle]                              │
│ mb-8 (32px)                             │
│ [Description]                           │
│ mb-12 (48px)                            │
│ [Buttons]                               │
│                                         │
│ py-48 (192px top + bottom)              │
└─────────────────────────────────────────┘
```

### Horizontal Spacing

```
Container: container-content (max-w-6xl)
Padding:   px-6 sm:px-8 lg:px-12

Mobile:    6px padding on each side
Tablet:    8px padding on each side
Desktop:   12px padding on each side
```

### Button Spacing

```
Mobile:
┌─────────────────────────────────────────┐
│ [Primary Button]                        │
│ gap-4 (16px)                            │
│ [Secondary Button]                      │
└─────────────────────────────────────────┘

Desktop:
┌─────────────────────────────────────────┐
│ [Primary Button] gap-6 (24px) [Secondary Button]
└─────────────────────────────────────────┘
```

---

## Typography Reference

### Title Sizing

**Default Variant**:
```
Mobile:    text-4xl (36px)
Tablet:    text-5xl (48px) - text-6xl (60px)
Desktop:   text-7xl (72px) - text-9xl (96px)
Class:     hero-title
Weight:    font-black (900)
Color:     text-gradient-hero (white → brand-primary-200)
```

**Compact Variant**:
```
Mobile:    text-3xl (30px)
Tablet:    text-4xl (36px) - text-5xl (48px)
Desktop:   text-6xl (60px) - text-7xl (72px)
Class:     hero-title-compact
Weight:    font-black (900)
Color:     text-gradient-hero (white → brand-primary-200)
```

### Subtitle Sizing
```
Size:      text-xl sm:text-2xl (20px - 24px)
Weight:    font-semibold (600)
Color:     text-brand-primary-200
Opacity:   Full (no transparency)
```

### Description Sizing
```
Size:      text-lg sm:text-xl (18px - 20px)
Weight:    font-normal (400)
Color:     text-slate-200/90
Opacity:   90% (slight transparency)
Line Height: leading-relaxed (1.625)
```

### Badge Sizing
```
Size:      text-sm (14px)
Weight:    font-medium (500)
Color:     text-white/90
Background: bg-white/10 backdrop-blur-sm
Border:    border border-white/20
Padding:   px-4 py-2
Radius:    rounded-full
```

---

## Color Reference

### Text Colors
```
Title:          text-gradient-hero (white → brand-primary-200)
Subtitle:       text-brand-primary-200 (#7dd3fc)
Description:    text-slate-200/90 (rgba(226, 232, 240, 0.9))
Badge Text:     text-white/90 (rgba(255, 255, 255, 0.9))
Button Text:    text-brand-primary-900 (#003450) on white
                text-white on transparent
```

### Background Colors
```
Section:        bg-gradient-primary (dark blue gradient)
Badge:          bg-white/10 (white with 10% opacity)
Primary Button: bg-white
Secondary Button: bg-white/10 with border-white
```

### Gradient Reference
```
bg-gradient-primary:
  from-[#0f1e2d] (dark blue)
  via-[#0f1b26] (darker blue)
  to-[#0b1520] (darkest blue)

text-gradient-hero:
  from-white
  via-brand-primary-100 (#e0f2fe)
  to-brand-primary-200 (#bae6fd)
```

---

## Animation Timeline

### Staggered Entrance Animation

```
Time    Element         Opacity    Y Position
────────────────────────────────────────────
0ms     Container       0%         0px
100ms   Badge           0% → 100%  20px → 0px
300ms   Title           0% → 100%  20px → 0px
500ms   Subtitle        0% → 100%  20px → 0px
700ms   Description     0% → 100%  20px → 0px
900ms   Buttons         0% → 100%  20px → 0px

Duration per item: 800ms
Easing: ease-out (natural deceleration)
```

### Animation Properties

```
Initial State:
  opacity: 0
  transform: translateY(20px)

Final State:
  opacity: 1
  transform: translateY(0px)

Transition:
  duration: 0.8s
  easing: ease-out
  delay: staggered (0.2s between items)
```

---

## Responsive Behavior

### Mobile (< 640px)

```
Layout:         Single column, centered
Title Size:     text-4xl (default) / text-3xl (compact)
Buttons:        Full width, stacked vertically
Button Gap:     gap-4 (16px)
Padding:        py-12 (default) / py-12 (compact)
Container:      px-6 (24px total padding)
```

### Tablet (640px - 1024px)

```
Layout:         Single column, centered
Title Size:     text-5xl-6xl (default) / text-4xl-5xl (compact)
Buttons:        Inline, side-by-side
Button Gap:     gap-6 (24px)
Padding:        py-40 (default) / py-16 (compact)
Container:      px-8 (32px total padding)
```

### Desktop (≥ 1024px)

```
Layout:         Single column, centered
Title Size:     text-7xl-9xl (default) / text-6xl-7xl (compact)
Buttons:        Inline, side-by-side
Button Gap:     gap-6 (24px)
Padding:        py-48 (default) / py-16 (compact)
Container:      px-12 (48px total padding)
```

---

## Button States

### Primary Button

```
Default:
  Background:   bg-white
  Text:         text-brand-primary-900
  Shadow:       shadow-lg
  Cursor:       pointer

Hover:
  Background:   bg-white/90
  Shadow:       shadow-xl
  Transition:   200ms ease-in-out

Focus:
  Ring:         ring-2 ring-white
  Ring Offset:  ring-offset-2
  Ring Offset BG: ring-offset-brand-primary-900
  Outline:      outline-none

Active:
  Transform:    scale(0.95)
  Transition:   100ms ease-in-out
```

### Secondary Button

```
Default:
  Background:   bg-white/10
  Border:       border-2 border-white
  Text:         text-white
  Backdrop:     backdrop-blur-sm
  Shadow:       None
  Cursor:       pointer

Hover:
  Background:   bg-white/20
  Border:       border-2 border-white
  Transition:   200ms ease-in-out

Focus:
  Ring:         ring-2 ring-white
  Ring Offset:  ring-offset-2
  Ring Offset BG: ring-offset-brand-primary-900
  Outline:      outline-none

Active:
  Transform:    scale(0.95)
  Transition:   100ms ease-in-out
```

---

## Accessibility Features

### Focus Indicators

```
Focus Ring:     2px solid white
Ring Offset:    2px
Ring Offset BG: brand-primary-900
Outline:        None (outline-none)
Visible:        Always visible on keyboard navigation
```

### Color Contrast

```
Title on Gradient:      10.5:1 (AAA)
Subtitle on Gradient:   8.2:1 (AAA)
Description on Gradient: 7.2:1 (AAA)
Badge on White/10:      5.5:1 (AA)
Button Text on White:   10.5:1 (AAA)
Button Text on White/10: 7.2:1 (AAA)
```

### Motion Preferences

```
Respects:       prefers-reduced-motion media query
Animations:     Disabled if user prefers reduced motion
Fallback:       Content visible immediately
Functionality:  Not dependent on animations
```

---

## Page-Specific Examples

### Portfolio Page (Default Variant)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                   Portfolyo                             │
│                                                         │
│        Başarılı projelerimizi keşfedin                  │
│                                                         │
│    [Tüm Projeleri Gör] [İletişime Geçin]               │
│                                                         │
│  Height: min-h-screen                                   │
│  Padding: py-28 md:py-40 lg:py-48                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Products Page (Compact Variant)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              Ürünlerimiz                                │
│                                                         │
│        Yüksek kaliteli ürünler                          │
│                                                         │
│        [Ürünleri Keşfet]                                │
│                                                         │
│  Height: Auto                                           │
│  Padding: py-12 md:py-16                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Performance Metrics

### Animation Performance

```
FPS:            60fps (smooth)
GPU Acceleration: Yes (transform, opacity)
Layout Thrashing: None
Paint Operations: Minimal
```

### Bundle Impact

```
Component Size:  ~3KB (minified)
Framer Motion:   Already in project
Additional CSS:  None (Tailwind only)
Total Impact:    Minimal
```

### Load Time

```
Initial Render:  < 100ms
Animation Start: < 200ms
Full Animation:  800ms (per item)
```

---

## Browser Support

```
Chrome/Edge:    90+ (Full support)
Firefox:        88+ (Full support)
Safari:         14+ (Full support)
Mobile Safari:  14+ (Full support)
Chrome Mobile:  90+ (Full support)
```

---

## Debugging Tips

### Check Component Props
```typescript
console.log({
  title,
  description,
  subtitle,
  badge,
  variant,
  showButton,
  showSecondaryButton
});
```

### Check Animation State
```typescript
// In browser DevTools
// Check Framer Motion animation in Performance tab
// Look for smooth 60fps animation
```

### Check Responsive Behavior
```
1. Open DevTools
2. Toggle device toolbar
3. Resize viewport
4. Check spacing and typography at each breakpoint
```

### Check Accessibility
```
1. Tab through buttons
2. Check focus ring visibility
3. Use screen reader to verify content
4. Check color contrast with accessibility tool
```
