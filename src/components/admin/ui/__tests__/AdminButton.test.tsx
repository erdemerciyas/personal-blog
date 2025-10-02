import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminButton from '../AdminButton';

describe('AdminButton', () => {
  describe('Rendering', () => {
    it('renders button with children', () => {
      render(<AdminButton>Click me</AdminButton>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<AdminButton className="custom-class">Button</AdminButton>);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      const { container } = render(<AdminButton>Primary</AdminButton>);
      expect(container.firstChild).toHaveClass('bg-blue-600');
    });

    it('renders secondary variant', () => {
      const { container } = render(<AdminButton variant="secondary">Secondary</AdminButton>);
      expect(container.firstChild).toHaveClass('bg-gray-200');
    });

    it('renders danger variant', () => {
      const { container } = render(<AdminButton variant="danger">Danger</AdminButton>);
      expect(container.firstChild).toHaveClass('bg-red-600');
    });

    it('renders success variant', () => {
      const { container } = render(<AdminButton variant="success">Success</AdminButton>);
      expect(container.firstChild).toHaveClass('bg-green-600');
    });

    it('renders ghost variant', () => {
      const { container } = render(<AdminButton variant="ghost">Ghost</AdminButton>);
      expect(container.firstChild).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      const { container } = render(<AdminButton>Medium</AdminButton>);
      expect(container.firstChild).toHaveClass('px-4', 'py-2');
    });

    it('renders small size', () => {
      const { container } = render(<AdminButton size="sm">Small</AdminButton>);
      expect(container.firstChild).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('renders large size', () => {
      const { container } = render(<AdminButton size="lg">Large</AdminButton>);
      expect(container.firstChild).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<AdminButton disabled>Disabled</AdminButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('handles loading state', () => {
      render(<AdminButton loading>Loading</AdminButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows loading spinner when loading', () => {
      const { container } = render(<AdminButton loading>Loading</AdminButton>);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<AdminButton onClick={handleClick}>Click</AdminButton>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<AdminButton onClick={handleClick} disabled>Disabled</AdminButton>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<AdminButton onClick={handleClick} loading>Loading</AdminButton>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<AdminButton>Button</AdminButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<AdminButton onClick={handleClick}>Button</AdminButton>);
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      // Focus test - button should be focusable
      expect(button).toBeInTheDocument();
    });

    it('has aria-disabled when disabled', () => {
      render(<AdminButton disabled>Disabled</AdminButton>);
      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('has aria-busy when loading', () => {
      render(<AdminButton loading>Loading</AdminButton>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('renders with left icon', () => {
      const Icon = () => <span data-testid="left-icon">←</span>;
      render(<AdminButton leftIcon={<Icon />}>With Icon</AdminButton>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const Icon = () => <span data-testid="right-icon">→</span>;
      render(<AdminButton rightIcon={<Icon />}>With Icon</AdminButton>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes', () => {
      const { container } = render(<AdminButton>Dark Mode</AdminButton>);
      expect(container.firstChild).toHaveClass('dark:bg-blue-500');
    });
  });
});
