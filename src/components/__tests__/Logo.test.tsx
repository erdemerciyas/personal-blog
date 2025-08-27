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
    const { container } = render(<Logo />);
    
    // Logo component should be in the document (it's an SVG)
    const logoContainer = container.querySelector('.flex.items-center');
    expect(logoContainer).toBeInTheDocument();
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders SVG with correct structure', () => {
    render(<Logo />);
    
    // Check for SVG element
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('viewBox', '0 0 40 40');
  });

  it('renders with custom props', () => {
    render(<Logo width={50} height={50} name="FIXRAL" subtitle="Engineering" />);
    
    const svgElement = document.querySelector('svg');
    expect(svgElement).toHaveAttribute('width', '50');
    expect(svgElement).toHaveAttribute('height', '50');
    
    expect(screen.getByText('FIXRAL')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });
});