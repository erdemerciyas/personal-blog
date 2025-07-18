import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  onClick?: () => void;
  priority?: 'high' | 'low' | 'auto';
  external?: boolean;
}

export const SmartLink: React.FC<SmartLinkProps> = ({
  href,
  children,
  className = '',
  prefetch = true,
  replace = false,
  scroll = true,
  shallow = false,
  onClick,
  priority = 'auto',
  external = false
}) => {
  const router = useRouter();

  // Determine if link is external
  const isExternal = useMemo(() => {
    if (external) return true;
    return href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
  }, [href, external]);

  // Smart prefetch logic based on priority
  const shouldPrefetch = useMemo(() => {
    if (isExternal) return false;
    if (priority === 'high') return true;
    if (priority === 'low') return false;
    return prefetch; // auto mode uses the provided prefetch value
  }, [prefetch, priority, isExternal]);

  const handleClick = (e: React.MouseEvent) => {
    onClick?.();
    
    // Add loading state or analytics here if needed
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 Navigating to: ${href} (${isExternal ? 'external' : 'internal'})`);
    }
  };

  // External links
  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  // Internal links with Next.js Link
  return (
    <Link
      href={href}
      className={className}
      prefetch={shouldPrefetch}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

// Specialized link components with optimized prefetch strategies
export const NavLink: React.FC<Omit<SmartLinkProps, 'prefetch' | 'priority'>> = (props) => (
  <SmartLink {...props} priority="high" />
);

export const CardLink: React.FC<Omit<SmartLinkProps, 'prefetch' | 'priority'>> = (props) => (
  <SmartLink {...props} priority="low" />
);

export const ButtonLink: React.FC<Omit<SmartLinkProps, 'priority'>> = (props) => (
  <SmartLink {...props} priority="high" />
);

export const FooterLink: React.FC<Omit<SmartLinkProps, 'prefetch' | 'priority'>> = (props) => (
  <SmartLink {...props} priority="low" />
);