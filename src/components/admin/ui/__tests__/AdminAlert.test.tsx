import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminAlert from '../AdminAlert';

describe('AdminAlert', () => {
  describe('Rendering', () => {
    it('renders alert with children', () => {
      render(<AdminAlert>Alert message</AdminAlert>);
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<AdminAlert className="custom-class">Alert</AdminAlert>);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders success variant', () => {
      const { container } = render(<AdminAlert variant="success">Success</AdminAlert>);
      expect(container.firstChild).toHaveClass('bg-green-50', 'border-green-200');
    });

    it('renders error variant', () => {
      const { container } = render(<AdminAlert variant="error">Error</AdminAlert>);
      expect(container.firstChild).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('renders warning variant', () => {
      const { container } = render(<AdminAlert variant="warning">Warning</AdminAlert>);
      expect(container.firstChild).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });

    it('renders info variant by default', () => {
      const { container } = render(<AdminAlert>Info</AdminAlert>);
      expect(container.firstChild).toHaveClass('bg-blue-50', 'border-blue-200');
    });
  });

  describe('Close Button', () => {
    it('renders close button when onClose provided', () => {
      render(<AdminAlert onClose={() => {}}>Alert</AdminAlert>);
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('does not render close button when onClose not provided', () => {
      render(<AdminAlert>Alert</AdminAlert>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onClose when close button clicked', () => {
      const handleClose = jest.fn();
      render(<AdminAlert onClose={handleClose}>Alert</AdminAlert>);
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon Support', () => {
    it('renders with icon', () => {
      const Icon = () => <span data-testid="alert-icon">ℹ️</span>;
      render(<AdminAlert icon={<Icon />}>Alert</AdminAlert>);
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('renders default icon for success', () => {
      const { container } = render(<AdminAlert variant="success">Success</AdminAlert>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes for success', () => {
      const { container } = render(<AdminAlert variant="success">Success</AdminAlert>);
      expect(container.firstChild).toHaveClass('dark:bg-green-900', 'dark:border-green-700');
    });

    it('has dark mode classes for error', () => {
      const { container } = render(<AdminAlert variant="error">Error</AdminAlert>);
      expect(container.firstChild).toHaveClass('dark:bg-red-900', 'dark:border-red-700');
    });
  });

  describe('Styling', () => {
    it('has border', () => {
      const { container } = render(<AdminAlert>Alert</AdminAlert>);
      expect(container.firstChild).toHaveClass('border');
    });

    it('has rounded corners', () => {
      const { container } = render(<AdminAlert>Alert</AdminAlert>);
      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('has padding', () => {
      const { container } = render(<AdminAlert>Alert</AdminAlert>);
      expect(container.firstChild).toHaveClass('p-4');
    });
  });

  describe('Accessibility', () => {
    it('has role alert', () => {
      render(<AdminAlert>Alert message</AdminAlert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('close button is keyboard accessible', () => {
      const handleClose = jest.fn();
      render(<AdminAlert onClose={handleClose}>Alert</AdminAlert>);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
      fireEvent.keyDown(closeButton, { key: 'Enter' });
    });
  });
});
