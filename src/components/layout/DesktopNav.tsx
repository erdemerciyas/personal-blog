'use client';

import Link from 'next/link';

interface NavLink {
    href: string;
    label: string;
    icon: any;
    isExternal?: boolean;
}

interface DesktopNavProps {
    navLinks: NavLink[];
    pathname: string;
    isScrolled: boolean;
}

export default function DesktopNav({ navLinks, pathname, isScrolled }: DesktopNavProps) {
    return (
        <nav role="navigation" aria-label="Ana navigasyon" className="hidden md:flex items-center gap-2 flex-1 min-w-0 justify-center overflow-x-auto">
            {navLinks.map((link, index) => {
                const isActive = pathname === link.href;
                const LinkIcon = link.icon;

                const commonClasses = `relative overflow-hidden px-3 lg:px-4 py-2 rounded-xl font-medium transition-all duration-200 group flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 ${isActive
                        ? isScrolled
                            ? 'bg-brand-primary-100 text-brand-primary-800'
                            : 'bg-white text-brand-primary-800 shadow'
                        : isScrolled
                            ? 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
                            : 'text-white hover:text-white hover:bg-white/10'
                    }`;

                const content = (
                    <>
                        <LinkIcon className="w-4 h-4" />
                        <span>{link.label}</span>
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute left-4 right-4 bottom-1 h-[2px] origin-left scale-x-0 transition-transform duration-300 ${isScrolled
                                    ? 'bg-brand-primary-700'
                                    : 'bg-white/80'
                                } ${isActive ? 'scale-x-100' : 'group-hover:scale-x-100'}`}
                        />
                    </>
                );

                if (link.isExternal) {
                    return (
                        <a
                            key={index}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={commonClasses}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {content}
                        </a>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.href}
                        className={commonClasses}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {content}
                    </Link>
                );
            })}
        </nav>
    );
}
