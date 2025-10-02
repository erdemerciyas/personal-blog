# Integration Testing Guide - Admin UI/UX

This guide provides integration testing strategies and examples for the admin panel pages.

## Overview

Integration tests verify that multiple components work together correctly in real-world scenarios. Unlike unit tests that test components in isolation, integration tests ensure complete user flows function as expected.

## Testing Strategy

### What to Test

1. **Complete Page Flows**
   - User navigates to page
   - Data loads correctly
   - User interactions work end-to-end

2. **Form Submissions**
   - Form validation
   - Submit success/error handling
   - Data persistence

3. **Table Interactions**
   - Sorting, filtering, pagination
   - Row selection
   - Bulk actions

4. **Modal Workflows**
   - Open/close modals
   - Form submission in modals
   - Data refresh after modal actions

## Test Examples

### Example 1: Dashboard Page Flow

```typescript
// src/app/admin/__tests__/dashboard.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../dashboard-new/page';

// Mock API calls
jest.mock('@/lib/api', () => ({
  fetchDashboardStats: jest.fn().mockResolvedValue({
    totalUsers: 100,
    totalVideos: 50,
    totalMessages: 25,
  }),
}));

describe('Dashboard Page Integration', () => {
  it('loads and displays dashboard stats', async () => {
    render(<DashboardPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  it('navigates to videos page when clicking video card', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Videos')).toBeInTheDocument();
    });
    
    const videoCard = screen.getByText('Videos').closest('a');
    await user.click(videoCard);
    
    // Verify navigation (with mocked router)
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/videos');
  });
});
```

### Example 2: Form Submission Flow

```typescript
// src/app/admin/__tests__/users-form.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersPage from '../users/page';

describe('Users Page - Form Submission', () => {
  it('creates new user successfully', async () => {
    const user = userEvent.setup();
    render(<UsersPage />);
    
    // Click "Add User" button
    const addButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addButton);
    
    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/user created successfully/i)).toBeInTheDocument();
    });
    
    // Verify modal closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    
    // Verify table updated
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows validation errors for invalid form', async () => {
    const user = userEvent.setup();
    render(<UsersPage />);
    
    const addButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addButton);
    
    // Submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);
    
    // Verify error messages
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Example 3: Table Interactions

```typescript
// src/app/admin/__tests__/videos-table.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideosPage from '../videos/page';

const mockVideos = [
  { id: '1', title: 'Video 1', status: 'visible' },
  { id: '2', title: 'Video 2', status: 'hidden' },
  { id: '3', title: 'Video 3', status: 'visible' },
];

describe('Videos Page - Table Interactions', () => {
  it('sorts table by title', async () => {
    const user = userEvent.setup();
    render(<VideosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Video 1')).toBeInTheDocument();
    });
    
    // Click title column header to sort
    const titleHeader = screen.getByText('Title');
    await user.click(titleHeader);
    
    // Verify sort order changed
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Video 1');
    
    // Click again to reverse sort
    await user.click(titleHeader);
    expect(rows[1]).toHaveTextContent('Video 3');
  });

  it('filters videos by search', async () => {
    const user = userEvent.setup();
    render(<VideosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Video 1')).toBeInTheDocument();
    });
    
    // Type in search input
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'Video 2');
    
    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText('Video 2')).toBeInTheDocument();
      expect(screen.queryByText('Video 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Video 3')).not.toBeInTheDocument();
    });
  });

  it('selects and deletes multiple videos', async () => {
    const user = userEvent.setup();
    render(<VideosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Video 1')).toBeInTheDocument();
    });
    
    // Select checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First video
    await user.click(checkboxes[2]); // Second video
    
    // Click bulk delete button
    const deleteButton = screen.getByRole('button', { name: /delete selected/i });
    await user.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);
    
    // Verify videos removed
    await waitFor(() => {
      expect(screen.queryByText('Video 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Video 2')).not.toBeInTheDocument();
      expect(screen.getByText('Video 3')).toBeInTheDocument();
    });
  });

  it('paginates through results', async () => {
    const user = userEvent.setup();
    render(<VideosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
    
    // Click next page
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    // Verify page changed
    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });
  });
});
```

### Example 4: Modal Workflow

```typescript
// src/app/admin/__tests__/products-modal.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsPage from '../products/page';

describe('Products Page - Modal Workflow', () => {
  it('opens edit modal and updates product', async () => {
    const user = userEvent.setup();
    render(<ProductsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    // Click edit button
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);
    
    // Verify modal opened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    
    // Update product name
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Product');
    
    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Verify modal closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    
    // Verify table updated
    expect(screen.getByText('Updated Product')).toBeInTheDocument();
  });

  it('closes modal without saving on cancel', async () => {
    const user = userEvent.setup();
    render(<ProductsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);
    
    // Make changes
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');
    
    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    // Verify modal closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    
    // Verify changes not saved
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.queryByText('Changed Name')).not.toBeInTheDocument();
  });
});
```

## Testing Best Practices

### 1. Setup and Teardown

```typescript
beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Setup test data
  mockAPI.fetchData.mockResolvedValue(testData);
});

afterEach(() => {
  // Cleanup
  cleanup();
});
```

### 2. Wait for Async Operations

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Use findBy queries (built-in waitFor)
const element = await screen.findByText('Loaded');
```

### 3. User Interactions

```typescript
// Use userEvent for realistic interactions
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
await user.selectOptions(select, 'option1');
```

### 4. Mock API Calls

```typescript
// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData),
  })
);

// Or use MSW (Mock Service Worker)
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 5. Test Accessibility

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<MyPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Running Integration Tests

```bash
# Run all integration tests
npm test -- --testPathPattern="integration"

# Run specific page tests
npm test -- --testPathPattern="dashboard.integration"

# Run with coverage
npm test -- --coverage --testPathPattern="integration"

# Watch mode
npm test -- --watch --testPathPattern="integration"
```

## Test Coverage Goals

- **Page Flows**: 80%+ coverage
- **Form Submissions**: 90%+ coverage
- **Table Interactions**: 85%+ coverage
- **Modal Workflows**: 85%+ coverage

## Common Issues and Solutions

### Issue 1: Async State Updates

**Problem**: Test fails because state hasn't updated yet

**Solution**: Use `waitFor` or `findBy` queries

```typescript
// ❌ Bad
expect(screen.getByText('Success')).toBeInTheDocument();

// ✅ Good
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// ✅ Better
const successMessage = await screen.findByText('Success');
expect(successMessage).toBeInTheDocument();
```

### Issue 2: Router Navigation

**Problem**: Tests fail because router is not mocked

**Solution**: Mock Next.js router

```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/admin/dashboard',
}));
```

### Issue 3: API Calls

**Problem**: Real API calls in tests

**Solution**: Mock API functions

```typescript
jest.mock('@/lib/api', () => ({
  fetchUsers: jest.fn().mockResolvedValue(mockUsers),
  createUser: jest.fn().mockResolvedValue(newUser),
}));
```

## Manual Testing Checklist

While automated tests are important, manual testing is also crucial:

### Page Load Testing
- [ ] Page loads without errors
- [ ] Loading states display correctly
- [ ] Data loads and displays properly
- [ ] Empty states show when no data

### Form Testing
- [ ] All form fields work correctly
- [ ] Validation errors display properly
- [ ] Success messages show after submission
- [ ] Form resets after successful submission

### Table Testing
- [ ] Sorting works on all sortable columns
- [ ] Filtering/search works correctly
- [ ] Pagination navigates properly
- [ ] Row selection works
- [ ] Bulk actions execute correctly

### Modal Testing
- [ ] Modals open and close properly
- [ ] ESC key closes modal
- [ ] Click outside closes modal
- [ ] Form submission in modal works
- [ ] Data refreshes after modal actions

### Responsive Testing
- [ ] Mobile view works correctly
- [ ] Tablet view works correctly
- [ ] Desktop view works correctly
- [ ] Touch interactions work on mobile

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus indicators visible
- [ ] Color contrast sufficient

## Conclusion

Integration testing ensures that the admin panel works correctly as a whole. Combine automated integration tests with manual testing for comprehensive coverage.

For questions or issues, refer to:
- [Component Library Guide](./COMPONENT_LIBRARY.md)
- [Design System Guide](./DESIGN_SYSTEM.md)
- [Final Verification Report](./FINAL_VERIFICATION_REPORT.md)
