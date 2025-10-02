import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminInput from '../AdminInput';

describe('AdminInput', () => {
  describe('Rendering', () => {
    it('renders input field', () => {
      render(<AdminInput />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<AdminInput label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<AdminInput placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<AdminInput helperText="This is helper text" />);
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('shows required indicator when required', () => {
      render(<AdminInput label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('has required attribute', () => {
      render(<AdminInput required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });
  });

  describe('Error State', () => {
    it('renders error message', () => {
      render(<AdminInput error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('applies error styling', () => {
      const { container } = render(<AdminInput error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('shows error text in red', () => {
      render(<AdminInput error="Error message" />);
      const errorText = screen.getByText('Error message');
      expect(errorText).toHaveClass('text-red-600');
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<AdminInput disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(<AdminInput disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    });
  });

  describe('Focus State', () => {
    it('applies focus ring on focus', () => {
      render(<AdminInput />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Value and onChange', () => {
    it('handles value prop', () => {
      render(<AdminInput value="test value" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('test value');
    });

    it('calls onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<AdminInput onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Input Types', () => {
    it('renders email type', () => {
      render(<AdminInput type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('renders password type', () => {
      render(<AdminInput type="password" />);
      const input = screen.getByLabelText('', { selector: 'input' });
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number type', () => {
      render(<AdminInput type="number" />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('renders with left icon', () => {
      const Icon = () => <span data-testid="left-icon">🔍</span>;
      render(<AdminInput leftIcon={<Icon />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const Icon = () => <span data-testid="right-icon">✓</span>;
      render(<AdminInput rightIcon={<Icon />} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes', () => {
      render(<AdminInput />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('dark:bg-gray-700', 'dark:border-gray-600', 'dark:text-white');
    });
  });

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<AdminInput label="Email" id="email-input" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('has aria-invalid when error exists', () => {
      render(<AdminInput error="Error" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-describedby for helper text', () => {
      render(<AdminInput helperText="Helper" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });
});
