import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminCard from '../AdminCard';

describe('AdminCard', () => {
  describe('Rendering', () => {
    it('renders card with children', () => {
      render(<AdminCard>Card content</AdminCard>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<AdminCard className="custom-class">Content</AdminCard>);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Header', () => {
    it('renders title when provided', () => {
      render(<AdminCard title="Card Title">Content</AdminCard>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders header actions when provided', () => {
      const actions = <button>Action</button>;
      render(<AdminCard title="Title" actions={actions}>Content</AdminCard>);
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('does not render header when no title or actions', () => {
      const { container } = render(<AdminCard>Content</AdminCard>);
      expect(container.querySelector('.border-b')).not.toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders footer when provided', () => {
      const footer = <div>Footer content</div>;
      render(<AdminCard footer={footer}>Content</AdminCard>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('does not render footer when not provided', () => {
      const { container } = render(<AdminCard>Content</AdminCard>);
      const footers = container.querySelectorAll('.border-t');
      expect(footers.length).toBe(0);
    });
  });

  describe('Padding', () => {
    it('applies default padding', () => {
      const { container } = render(<AdminCard>Content</AdminCard>);
      expect(container.firstChild).toHaveClass('p-6');
    });

    it('applies small padding', () => {
      const { container } = render(<AdminCard padding="sm">Content</AdminCard>);
      expect(container.firstChild).toHaveClass('p-4');
    });

    it('applies large padding', () => {
      const { container } = render(<AdminCard padding="lg">Content</AdminCard>);
      expect(container.firstChild).toHaveClass('p-8');
    });

    it('applies no padding', () => {
      const { container } = render(<AdminCard padding="none">Content</AdminCard>);
      expect(container.firstChild).toHaveClass('p-0');
    });
  });

  describe('Hover Effect', () => {
    it('has hover effect by default', () => {
      const { container } = render(<AdminCard>Content</AdminCard>);
      expect(container.firstChild).toHaveClass('hover:shadow-lg');
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes', () => {
      const { container } = render(<AdminCard>Content</AdminCard>);
      expect(container.firstChild).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
    });
  });

  describe('Accessibility', () => {
    it('renders as article element', () => {
      const { container } = render(<AdminCard>Content</AdminCard>);
      expect(container.querySelector('article')).toBeInTheDocument();
    });
  });
});
