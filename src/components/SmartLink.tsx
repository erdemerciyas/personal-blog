import React from 'react';
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
}

export const SmartLink: React.FC<SmartLinkProps> = ({
  href,
  children,
  className = '',
  prefetch = true,
  replace = false,
  scroll = true,
  shallow = false,
  onClick
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    onClick?.();
    
    // Add loading state or analytics here if needed
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 Navigating to: ${href}`);
    }
  };

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

// Specialized link components
export const NavLink: React.FC<Omit<SmartLinkProps, 'prefetch'>> = (props) => (
  <SmartLink {...props} prefetch={true} />
);

export const CardLink: React.FC<Omit<SmartLinkProps, 'prefetch'>> = (props) => (
  <SmartLink {...props} prefetch={false} />
);

export const ButtonLink: React.FC<SmartLinkProps> = (props) => (
  <SmartLink {...props} />
);