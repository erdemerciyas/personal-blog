import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '@/components/Logo';

describe('Logo Component', () => {
  it('should render with default props', () => {
    const { container } = render(<Logo />);
    
    // Logo SVG'sinin render edildiğini kontrol et
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('should render with custom dimensions', () => {
    const customWidth = 60;
    const customHeight = 60;
    
    const { container } = render(<Logo width={customWidth} height={customHeight} />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveAttribute('width', customWidth.toString());
    expect(svgElement).toHaveAttribute('height', customHeight.toString());
  });

  it('should render with brand name', () => {
    const brandName = 'FIXRAL';
    
    render(<Logo name={brandName} />);
    
    expect(screen.getByText(brandName)).toBeInTheDocument();
  });

  it('should render with subtitle', () => {
    const subtitle = 'Engineering Excellence';
    
    render(<Logo subtitle={subtitle} />);
    
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it('should render with both name and subtitle', () => {
    const brandName = 'FIXRAL';
    const subtitle = 'Engineering Excellence';
    
    render(<Logo name={brandName} subtitle={subtitle} />);
    
    expect(screen.getByText(brandName)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-logo-class';
    
    const { container } = render(<Logo className={customClass} />);
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('should apply dark theme styles when isDark is true', () => {
    const brandName = 'FIXRAL';
    
    render(<Logo name={brandName} isDark={true} />);
    
    const nameElement = screen.getByText(brandName);
    expect(nameElement).toHaveClass('text-fixral-night-blue');
  });

  it('should apply light theme styles when isDark is false', () => {
    const brandName = 'FIXRAL';
    
    render(<Logo name={brandName} isDark={false} />);
    
    const nameElement = screen.getByText(brandName);
    expect(nameElement).toHaveClass('text-white');
  });

  it('should have correct SVG viewBox', () => {
    const { container } = render(<Logo />);
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 40 40');
  });

  it('should not render text container when neither name nor subtitle provided', () => {
    const { container } = render(<Logo />);
    
    // Text container div'inin olmadığını kontrol et
    const textContainer = container.querySelector('.flex.flex-col');
    expect(textContainer).not.toBeInTheDocument();
  });

  it('should render text container when name is provided', () => {
    const { container } = render(<Logo name="Test" />);
    
    const textContainer = container.querySelector('.flex.flex-col');
    expect(textContainer).toBeInTheDocument();
  });

  it('should render text container when subtitle is provided', () => {
    const { container } = render(<Logo subtitle="Test Subtitle" />);
    
    const textContainer = container.querySelector('.flex.flex-col');
    expect(textContainer).toBeInTheDocument();
  });
});