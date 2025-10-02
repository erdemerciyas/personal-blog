# Admin Component Library Documentation

Complete documentation for the Admin UI component library with usage examples, props, and accessibility notes.

## Table of Contents

1. [Layout Components](#layout-components)
2. [Form Components](#form-components)
3. [Data Display Components](#data-display-components)
4. [Feedback Components](#feedback-components)
5. [Navigation Components](#navigation-components)
6. [Utility Components](#utility-components)

---

## Layout Components

### AdminLayoutNew

Main layout wrapper for admin pages with sidebar and header.

**Props:**
```typescript
interface AdminLayoutNewProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}
```

**Usage:**
```tsx
import AdminLayoutNew from '@/components/admin/layout/AdminLayoutNew';

export default function MyPage() {
  return (
    <AdminLayoutNew 
      title="Dashboard"
      breadcrumbs={[
        { label: 'Home', href: '/admin' },
        { label: 'Dashboard' }
      ]}
    >
      <div>Page content</div>
    </AdminLayoutNew>
  );
}
```

**Features:**
- Responsive sidebar (collapsible on desktop, overlay on mobile)
- Dark mode support
- Breadcrumb navigation
- Fixed header with actions area

---

### AdminCard

Container component with optional header and footer.

**Props:**
```typescript
interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Usage:**
```tsx
import AdminCard from '@/components/admin/ui/AdminCard';
import AdminButton from '@/components/admin/ui/AdminButton';

<AdminCard
  title="User Statistics"
  actions={<AdminButton size="sm">View All</AdminButton>}
  footer={<div>Last updated: 2 hours ago</div>}
  padding="lg"
>
  <div>Card content</div>
</AdminCard>
```

**Styling:**
- Rounded corners with shadow
- Hover effect (shadow increase)
- Dark mode support
- Flexible padding options

---

## Form Components

### AdminInput

Text input field with label, error states, and icons.

**Props:**
```typescript
interface AdminInputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  id?: string;
  name?: string;
  className?: string;
}
```

**Usage:**
```tsx
import AdminInput from '@/components/admin/ui/AdminInput';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

<AdminInput
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="We'll never share your email"
  required
  leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
/>
```

**Accessibility:**
- Proper label association
- Error messages with aria-invalid
- Helper text with aria-describedby
- Required field indicator

---

### AdminTextarea

Multi-line text input with character count.

**Props:**
```typescript
interface AdminTextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  id?: string;
  name?: string;
  className?: string;
}
```

**Usage:**
```tsx
import AdminTextarea from '@/components/admin/ui/AdminTextarea';

<AdminTextarea
  label="Description"
  placeholder="Enter description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={5}
  maxLength={500}
  showCharCount
  required
/>
```

---

### AdminCheckbox

Checkbox input with label.

**Props:**
```typescript
interface AdminCheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  id?: string;
  name?: string;
  className?: string;
}
```

**Usage:**
```tsx
import AdminCheckbox from '@/components/admin/ui/AdminCheckbox';

<AdminCheckbox
  label="Accept terms and conditions"
  checked={accepted}
  onChange={setAccepted}
  required
/>
```

---

### AdminSelect

Dropdown select input.

**Props:**
```typescript
interface AdminSelectProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
}
```

**Usage:**
```tsx
import AdminSelect from '@/components/admin/ui/AdminSelect';

<AdminSelect
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' }
  ]}
  value={country}
  onChange={setCountry}
  placeholder="Select a country"
  required
/>
```

---

## Data Display Components

### AdminTable

Feature-rich data table with sorting, selection, and pagination.

**Props:**
```typescript
interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectRows?: (rows: Set<string>) => void;
  pagination?: PaginationProps;
  sortable?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  getRowId?: (row: T, index: number) => string;
}

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}
```

**Usage:**
```tsx
import AdminTable from '@/components/admin/ui/AdminTable';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { 
    key: 'status', 
    label: 'Status',
    render: (row) => <AdminBadge variant={row.status}>{row.status}</AdminBadge>
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (row) => (
      <AdminButton size="sm" onClick={() => handleEdit(row)}>Edit</AdminButton>
    )
  }
];

<AdminTable
  columns={columns}
  data={users}
  loading={isLoading}
  selectable
  selectedRows={selected}
  onSelectRows={setSelected}
  sortable
  sortColumn={sortCol}
  sortDirection={sortDir}
  onSort={handleSort}
  pagination={{
    currentPage: page,
    pageSize: 10,
    totalItems: total,
    onPageChange: setPage
  }}
/>
```

**Features:**
- Column sorting
- Row selection (single/multiple)
- Pagination
- Loading skeleton
- Empty state
- Responsive (card view on mobile)
- Dark mode support

---

### AdminBadge

Small status indicator or label.

**Props:**
```typescript
interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Usage:**
```tsx
import AdminBadge from '@/components/admin/ui/AdminBadge';

<AdminBadge variant="success">Active</AdminBadge>
<AdminBadge variant="error" size="sm">Failed</AdminBadge>
<AdminBadge variant="warning">Pending</AdminBadge>
```

**Variants:**
- `success` - Green (active, completed)
- `error` - Red (failed, error)
- `warning` - Yellow (pending, warning)
- `info` - Blue (information)
- `neutral` - Gray (default)

---

## Feedback Components

### AdminButton

Primary action button with multiple variants and states.

**Props:**
```typescript
interface AdminButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

**Usage:**
```tsx
import AdminButton from '@/components/admin/ui/AdminButton';
import { PlusIcon } from '@heroicons/react/24/outline';

<AdminButton 
  variant="primary" 
  size="md"
  leftIcon={<PlusIcon className="w-5 h-5" />}
  onClick={handleCreate}
>
  Create New
</AdminButton>

<AdminButton 
  variant="danger" 
  loading={isDeleting}
  onClick={handleDelete}
>
  Delete
</AdminButton>
```

**Variants:**
- `primary` - Blue (main actions)
- `secondary` - Gray (secondary actions)
- `danger` - Red (destructive actions)
- `success` - Green (positive actions)
- `ghost` - Transparent (subtle actions)

---

### AdminModal

Modal dialog with backdrop and animations.

**Props:**
```typescript
interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
}
```

**Usage:**
```tsx
import AdminModal from '@/components/admin/ui/AdminModal';

<AdminModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit User"
  size="lg"
  footer={
    <>
      <AdminButton variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </AdminButton>
      <AdminButton variant="primary" onClick={handleSave}>
        Save Changes
      </AdminButton>
    </>
  }
>
  <div>Modal content</div>
</AdminModal>
```

**Features:**
- Backdrop blur
- ESC key to close
- Click outside to close
- Focus trap
- Smooth animations
- Scrollable content
- Mobile responsive

---

### AdminAlert

Alert message with icon and optional close button.

**Props:**
```typescript
interface AdminAlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}
```

**Usage:**
```tsx
import AdminAlert from '@/components/admin/ui/AdminAlert';

<AdminAlert variant="success" title="Success!" onClose={() => setShow(false)}>
  Your changes have been saved successfully.
</AdminAlert>

<AdminAlert variant="error">
  An error occurred. Please try again.
</AdminAlert>
```

---

### AdminSpinner

Loading spinner indicator.

**Props:**
```typescript
interface AdminSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  centered?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
import AdminSpinner from '@/components/admin/ui/AdminSpinner';

<AdminSpinner size="lg" centered />
<AdminButton loading>
  <AdminSpinner size="sm" color="white" />
  Loading...
</AdminButton>
```

---

## Navigation Components

### AdminTabs

Tab navigation with keyboard support.

**Props:**
```typescript
interface AdminTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  activeTab?: string;
  onChange?: (tabId: string) => void;
}
```

**Usage:**
```tsx
import AdminTabs from '@/components/admin/ui/AdminTabs';

<AdminTabs
  tabs={[
    { id: 'profile', label: 'Profile', content: <ProfileForm /> },
    { id: 'security', label: 'Security', content: <SecuritySettings /> },
    { id: 'notifications', label: 'Notifications', content: <NotificationSettings /> }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

**Accessibility:**
- Arrow key navigation
- Tab/Shift+Tab support
- ARIA roles and attributes
- Keyboard focus indicators

---

### AdminDropdown

Dropdown menu with items.

**Props:**
```typescript
interface AdminDropdownProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    danger?: boolean;
    disabled?: boolean;
  }>;
  align?: 'left' | 'right';
}
```

**Usage:**
```tsx
import AdminDropdown from '@/components/admin/ui/AdminDropdown';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

<AdminDropdown
  trigger={<AdminButton variant="ghost" size="sm"><EllipsisVerticalIcon className="w-5 h-5" /></AdminButton>}
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Duplicate', onClick: handleDuplicate },
    { label: 'Delete', onClick: handleDelete, danger: true }
  ]}
  align="right"
/>
```

---

## Utility Components

### AdminSearchInput

Search input with icon and clear button.

**Props:**
```typescript
interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  onSearch?: () => void;
}
```

**Usage:**
```tsx
import AdminSearchInput from '@/components/admin/ui/AdminSearchInput';

<AdminSearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search users..."
  loading={isSearching}
  onSearch={handleSearch}
/>
```

---

### AdminPagination

Pagination controls.

**Props:**
```typescript
interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}
```

**Usage:**
```tsx
import AdminPagination from '@/components/admin/ui/AdminPagination';

<AdminPagination
  currentPage={page}
  totalPages={Math.ceil(total / pageSize)}
  pageSize={pageSize}
  totalItems={total}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

---

## Styling Customization

All components support custom className prop for additional styling:

```tsx
<AdminButton className="w-full mt-4">
  Full Width Button
</AdminButton>

<AdminCard className="shadow-2xl">
  Custom Shadow Card
</AdminCard>
```

## Dark Mode

All components automatically support dark mode through Tailwind's dark mode classes. The theme is controlled by `AdminThemeContext`:

```tsx
import { useAdminTheme } from '@/contexts/AdminThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useAdminTheme();
  
  return (
    <AdminButton onClick={toggleTheme}>
      Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </AdminButton>
  );
}
```

## Accessibility

All components follow WCAG 2.1 AA standards:

- Proper ARIA attributes
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance
- Semantic HTML

## Best Practices

1. **Always provide labels** for form inputs
2. **Use appropriate variants** for button actions
3. **Include loading states** for async operations
4. **Provide empty states** for data displays
5. **Add error handling** for form validation
6. **Use icons consistently** across the application
7. **Test keyboard navigation** on all interactive components
8. **Verify dark mode** appearance for all components
