import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminBadge from '../AdminBadge';

describe('AdminBadge', () => {
  describe('Rendering', () => {
    it('renders badge with children', () => {
      render(<AdminBadge>Badge Text</AdminBadge>);
      expect(screen.getByText('Badge Text')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<AdminBadge className="custom-class">Badge</AdminBadge>);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders success variant', () => {
      const { container } = render(<AdminBadge variant="success">Success</AdminBadge>);
      expect(container.firstChild).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders error variant', () => {
      const { container } = render(<AdminBadge variant="error">Error</AdminBadge>);
      expect(container.firstChild).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('renders warning variant', () => {
      const { container } = render(<AdminBadge variant="warning">Warning</AdminBadge>);
      expect(container.firstChild).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders info variant', () => {
      const { container } = render(<AdminBadge variant="info">Info</AdminBadge>);
      expect(container.firstChild).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders neutral variant by default', () => {
      const { container } = render(<AdminBadge>Neutral</AdminBadge>);
      expect(container.firstChild).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<AdminBadge size="sm">Small</AdminBadge>);
      expect(container.firstChild).toHaveClass('text-xs', 'px-2', 'py-0.5');
    });

    it('renders medium size by default', () => {
      const { container } = render(<AdminBadge>Medium</AdminBadge>);
      expect(container.firstChild).toHaveClass('text-sm', 'px-2.5', 'py-0.5');
    });

    it('renders large size', () => {
      const { container } = render(<AdminBadge size="lg">Large</AdminBadge>);
      expect(container.firstChild).toHaveClass('text-base', 'px-3', 'py-1');
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes for success', () => {
      const { container } = render(<AdminBadge variant="success">Success</AdminBadge>);
      expect(container.firstChild).toHaveClass('dark:bg-green-900', 'dark:text-green-200');
    });

    it('has dark mode classes for error', () => {
      const { container } = render(<AdminBadge variant="error">Error</AdminBadge>);
      expect(container.firstChild).toHaveClass('dark:bg-red-900', 'dark:text-red-200');
    });
  });

  describe('Styling', () => {
    it('has rounded corners', () => {
      const { container } = render(<AdminBadge>Badge</AdminBadge>);
      expect(container.firstChild).toHaveClass('rounded-full');
    });

    it('has inline-flex display', () => {
      const { container } = render(<AdminBadge>Badge</AdminBadge>);
      expect(container.firstChild).toHaveClass('inline-flex');
    });

    it('has font-medium weight', () => {
      const { container } = render(<AdminBadge>Badge</AdminBadge>);
      expect(container.firstChild).toHaveClass('font-medium');
    });
  });
});
