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
        <div className="hidden md:flex items-center gap-2 xl:gap-6 flex-1 justify-end ml-12">
            {/* Navigation Links */}
            <nav
                role="navigation"
                aria-label="Ana navigasyon"
                className="flex items-center gap-0.5 lg:gap-1 xl:gap-4"
            >
                {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    const LinkIcon = link.icon;

                    const baseClasses = `
                        relative overflow-hidden 
                        px-3 lg:px-4 py-2
                        rounded-xl 
                        font-medium text-[13px] lg:text-sm
                        transition-all duration-200 
                        group 
                        flex items-center gap-1.5 
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
                        px-4 lg:px-6 py-2 lg:py-3
                        rounded-xl 
                        font-semibold text-xs lg:text-sm
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
                        ml-2
                        ${isScrolled
                            ? 'bg-gradient-to-r from-brand-primary-700 to-brand-primary-900 text-white shadow-lg hover:shadow-xl'
                            : isTransparentPage
                                ? 'bg-white text-brand-primary-900 shadow-lg hover:shadow-xl drop-shadow'
                                : 'bg-gradient-to-r from-brand-primary-700 to-brand-primary-900 text-white shadow-lg hover:shadow-xl'
                        }
                    `}
                    aria-label="Proje başvurusu formunu aç"
                >
                    <PaperAirplaneIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform duration-200 group-hover:rotate-45" aria-hidden="true" />
                    <span>Proje Başvurusu</span>
                </button>
            )}
        </div>
    );
}
