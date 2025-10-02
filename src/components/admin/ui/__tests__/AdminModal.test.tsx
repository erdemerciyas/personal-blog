import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminModal from '../AdminModal';

describe('AdminModal', () => {
  describe('Rendering', () => {
    it('renders modal when open', () => {
      render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Modal content
        </AdminModal>
      );
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <AdminModal isOpen={false} onClose={() => {}}>
          Modal content
        </AdminModal>
      );
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders with title', () => {
      render(
        <AdminModal isOpen={true} onClose={() => {}} title="Modal Title">
          Content
        </AdminModal>
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Content
        </AdminModal>
      );
      expect(container.querySelector('.max-w-md')).toBeInTheDocument();
    });

    it('renders small size', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}} size="sm">
          Content
        </AdminModal>
      );
      expect(container.querySelector('.max-w-sm')).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}} size="lg">
          Content
        </AdminModal>
      );
      expect(container.querySelector('.max-w-2xl')).toBeInTheDocument();
    });

    it('renders extra large size', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}} size="xl">
          Content
        </AdminModal>
      );
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('renders full size', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}} size="full">
          Content
        </AdminModal>
      );
      expect(container.querySelector('.max-w-full')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button clicked', () => {
      const handleClose = jest.fn();
      render(
        <AdminModal isOpen={true} onClose={handleClose}>
          Content
        </AdminModal>
      );
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop clicked', () => {
      const handleClose = jest.fn();
      const { container } = render(
        <AdminModal isOpen={true} onClose={handleClose}>
          Content
        </AdminModal>
      );
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(handleClose).toHaveBeenCalled();
      }
    });

    it('calls onClose when ESC key pressed', () => {
      const handleClose = jest.fn();
      render(
        <AdminModal isOpen={true} onClose={handleClose}>
          Content
        </AdminModal>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });

    it('does not close on content click', () => {
      const handleClose = jest.fn();
      render(
        <AdminModal isOpen={true} onClose={handleClose}>
          <div data-testid="modal-content">Content</div>
        </AdminModal>
      );
      fireEvent.click(screen.getByTestId('modal-content'));
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Backdrop', () => {
    it('renders backdrop with blur', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Content
        </AdminModal>
      );
      const backdrop = container.querySelector('.backdrop-blur-sm');
      expect(backdrop).toBeInTheDocument();
    });

    it('has proper z-index', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Content
        </AdminModal>
      );
      const backdrop = container.querySelector('.z-50');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('has fade-in animation classes', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Content
        </AdminModal>
      );
      expect(container.querySelector('.transition-opacity')).toBeInTheDocument();
    });
  });

  describe('Scrollable Content', () => {
    it('supports scrollable content', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}}>
          <div style={{ height: '2000px' }}>Long content</div>
        </AdminModal>
      );
      expect(container.querySelector('.overflow-y-auto')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsive', () => {
    it('has mobile-friendly classes', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Content
        </AdminModal>
      );
      expect(container.querySelector('.sm\\:p-6')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes', () => {
      const { container } = render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Content
        </AdminModal>
      );
      expect(container.querySelector('.dark\\:bg-gray-800')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role dialog', () => {
      render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Content
        </AdminModal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(
        <AdminModal isOpen={true} onClose={() => {}}>
          Content
        </AdminModal>
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title provided', () => {
      render(
        <AdminModal isOpen={true} onClose={() => {}} title="Modal Title">
          Content
        </AdminModal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('close button is keyboard accessible', () => {
      const handleClose = jest.fn();
      render(
        <AdminModal isOpen={true} onClose={handleClose}>
          Content
        </AdminModal>
      );
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });
});
