import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminSpinner from '../AdminSpinner';

describe('AdminSpinner', () => {
  describe('Rendering', () => {
    it('renders spinner', () => {
      render(<AdminSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<AdminSpinner className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<AdminSpinner size="sm" />);
      expect(container.querySelector('.w-4')).toBeInTheDocument();
      expect(container.querySelector('.h-4')).toBeInTheDocument();
    });

    it('renders medium size by default', () => {
      const { container } = render(<AdminSpinner />);
      expect(container.querySelector('.w-8')).toBeInTheDocument();
      expect(container.querySelector('.h-8')).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(<AdminSpinner size="lg" />);
      expect(container.querySelector('.w-12')).toBeInTheDocument();
      expect(container.querySelector('.h-12')).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('renders primary color by default', () => {
      const { container } = render(<AdminSpinner />);
      expect(container.querySelector('.border-blue-600')).toBeInTheDocument();
    });

    it('renders white color', () => {
      const { container } = render(<AdminSpinner color="white" />);
      expect(container.querySelector('.border-white')).toBeInTheDocument();
    });

    it('renders gray color', () => {
      const { container } = render(<AdminSpinner color="gray" />);
      expect(container.querySelector('.border-gray-600')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('has spin animation', () => {
      const { container } = render(<AdminSpinner />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('has circular border', () => {
      const { container } = render(<AdminSpinner />);
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    });
  });

  describe('Centering', () => {
    it('centers spinner when centered prop is true', () => {
      const { container } = render(<AdminSpinner centered />);
      expect(container.firstChild).toHaveClass('flex', 'justify-center', 'items-center');
    });

    it('does not center by default', () => {
      const { container } = render(<AdminSpinner />);
      expect(container.firstChild).not.toHaveClass('justify-center');
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes', () => {
      const { container } = render(<AdminSpinner />);
      expect(container.querySelector('.dark\\:border-blue-400')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role status', () => {
      render(<AdminSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has sr-only loading text', () => {
      render(<AdminSpinner />);
      expect(screen.getByText(/loading/i)).toHaveClass('sr-only');
    });
  });
});
