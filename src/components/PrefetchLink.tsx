'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useState, useCallback } from 'react';

interface PrefetchLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}

/**
 * Enhanced Link component with intelligent prefetching
 * - Prefetches on hover/focus for instant navigation
 * - Reduces perceived load time
 * - Maintains all standard Link functionality
 * - Properly handles onClick callbacks
 */
export default function PrefetchLink({
  href,
  children,
  className,
  prefetch = true,
  onClick,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  const [isPrefetched, setIsPrefetched] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (prefetch && !isPrefetched) {
      router.prefetch(href);
      setIsPrefetched(true);
    }
  }, [prefetch, isPrefetched, href, router]);

  const handleFocus = useCallback(() => {
    if (prefetch && !isPrefetched) {
      router.prefetch(href);
      setIsPrefetched(true);
    }
  }, [prefetch, isPrefetched, href, router]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  }, [onClick]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
