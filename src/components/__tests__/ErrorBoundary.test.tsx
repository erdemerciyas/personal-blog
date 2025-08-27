import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';
import { PerformanceMonitor } from '@/lib/monitoring';

// Mock the monitoring library
jest.mock('@/lib/monitoring', () => ({
  PerformanceMonitor: {
    captureException: jest.fn(),
  },
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Bir şeyler ters gitti')).toBeInTheDocument();
    expect(screen.getByText('Sayfayı Yenile')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call PerformanceMonitor.captureException when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(PerformanceMonitor.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        type: 'react_error_boundary',
        componentStack: expect.any(String),
        errorBoundary: true,
      })
    );
  });

  it('should call custom onError handler when provided', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });
});

describe('withErrorBoundary HOC', () => {
  it('should wrap component with ErrorBoundary', () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('Bir şeyler ters gitti')).toBeInTheDocument();
  });

  it('should use custom fallback in HOC', () => {
    const customFallback = <div>HOC Custom error</div>;
    const WrappedComponent = withErrorBoundary(ThrowError, customFallback);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('HOC Custom error')).toBeInTheDocument();
  });
});