'use client';

import Link from 'next/link';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface NavLink {
    href: string;
    label: string;
    icon: any;
    isExternal?: boolean;
}

interface DynamicDesktopNavProps {
    navLinks: NavLink[];
    pathname: string;
    isScrolled: boolean;
    isTransparentPage: boolean;
    scrollProgress: number;
    onOpenProjectModal?: () => void;
}

export default function DynamicDesktopNav({ 
    navLinks, 
    pathname, 
    isScrolled, 
    isTransparentPage,
    onOpenProjectModal 
}: DynamicDesktopNavProps) {
    
    // Dynamic color based on scroll progress
    const textColorClass = isScrolled
        ? 'text-slate-700' 
        : isTransparentPage
          ? 'text-white drop-shadow'
          : 'text-slate-700';
    
    const activeColorClass = isScrolled
        ? 'bg-brand-primary-100 text-brand-primary-900 shadow-md'
        : isTransparentPage
          ? 'bg-white/30 text-white backdrop-blur-sm shadow-lg'
          : 'bg-brand-primary-100 text-brand-primary-900 shadow-md';
    
    const hoverColorClass = isScrolled
        ? 'hover:bg-brand-primary-50 hover:text-brand-primary-800'
        : isTransparentPage
          ? 'hover:bg-white/25 hover:text-white'
          : 'hover:bg-brand-primary-50 hover:text-brand-primary-800';

    return (
        <div className="hidden md:flex items-center gap-8 flex-1 min-w-0">
            {/* Navigation Links */}
            <nav 
                role="navigation" 
                aria-label="Ana navigasyon" 
                className="flex items-center gap-3 justify-center flex-1 min-w-0"
            >
                {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    const LinkIcon = link.icon;

                    const baseClasses = `
                        relative overflow-hidden 
                        px-5 py-3
                        rounded-xl 
                        font-medium text-sm
                        transition-all duration-200 
                        group 
                        flex items-center gap-2 
                        whitespace-nowrap
                        focus-visible:outline-none 
                        focus-visible:ring-2 
                        focus-visible:ring-brand-primary-600 
                        focus-visible:ring-offset-2
                        ${isActive ? activeColorClass : `${textColorClass} ${hoverColorClass}`}
                    `;

                    const content = (
                        <>
                            <LinkIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                            <span>{link.label}</span>
                        </>
                    );

                    if (link.isExternal) {
                        return (
                            <a
                                key={index}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={baseClasses}
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
                            className={baseClasses}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {content}
                        </Link>
                    );
                })}
            </nav>
            
            {/* Desktop CTA Button */}
            {onOpenProjectModal && (
                <button
                    onClick={onOpenProjectModal}
                    className={`
                        px-6 py-3
                        rounded-xl 
                        font-semibold text-sm
                        flex items-center gap-2
                        whitespace-nowrap
                        flex-shrink-0
                        transition-all duration-200
                        focus-visible:outline-none 
                        focus-visible:ring-2 
                        focus-visible:ring-brand-primary-600 
                        focus-visible:ring-offset-2
                        hover:scale-105
                        active:scale-95
                        ${isScrolled
                            ? 'bg-gradient-to-r from-brand-primary-700 to-brand-primary-900 text-white shadow-lg hover:shadow-xl'
                            : isTransparentPage
                              ? 'bg-white text-brand-primary-900 shadow-lg hover:shadow-xl drop-shadow'
                              : 'bg-gradient-to-r from-brand-primary-700 to-brand-primary-900 text-white shadow-lg hover:shadow-xl'
                        }
                    `}
                    aria-label="Proje başvurusu formunu aç"
                >
                    <PaperAirplaneIcon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-45" aria-hidden="true" />
                    <span>Proje Başvurusu</span>
                </button>
            )}
        </div>
    );
}
