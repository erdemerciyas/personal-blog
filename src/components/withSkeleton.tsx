'use client';

import React, { ComponentType, useState, useEffect } from 'react';
import SkeletonLoader from './SkeletonLoader';

interface WithSkeletonOptions {
  type?: 'text' | 'card' | 'image' | 'button' | 'avatar' | 'list';
  count?: number;
  className?: string;
  delay?: number;
}

function withSkeleton<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithSkeletonOptions = {}
) {
  const {
    type = 'card',
    count = 3,
    className = '',
    delay = 500
  } = options;

  return function WithSkeletonComponent(props: P) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, delay);

      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
      return (
        <div className={`skeleton-container ${className}`}>
          <SkeletonLoader type={type} count={count} />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export default withSkeleton;