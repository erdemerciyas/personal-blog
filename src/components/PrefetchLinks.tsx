'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface PrefetchLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
}

export default function PrefetchLink({ 
  href, 
  children, 
  className = '', 
  prefetch = true 
}: PrefetchLinkProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (prefetch) {
      // Prefetch the page on hover
      router.prefetch(href);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <Link
      href={href}
      className={`${className} transition-all duration-200 ${
        isHovering ? 'transform scale-105' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}