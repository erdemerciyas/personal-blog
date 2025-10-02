# Admin UI/UX Design System

Modern, tutarlı ve erişilebilir admin panel component library.

## 🎨 Features

- ✅ **Consistent Design**: Tüm componentler aynı design language kullanır
- ✅ **Dark Mode**: Tam dark mode desteği
- ✅ **Responsive**: Mobile-first, tüm cihazlarda çalışır
- ✅ **Accessible**: WCAG 2.1 AA compliant
- ✅ **TypeScript**: Full type safety
- ✅ **Customizable**: Tailwind CSS ile kolay özelleştirme

## 📦 Components

### Layout Components

#### AdminLayoutNew
Ana layout wrapper component.

```tsx
import { AdminLayoutNew } from '@/components/admin/layout';

<AdminLayoutNew
  title="Dashboard"
  breadcrumbs={[
    { label: 'Home', href: '/admin' },
    { label: 'Dashboard' }
  ]}
  actions={<button>Action</button>}
>
  {children}
</AdminLayoutNew>
```

### UI Components

#### AdminButton
```tsx
import { AdminButton } from '@/components/admin/ui';

<AdminButton variant="primary" size="md" loading={false}>
  Click Me
</AdminButton>
```

**Variants:** `primary` | `secondary` | `danger` | `success` | `ghost`
**Sizes:** `sm` | `md` | `lg`

#### AdminCard
```tsx
import { AdminCard } from '@/components/admin/ui';

<AdminCard
  title="Card Title"
  subtitle="Card subtitle"
  actions={<button>Action</button>}
  footer={<div>Footer content</div>}
  padding="md"
  hover
>
  Card content
</AdminCard>
```

#### AdminTable
```tsx
import { AdminTable } from '@/components/admin/ui';

<AdminTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
  ]}
  data={users}
  selectable
  selectedRows={selected}
  onSelectRows={setSelected}
  pagination={{
    currentPage: 1,
    pageSize: 10,
    totalItems: 100,
    onPageChange: (page) => setPage(page),
  }}
/>
```

#### AdminModal
```tsx
import { AdminModal } from '@/components/admin/ui';

<AdminModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
  footer={
    <>
      <AdminButton variant="secondary" onClick={onClose}>
        Cancel
      </AdminButton>
      <AdminButton variant="primary" onClick={onSave}>
        Save
      </AdminButton>
    </>
  }
>
  Modal content
</AdminModal>
```

#### Form Components

```tsx
import {
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminCheckbox,
  AdminRadio,
} from '@/components/admin/ui';

// Input
<AdminInput
  label="Email"
  type="email"
  required
  error={errors.email}
  helperText="Enter your email address"
/>

// Select
<AdminSelect
  label="Country"
  options={[
    { label: 'Turkey', value: 'tr' },
    { label: 'USA', value: 'us' },
  ]}
  required
/>

// Textarea
<AdminTextarea
  label="Description"
  rows={4}
  helperText="Enter a description"
/>

// Checkbox
<AdminCheckbox
  label="I agree to terms"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>

// Radio
<AdminRadio
  label="Option 1"
  name="option"
  value="1"
  checked={selected === '1'}
  onChange={(e) => setSelected(e.target.value)}
/>
```

#### Utility Components

```tsx
import {
  AdminBadge,
  AdminAlert,
  AdminSpinner,
  AdminEmptyState,
} from '@/components/admin/ui';

// Badge
<AdminBadge variant="success" size="md">
  Active
</AdminBadge>

// Alert
<AdminAlert variant="success" title="Success!">
  Your changes have been saved.
</AdminAlert>

// Spinner
<AdminSpinner size="md" />

// Empty State
<AdminEmptyState
  title="No items found"
  description="Get started by creating a new item"
  action={{
    label: 'Create Item',
    onClick: () => handleCreate(),
  }}
/>
```

## 🎨 Theme System

### Using Theme Context

```tsx
import { useAdminTheme } from '@/hooks/useAdminTheme';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useAdminTheme();

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### Theme Provider

Wrap your admin app with `AdminThemeProvider`:

```tsx
import { AdminThemeProvider } from '@/contexts/AdminThemeContext';

<AdminThemeProvider>
  <YourAdminApp />
</AdminThemeProvider>
```

## 🎨 Design Tokens

### Colors

```css
/* Brand Colors */
--admin-brand-50 to --admin-brand-950

/* Semantic Colors */
--admin-success-50 to --admin-success-900
--admin-error-50 to --admin-error-900
--admin-warning-50 to --admin-warning-900
--admin-info-50 to --admin-info-900

/* Neutral Colors */
--admin-slate-50 to --admin-slate-950
```

### Typography

```css
--admin-text-xs: 0.75rem
--admin-text-sm: 0.875rem
--admin-text-base: 1rem
--admin-text-lg: 1.125rem
--admin-text-xl: 1.25rem
--admin-text-2xl: 1.5rem
```

### Spacing

```css
--admin-space-1: 0.25rem (4px)
--admin-space-2: 0.5rem (8px)
--admin-space-3: 0.75rem (12px)
--admin-space-4: 1rem (16px)
--admin-space-6: 1.5rem (24px)
--admin-space-8: 2rem (32px)
```

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## ♿ Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Keyboard navigation
- ✅ Focus management
- ✅ ARIA labels
- ✅ Color contrast (4.5:1 minimum)
- ✅ Screen reader support

## 🚀 Migration Guide

### From Old AdminLayout to New

```tsx
// Old
import AdminLayout from '@/components/admin/AdminLayout';

// New
import { AdminLayoutNew } from '@/components/admin/layout';

// Usage stays similar
<AdminLayoutNew title="Page Title" breadcrumbs={[...]}>
  {children}
</AdminLayoutNew>
```

### Component Mapping

| Old Component | New Component | Notes |
|--------------|---------------|-------|
| `<button className="btn-primary">` | `<AdminButton variant="primary">` | Consistent styling |
| `<div className="card">` | `<AdminCard>` | Built-in header/footer |
| `<table>` | `<AdminTable>` | Sorting, pagination, selection |
| Custom modals | `<AdminModal>` | Focus trap, ESC key |
| Custom inputs | `<AdminInput>` | Error states, icons |

## 📝 Best Practices

1. **Always use AdminLayoutNew** for admin pages
2. **Use semantic variants** (primary, danger, success)
3. **Provide labels** for form inputs
4. **Handle loading states** with AdminSpinner
5. **Show empty states** with AdminEmptyState
6. **Use AdminModal** for confirmations
7. **Implement keyboard navigation**
8. **Test in dark mode**

## 🐛 Troubleshooting

### Dark mode not working
Make sure `AdminThemeProvider` wraps your app.

### Components not styled
Import from `@/components/admin/ui` not old paths.

### TypeScript errors
Update imports to use new component names.

## 📚 Examples

See `/src/app/admin/dashboard-new/page.tsx` for a complete example.

## 🤝 Contributing

When adding new components:
1. Follow existing patterns
2. Add TypeScript types
3. Support dark mode
4. Add accessibility features
5. Document props
6. Add to index.ts

## 📄 License

MIT
