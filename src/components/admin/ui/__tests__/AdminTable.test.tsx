import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminTable from '../AdminTable';

const mockColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
];

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

describe('AdminTable', () => {
  describe('Rendering', () => {
    it('renders table with columns', () => {
      render(<AdminTable columns={mockColumns} data={mockData} />);
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders table with data', () => {
      render(<AdminTable columns={mockColumns} data={mockData} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(<AdminTable columns={mockColumns} data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('shows sort icons for sortable columns', () => {
      const { container } = render(<AdminTable columns={mockColumns} data={mockData} />);
      const sortIcons = container.querySelectorAll('.cursor-pointer');
      expect(sortIcons.length).toBeGreaterThan(0);
    });

    it('calls onSort when sortable column clicked', () => {
      const handleSort = jest.fn();
      render(<AdminTable columns={mockColumns} data={mockData} onSort={handleSort} />);
      const idHeader = screen.getByText('ID');
      fireEvent.click(idHeader);
      expect(handleSort).toHaveBeenCalledWith('id', 'asc');
    });

    it('toggles sort direction on repeated clicks', () => {
      const handleSort = jest.fn();
      render(<AdminTable columns={mockColumns} data={mockData} onSort={handleSort} sortKey="id" sortDirection="asc" />);
      const idHeader = screen.getByText('ID');
      fireEvent.click(idHeader);
      expect(handleSort).toHaveBeenCalledWith('id', 'desc');
    });
  });

  describe('Row Selection', () => {
    it('renders checkboxes when selectable', () => {
      render(<AdminTable columns={mockColumns} data={mockData} selectable />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(mockData.length + 1); // +1 for select all
    });

    it('calls onSelectionChange when row selected', () => {
      const handleSelection = jest.fn();
      render(<AdminTable columns={mockColumns} data={mockData} selectable onSelectionChange={handleSelection} />);
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First data row
      expect(handleSelection).toHaveBeenCalled();
    });

    it('selects all rows when select all clicked', () => {
      const handleSelection = jest.fn();
      render(<AdminTable columns={mockColumns} data={mockData} selectable onSelectionChange={handleSelection} />);
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);
      expect(handleSelection).toHaveBeenCalledWith(mockData.map(d => d.id));
    });
  });

  describe('Pagination', () => {
    it('renders pagination when provided', () => {
      render(
        <AdminTable 
          columns={mockColumns} 
          data={mockData}
          pagination={{
            currentPage: 1,
            totalPages: 5,
            pageSize: 10,
            totalItems: 50,
            onPageChange: jest.fn(),
          }}
        />
      );
      expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
    });

    it('calls onPageChange when page changed', () => {
      const handlePageChange = jest.fn();
      render(
        <AdminTable 
          columns={mockColumns} 
          data={mockData}
          pagination={{
            currentPage: 1,
            totalPages: 5,
            pageSize: 10,
            totalItems: 50,
            onPageChange: handlePageChange,
          }}
        />
      );
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Loading State', () => {
    it('shows skeleton when loading', () => {
      render(<AdminTable columns={mockColumns} data={[]} loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('hides data when loading', () => {
      render(<AdminTable columns={mockColumns} data={mockData} loading />);
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no data', () => {
      render(<AdminTable columns={mockColumns} data={[]} emptyMessage="No records found" />);
      expect(screen.getByText('No records found')).toBeInTheDocument();
    });

    it('shows default empty message', () => {
      render(<AdminTable columns={mockColumns} data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });

  describe('Row Hover', () => {
    it('has hover effect on rows', () => {
      const { container } = render(<AdminTable columns={mockColumns} data={mockData} />);
      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('Actions Column', () => {
    it('renders actions when provided', () => {
      const columnsWithActions = [
        ...mockColumns,
        {
          key: 'actions',
          label: 'Actions',
          render: () => <button>Edit</button>,
        },
      ];
      render(<AdminTable columns={columnsWithActions} data={mockData} />);
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBe(mockData.length);
    });
  });

  describe('Responsive Design', () => {
    it('has responsive classes', () => {
      const { container } = render(<AdminTable columns={mockColumns} data={mockData} />);
      expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
    });

    it('shows card view on mobile', () => {
      const { container } = render(<AdminTable columns={mockColumns} data={mockData} />);
      expect(container.querySelector('.md\\:table')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes', () => {
      const { container } = render(<AdminTable columns={mockColumns} data={mockData} />);
      expect(container.querySelector('.dark\\:bg-gray-800')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has table role', () => {
      render(<AdminTable columns={mockColumns} data={mockData} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('has proper table structure', () => {
      render(<AdminTable columns={mockColumns} data={mockData} />);
      expect(screen.getByRole('table')).toContainElement(screen.getAllByRole('row')[0]);
    });

    it('has column headers', () => {
      render(<AdminTable columns={mockColumns} data={mockData} />);
      expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    });
  });
});
