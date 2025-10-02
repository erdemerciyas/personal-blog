import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminTabs from '../AdminTabs';

const mockTabs = [
  { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
  { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
];

describe('AdminTabs', () => {
  describe('Rendering', () => {
    it('renders all tab labels', () => {
      render(<AdminTabs tabs={mockTabs} />);
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('renders first tab content by default', () => {
      render(<AdminTabs tabs={mockTabs} />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('renders active tab content', () => {
      render(<AdminTabs tabs={mockTabs} activeTab="tab2" />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('switches tab when clicked', () => {
      render(<AdminTabs tabs={mockTabs} />);
      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('calls onChange when tab switched', () => {
      const handleChange = jest.fn();
      render(<AdminTabs tabs={mockTabs} onChange={handleChange} />);
      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);
      expect(handleChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Active Tab Highlighting', () => {
    it('highlights active tab', () => {
      const { container } = render(<AdminTabs tabs={mockTabs} activeTab="tab1" />);
      const activeTab = screen.getByText('Tab 1').closest('button');
      expect(activeTab).toHaveClass('border-blue-600', 'text-blue-600');
    });

    it('does not highlight inactive tabs', () => {
      const { container } = render(<AdminTabs tabs={mockTabs} activeTab="tab1" />);
      const inactiveTab = screen.getByText('Tab 2').closest('button');
      expect(inactiveTab).toHaveClass('border-transparent', 'text-gray-600');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports arrow key navigation', () => {
      render(<AdminTabs tabs={mockTabs} />);
      const tab1 = screen.getByText('Tab 1').closest('button');
      
      if (tab1) {
        tab1.focus();
        fireEvent.keyDown(tab1, { key: 'ArrowRight' });
        expect(screen.getByText('Content 2')).toBeInTheDocument();
      }
    });

    it('wraps around with arrow keys', () => {
      render(<AdminTabs tabs={mockTabs} activeTab="tab3" />);
      const tab3 = screen.getByText('Tab 3').closest('button');
      
      if (tab3) {
        tab3.focus();
        fireEvent.keyDown(tab3, { key: 'ArrowRight' });
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      }
    });

    it('supports left arrow key', () => {
      render(<AdminTabs tabs={mockTabs} activeTab="tab2" />);
      const tab2 = screen.getByText('Tab 2').closest('button');
      
      if (tab2) {
        tab2.focus();
        fireEvent.keyDown(tab2, { key: 'ArrowLeft' });
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      }
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes', () => {
      const { container } = render(<AdminTabs tabs={mockTabs} />);
      expect(container.querySelector('.dark\\:border-gray-700')).toBeInTheDocument();
    });

    it('has dark mode text colors', () => {
      const { container } = render(<AdminTabs tabs={mockTabs} />);
      expect(container.querySelector('.dark\\:text-gray-400')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has border bottom', () => {
      const { container } = render(<AdminTabs tabs={mockTabs} />);
      expect(container.querySelector('.border-b')).toBeInTheDocument();
    });

    it('tabs have bottom border', () => {
      const { container } = render(<AdminTabs tabs={mockTabs} />);
      const tab = screen.getByText('Tab 1').closest('button');
      expect(tab).toHaveClass('border-b-2');
    });
  });

  describe('Accessibility', () => {
    it('tabs have role tab', () => {
      render(<AdminTabs tabs={mockTabs} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(mockTabs.length);
    });

    it('has tablist role', () => {
      render(<AdminTabs tabs={mockTabs} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('active tab has aria-selected', () => {
      render(<AdminTabs tabs={mockTabs} activeTab="tab1" />);
      const activeTab = screen.getByText('Tab 1').closest('button');
      expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });

    it('inactive tabs have aria-selected false', () => {
      render(<AdminTabs tabs={mockTabs} activeTab="tab1" />);
      const inactiveTab = screen.getByText('Tab 2').closest('button');
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    });

    it('tab panel has role tabpanel', () => {
      render(<AdminTabs tabs={mockTabs} />);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
  });

  describe('Disabled Tabs', () => {
    it('renders disabled tab', () => {
      const tabsWithDisabled = [
        ...mockTabs,
        { id: 'tab4', label: 'Tab 4', content: <div>Content 4</div>, disabled: true },
      ];
      render(<AdminTabs tabs={tabsWithDisabled} />);
      const disabledTab = screen.getByText('Tab 4').closest('button');
      expect(disabledTab).toBeDisabled();
    });

    it('does not switch to disabled tab', () => {
      const tabsWithDisabled = [
        ...mockTabs,
        { id: 'tab4', label: 'Tab 4', content: <div>Content 4</div>, disabled: true },
      ];
      render(<AdminTabs tabs={tabsWithDisabled} />);
      const disabledTab = screen.getByText('Tab 4').closest('button');
      if (disabledTab) {
        fireEvent.click(disabledTab);
        expect(screen.queryByText('Content 4')).not.toBeInTheDocument();
      }
    });
  });
});
