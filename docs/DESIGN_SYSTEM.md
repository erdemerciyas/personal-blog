# Admin Design System Guide

Complete guide to the Admin Panel design system including colors, typography, spacing, and component patterns.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Layout Grid](#layout-grid)
6. [Component Patterns](#component-patterns)
7. [Dark Mode](#dark-mode)
8. [Accessibility](#accessibility)

---

## Design Principles

### 1. Consistency
- Use the same components and patterns throughout the application
- Maintain consistent spacing, colors, and typography
- Follow established interaction patterns

### 2. Clarity
- Clear visual hierarchy
- Obvious interactive elements
- Meaningful feedback for user actions

### 3. Efficiency
- Minimize clicks to complete tasks
- Provide keyboard shortcuts
- Fast loading and responsive interactions

### 4. Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader friendly
- Sufficient color contrast

---

## Color Palette

### Brand Colors

**Primary (Blue)**
```css
--color-brand-primary-50: #eff6ff
--color-brand-primary-100: #dbeafe
--color-brand-primary-200: #bfdbfe
--color-brand-primary-300: #93c5fd
--color-brand-primary-400: #60a5fa
--color-brand-primary-500: #3b82f6  /* Main brand color */
--color-brand-primary-600: #2563eb
--color-brand-primary-700: #1d4ed8
--color-brand-primary-800: #1e40af
--color-brand-primary-900: #1e3a8a
```

**Usage:**
- Primary buttons
- Links
- Active states
- Focus indicators

### Semantic Colors

**Success (Green)**
```css
--color-admin-success-50: #f0fdf4
--color-admin-success-500: #22c55e
--color-admin-success-600: #16a34a
```

**Usage:** Success messages, completed states, positive actions

**Error (Red)**
```css
--color-admin-error-50: #fef2f2
--color-admin-error-500: #ef4444
--color-admin-error-600: #dc2626
```

**Usage:** Error messages, destructive actions, validation errors

**Warning (Yellow)**
```css
--color-admin-warning-50: #fefce8
--color-admin-warning-500: #eab308
--color-admin-warning-600: #ca8a04
```

**Usage:** Warning messages, caution states

**Info (Blue)**
```css
--color-admin-info-50: #eff6ff
--color-admin-info-500: #3b82f6
--color-admin-info-600: #2563eb
```

**Usage:** Informational messages, help text

### Neutral Colors

**Gray Scale**
```css
--color-slate-50: #f8fafc
--color-slate-100: #f1f5f9
--color-slate-200: #e2e8f0
--color-slate-300: #cbd5e1
--color-slate-400: #94a3b8
--color-slate-500: #64748b
--color-slate-600: #475569
--color-slate-700: #334155
--color-slate-800: #1e293b
--color-slate-900: #0f172a
```

**Usage:**
- Text colors
- Borders
- Backgrounds
- Disabled states

### Color Usage Guidelines

**Text Colors:**
- Primary text: `slate-900` (light) / `slate-100` (dark)
- Secondary text: `slate-600` (light) / `slate-400` (dark)
- Disabled text: `slate-400` (light) / `slate-600` (dark)

**Background Colors:**
- Page background: `slate-50` (light) / `slate-900` (dark)
- Card background: `white` (light) / `slate-800` (dark)
- Hover background: `slate-50` (light) / `slate-700` (dark)

**Border Colors:**
- Default border: `slate-200` (light) / `slate-700` (dark)
- Focus border: `brand-primary-500`
- Error border: `admin-error-500`

---

## Typography

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes

```css
text-xs: 0.75rem (12px)     /* Small labels, captions */
text-sm: 0.875rem (14px)    /* Body text, form inputs */
text-base: 1rem (16px)      /* Default body text */
text-lg: 1.125rem (18px)    /* Subheadings */
text-xl: 1.25rem (20px)     /* Section headings */
text-2xl: 1.5rem (24px)     /* Page headings */
text-3xl: 1.875rem (30px)   /* Large headings */
text-4xl: 2.25rem (36px)    /* Hero headings */
```

### Font Weights

```css
font-normal: 400    /* Body text */
font-medium: 500    /* Emphasized text, labels */
font-semibold: 600  /* Subheadings, buttons */
font-bold: 700      /* Headings */
```

### Line Heights

```css
leading-tight: 1.25    /* Headings */
leading-normal: 1.5    /* Body text */
leading-relaxed: 1.625 /* Long-form content */
```

### Typography Scale

**Headings:**
```tsx
<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
  Page Title
</h1>

<h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
  Section Title
</h2>

<h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
  Subsection Title
</h3>
```

**Body Text:**
```tsx
<p className="text-base text-slate-700 dark:text-slate-300">
  Regular paragraph text
</p>

<p className="text-sm text-slate-600 dark:text-slate-400">
  Secondary text, captions
</p>
```

**Labels:**
```tsx
<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
  Form Label
</label>
```

---

## Spacing System

### Base Unit: 4px (0.25rem)

```css
0: 0px
0.5: 2px (0.125rem)
1: 4px (0.25rem)
1.5: 6px (0.375rem)
2: 8px (0.5rem)
2.5: 10px (0.625rem)
3: 12px (0.75rem)
4: 16px (1rem)
5: 20px (1.25rem)
6: 24px (1.5rem)
8: 32px (2rem)
10: 40px (2.5rem)
12: 48px (3rem)
16: 64px (4rem)
20: 80px (5rem)
24: 96px (6rem)
```

### Spacing Guidelines

**Component Padding:**
- Small: `p-2` (8px)
- Medium: `p-4` (16px)
- Large: `p-6` (24px)
- Extra Large: `p-8` (32px)

**Component Margins:**
- Tight: `space-y-2` (8px)
- Normal: `space-y-4` (16px)
- Relaxed: `space-y-6` (24px)
- Loose: `space-y-8` (32px)

**Layout Spacing:**
- Section gap: `gap-6` or `gap-8`
- Card gap: `gap-4`
- Form field gap: `space-y-4`
- Button group gap: `gap-2` or `gap-3`

---

## Layout Grid

### Container Widths

```css
max-w-sm: 384px    /* Small containers */
max-w-md: 448px    /* Medium containers */
max-w-lg: 512px    /* Large containers */
max-w-xl: 576px    /* Extra large containers */
max-w-2xl: 672px   /* 2XL containers */
max-w-4xl: 896px   /* 4XL containers */
max-w-6xl: 1152px  /* 6XL containers */
max-w-7xl: 1280px  /* 7XL containers */
```

### Breakpoints

```css
sm: 640px   /* Small devices (tablets) */
md: 768px   /* Medium devices (small laptops) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2XL devices */
```

### Grid System

**12-Column Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

**Responsive Layout:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <div className="lg:col-span-8">Main Content</div>
  <div className="lg:col-span-4">Sidebar</div>
</div>
```

---

## Component Patterns

### Cards

**Standard Card:**
```tsx
<AdminCard title="Card Title" padding="md">
  <p>Card content</p>
</AdminCard>
```

**Stat Card:**
```tsx
<AdminCard padding="lg">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">1,234</p>
    </div>
    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
      <UsersIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
    </div>
  </div>
</AdminCard>
```

### Forms

**Form Layout:**
```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <AdminInput label="First Name" required />
    <AdminInput label="Last Name" required />
  </div>
  
  <AdminInput label="Email" type="email" required />
  
  <AdminTextarea label="Bio" rows={4} />
  
  <div className="flex justify-end gap-3">
    <AdminButton variant="secondary">Cancel</AdminButton>
    <AdminButton variant="primary" type="submit">Save</AdminButton>
  </div>
</form>
```

### Tables

**Data Table Pattern:**
```tsx
<AdminCard>
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold">Users</h2>
    <div className="flex gap-2">
      <AdminSearchInput value={search} onChange={setSearch} />
      <AdminButton leftIcon={<PlusIcon />}>Add User</AdminButton>
    </div>
  </div>
  
  <AdminTable
    columns={columns}
    data={users}
    selectable
    sortable
    pagination={pagination}
  />
</AdminCard>
```

### Modals

**Confirmation Modal:**
```tsx
<AdminModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Delete"
  size="sm"
  footer={
    <>
      <AdminButton variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </AdminButton>
      <AdminButton variant="danger" onClick={handleDelete}>
        Delete
      </AdminButton>
    </>
  }
>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
</AdminModal>
```

---

## Dark Mode

### Implementation

Dark mode is implemented using Tailwind's `dark:` variant and controlled by `AdminThemeContext`.

**Theme Toggle:**
```tsx
import { useAdminTheme } from '@/contexts/AdminThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useAdminTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

### Dark Mode Colors

**Backgrounds:**
- Page: `bg-slate-50 dark:bg-slate-900`
- Card: `bg-white dark:bg-slate-800`
- Input: `bg-white dark:bg-slate-700`

**Text:**
- Primary: `text-slate-900 dark:text-slate-100`
- Secondary: `text-slate-600 dark:text-slate-400`
- Muted: `text-slate-500 dark:text-slate-500`

**Borders:**
- Default: `border-slate-200 dark:border-slate-700`
- Focus: `border-blue-500 dark:border-blue-400`

### Dark Mode Best Practices

1. **Always provide dark variants** for custom colors
2. **Test contrast ratios** in both modes
3. **Use semantic color tokens** instead of hardcoded values
4. **Adjust opacity** for overlays and shadows
5. **Test with real content** in both modes

---

## Accessibility

### Color Contrast

**WCAG 2.1 AA Requirements:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Tested Combinations:**
- ✅ `slate-900` on `white` (15.5:1)
- ✅ `slate-600` on `white` (7.1:1)
- ✅ `blue-600` on `white` (4.8:1)
- ✅ `slate-100` on `slate-900` (14.8:1)

### Keyboard Navigation

**Focus Indicators:**
```css
focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
```

**Tab Order:**
- Logical flow (top to bottom, left to right)
- Skip links for main content
- Modal focus trap

### Screen Readers

**ARIA Labels:**
```tsx
<button aria-label="Close modal">
  <XMarkIcon />
</button>

<input aria-describedby="email-helper" />
<p id="email-helper">We'll never share your email</p>
```

**Semantic HTML:**
- Use `<button>` for actions
- Use `<a>` for navigation
- Use `<nav>` for navigation sections
- Use `<main>` for main content

### Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color is not the only means of conveying information
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Error messages are clear and associated with inputs
- [ ] Modals trap focus and can be closed with ESC
- [ ] Tables have proper headers
- [ ] Loading states are announced to screen readers

---

## Component Usage Patterns

### Page Layout

```tsx
export default function MyPage() {
  return (
    <AdminLayoutNew title="Page Title">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Page Title
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Page description
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard />
        <StatCard />
        <StatCard />
        <StatCard />
      </div>
      
      {/* Main Content */}
      <AdminCard>
        <DataTable />
      </AdminCard>
    </AdminLayoutNew>
  );
}
```

### Form Page

```tsx
export default function FormPage() {
  return (
    <AdminLayoutNew title="Create Item">
      <div className="max-w-2xl mx-auto">
        <AdminCard title="Item Details" padding="lg">
          <form className="space-y-6">
            <AdminInput label="Name" required />
            <AdminTextarea label="Description" rows={4} />
            <AdminSelect label="Category" options={categories} />
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <AdminButton variant="secondary">Cancel</AdminButton>
              <AdminButton variant="primary" type="submit">Create</AdminButton>
            </div>
          </form>
        </AdminCard>
      </div>
    </AdminLayoutNew>
  );
}
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Component Library Documentation](./COMPONENT_LIBRARY.md)

---

## Changelog

### Version 1.0.0 (Current)
- Initial design system release
- 18+ components
- Full dark mode support
- WCAG 2.1 AA compliant
- Responsive design system
