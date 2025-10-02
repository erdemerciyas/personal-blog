# Performance Optimization Guide - Admin UI/UX

Complete guide for optimizing the performance of the admin panel components and pages.

## Overview

This guide provides strategies and techniques for optimizing the performance of the admin panel, including code splitting, render optimization, and animation performance.

## 1. Code Splitting

### Dynamic Imports for Heavy Components

**Modal Component:**
```typescript
// src/components/admin/ui/AdminModal.lazy.tsx
import dynamic from 'next/dynamic';
import AdminSpinner from './AdminSpinner';

const AdminModal = dynamic(() => import('./AdminModal'), {
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center">
      <AdminSpinner size="lg" />
    </div>
  ),
  ssr: false, // Modals don't need SSR
});

export default AdminModal;
```

**Table Component:**
```typescript
// src/components/admin/ui/AdminTable.lazy.tsx
import dynamic from 'next/dynamic';
import AdminSkeleton from './AdminSkeleton';

const AdminTable = dynamic(() => import('./AdminTable'), {
  loading: () => <AdminSkeleton variant="table" />,
});

export default AdminTable;
```

**Usage:**
```typescript
// Instead of:
import AdminModal from '@/components/admin/ui/AdminModal';

// Use:
import AdminModal from '@/components/admin/ui/AdminModal.lazy';
```

### Route-Based Code Splitting

Next.js automatically code-splits by route, but you can optimize further:

```typescript
// src/app/admin/videos/page.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VideoTable = dynamic(() => import('@/components/admin/VideoTable'), {
  loading: () => <TableSkeleton />,
});

const VideoModal = dynamic(() => import('@/components/admin/VideoModal'), {
  ssr: false,
});

export default function VideosPage() {
  return (
    <AdminLayoutNew title="Videos">
      <VideoTable />
      {showModal && <VideoModal />}
    </AdminLayoutNew>
  );
}
```

### Suspense Boundaries

```typescript
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <AdminLayoutNew title="Dashboard">
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton />}>
        <RecentActivity />
      </Suspense>
    </AdminLayoutNew>
  );
}
```

## 2. Render Optimization

### React.memo for Expensive Components

**AdminCard with memo:**
```typescript
// src/components/admin/ui/AdminCard.tsx
import React, { memo } from 'react';

interface AdminCardProps {
  title?: string;
  children: React.ReactNode;
  // ... other props
}

const AdminCard = memo(function AdminCard({
  title,
  children,
  ...props
}: AdminCardProps) {
  return (
    <article className="...">
      {title && <h2>{title}</h2>}
      {children}
    </article>
  );
});

export default AdminCard;
```

**AdminTable with memo:**
```typescript
// src/components/admin/ui/AdminTable.tsx
import React, { memo } from 'react';

const AdminTable = memo(function AdminTable<T>({
  columns,
  data,
  ...props
}: AdminTableProps<T>) {
  // Component logic...
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.data === nextProps.data &&
    prevProps.sortColumn === nextProps.sortColumn &&
    prevProps.sortDirection === nextProps.sortDirection
  );
});

export default AdminTable;
```

### useCallback for Event Handlers

```typescript
import { useCallback, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Memoize callbacks
  const handleSort = useCallback((column: string, direction: 'asc' | 'desc') => {
    const sorted = [...users].sort((a, b) => {
      if (direction === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      }
      return a[column] < b[column] ? 1 : -1;
    });
    setUsers(sorted);
  }, [users]);

  const handleSelectRows = useCallback((rows: Set<string>) => {
    setSelectedRows(rows);
  }, []);

  const handleDelete = useCallback(async () => {
    // Delete logic...
    setSelectedRows(new Set());
  }, [selectedRows]);

  return (
    <AdminTable
      data={users}
      onSort={handleSort}
      onSelectRows={handleSelectRows}
      onDelete={handleDelete}
    />
  );
}
```

### useMemo for Computed Values

```typescript
import { useMemo } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  // Memoize statistics
  const stats = useMemo(() => {
    return {
      total: filteredData.length,
      active: filteredData.filter(item => item.status === 'active').length,
      inactive: filteredData.filter(item => item.status === 'inactive').length,
    };
  }, [filteredData]);

  return (
    <div>
      <StatsCards stats={stats} />
      <DataTable data={filteredData} />
    </div>
  );
}
```

### Virtualization for Long Lists

```typescript
// Install react-window
// npm install react-window

import { FixedSizeList } from 'react-window';

export default function LargeList({ items }: { items: any[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="border-b p-4">
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## 3. Animation Optimization

### Use CSS Transforms

```css
/* ❌ Bad - triggers layout */
.modal-enter {
  top: -100px;
  transition: top 300ms;
}

.modal-enter-active {
  top: 0;
}

/* ✅ Good - GPU accelerated */
.modal-enter {
  transform: translateY(-100px);
  transition: transform 300ms;
}

.modal-enter-active {
  transform: translateY(0);
}
```

### Reduced Motion Support

```typescript
// src/hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

**Usage:**
```typescript
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`
        transition-all
        ${prefersReducedMotion ? 'duration-0' : 'duration-300'}
      `}
    >
      Content
    </div>
  );
}
```

### Optimize Transition Timings

```typescript
// src/lib/animations.ts
export const transitions = {
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
  verySlow: 'duration-500',
};

export const easings = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  linear: 'linear',
};

// Usage
<div className={`transition-all ${transitions.normal} ${easings.easeInOut}`}>
  Content
</div>
```

## 4. Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image';

// ❌ Bad
<img src="/logo.png" alt="Logo" />

// ✅ Good
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // For above-the-fold images
/>

// ✅ Better - with optimization
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  quality={85}
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### Lazy Loading Images

```typescript
<Image
  src="/large-image.jpg"
  alt="Large Image"
  width={800}
  height={600}
  loading="lazy" // Lazy load below-the-fold images
/>
```

## 5. Bundle Size Optimization

### Analyze Bundle

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... your config
});

# Run analysis
ANALYZE=true npm run build
```

### Tree Shaking

```typescript
// ❌ Bad - imports entire library
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ Good - imports only what's needed
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);

// ✅ Better - use native or smaller alternatives
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```

### Remove Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall package-name
```

## 6. Data Fetching Optimization

### SWR for Client-Side Fetching

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UsersPage() {
  const { data, error, isLoading } = useSWR('/api/users', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  });

  if (isLoading) return <AdminSpinner />;
  if (error) return <AdminErrorState />;

  return <AdminTable data={data} />;
}
```

### React Query for Advanced Caching

```typescript
import { useQuery } from '@tanstack/react-query';

export default function VideosPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: () => fetch('/api/videos').then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) return <AdminSpinner />;
  if (error) return <AdminErrorState />;

  return <AdminTable data={data} />;
}
```

### Pagination for Large Datasets

```typescript
export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data } = useSWR(
    `/api/products?page=${page}&pageSize=${pageSize}`,
    fetcher
  );

  return (
    <AdminTable
      data={data.items}
      pagination={{
        currentPage: page,
        totalPages: Math.ceil(data.total / pageSize),
        pageSize,
        totalItems: data.total,
        onPageChange: setPage,
      }}
    />
  );
}
```

## 7. Performance Monitoring

### Web Vitals

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Performance Monitoring

```typescript
// src/lib/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
  }

  return duration;
}

// Usage
measurePerformance('Table Sort', () => {
  sortData(data);
});
```

## 8. Best Practices Checklist

### Component Level
- [ ] Use React.memo for expensive components
- [ ] Use useCallback for event handlers
- [ ] Use useMemo for computed values
- [ ] Avoid inline object/array creation in render
- [ ] Use keys properly in lists
- [ ] Avoid unnecessary re-renders

### Page Level
- [ ] Implement code splitting for heavy components
- [ ] Use Suspense boundaries
- [ ] Lazy load below-the-fold content
- [ ] Optimize images with Next.js Image
- [ ] Implement pagination for large lists
- [ ] Use SWR or React Query for data fetching

### Bundle Level
- [ ] Analyze bundle size regularly
- [ ] Tree shake unused code
- [ ] Remove unused dependencies
- [ ] Use dynamic imports for large libraries
- [ ] Optimize third-party scripts

### Animation Level
- [ ] Use CSS transforms instead of layout properties
- [ ] Implement reduced motion support
- [ ] Optimize transition timings
- [ ] Use GPU-accelerated properties
- [ ] Avoid animating expensive properties

## 9. Performance Targets

### Load Time
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s

### Runtime Performance
- **Frame Rate**: 60 FPS
- **Input Delay**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Bundle Size
- **First Load JS**: < 100 kB
- **Page JS**: < 50 kB per page
- **Shared JS**: < 90 kB

## 10. Measuring Performance

### Chrome DevTools

**Performance Tab:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with page
5. Stop recording
6. Analyze flame chart

**Lighthouse:**
1. Open DevTools
2. Go to Lighthouse tab
3. Select Performance category
4. Generate report
5. Review recommendations

### React DevTools Profiler

1. Install React DevTools extension
2. Open DevTools
3. Go to Profiler tab
4. Click Record
5. Interact with components
6. Stop recording
7. Analyze render times

## Conclusion

Performance optimization is an ongoing process. Regularly monitor performance metrics and optimize as needed. Focus on the biggest bottlenecks first for maximum impact.

**Target:** 90+ Lighthouse Performance Score

For questions or issues, refer to:
- [Component Library Guide](./COMPONENT_LIBRARY.md)
- [Design System Guide](./DESIGN_SYSTEM.md)
- [Final Verification Report](./FINAL_VERIFICATION_REPORT.md)
