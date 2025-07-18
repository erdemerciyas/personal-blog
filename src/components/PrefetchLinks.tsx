'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { useImageCache, extractImageUrls, PRELOAD_STRATEGIES } from '../lib/image-cache';

// Enhanced PrefetchLink component with hover prefetch
interface PrefetchLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
}

export function PrefetchLink({ 
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

// Bulk prefetch component for multiple links and images
interface PrefetchLinksProps {
  links: string[];
  priority?: 'high' | 'low';
  portfolioData?: any[];
  strategy?: keyof typeof PRELOAD_STRATEGIES;
}

export function PrefetchLinks({ 
  links, 
  priority = 'low',
  portfolioData = [],
  strategy = 'homepage'
}: PrefetchLinksProps) {
  const router = useRouter();
  const { preloadImages } = useImageCache();

  useEffect(() => {
    // Prefetch links based on priority
    const prefetchDelay = priority === 'high' ? 0 : 2000; // 2 second delay for low priority
    
    const timer = setTimeout(() => {
      links.forEach(link => {
        router.prefetch(link);
      });
    }, prefetchDelay);

    return () => clearTimeout(timer);
  }, [links, priority, router]);

  useEffect(() => {
    // Preload images based on strategy
    if (portfolioData.length > 0) {
      const imageUrls = extractImageUrls(portfolioData);
      const strategyConfig = PRELOAD_STRATEGIES[strategy];
      const imagesToPreload = imageUrls.slice(0, strategyConfig.maxImages);
      
      if (imagesToPreload.length > 0) {
        // Delay image preloading to not block initial page load
        const imagePreloadDelay = priority === 'high' ? 1000 : 3000;
        setTimeout(() => {
          preloadImages(imagesToPreload, strategyConfig.priority);
        }, imagePreloadDelay);
      }
    }
  }, [portfolioData, strategy, priority, preloadImages]);

  return null; // This component doesn't render anything
}

// Default export for backward compatibility
export default PrefetchLink;