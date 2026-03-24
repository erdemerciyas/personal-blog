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
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
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
  onMouseEnter,
  onMouseLeave,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  const [isPrefetched, setIsPrefetched] = useState(false);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetch && !isPrefetched) {
      router.prefetch(href);
      setIsPrefetched(true);
    }
    onMouseEnter?.(e);
  }, [prefetch, isPrefetched, href, router, onMouseEnter]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    onMouseLeave?.(e);
  }, [onMouseLeave]);

  const handleFocus = useCallback(() => {
    if (prefetch && !isPrefetched) {
      router.prefetch(href);
      setIsPrefetched(true);
    }
  }, [prefetch, isPrefetched, href, router]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
  }, [onClick]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
