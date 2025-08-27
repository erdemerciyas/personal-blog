import { render, screen } from '@testing-library/react';
import Logo from '../Logo';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('Logo Component', () => {
  it('renders logo component', () => {
    render(<Logo />);
    
    // Logo component should be in the document
    const logoElement = screen.getByRole('img', { name: /logo/i });
    expect(logoElement).toBeInTheDocument();
  });

  it('has correct alt text', () => {
    render(<Logo />);
    
    const logoElement = screen.getByRole('img');
    expect(logoElement).toHaveAttribute('alt');
  });
});