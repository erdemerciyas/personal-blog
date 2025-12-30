'use client';

import { useEffect } from 'react';
import PrefetchLink from '../PrefetchLink';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface NavLink {
    href: string;
    label: string;
    icon: any;
    isExternal?: boolean;
}

interface MobileNavProps {
    isOpen: boolean;
    navLinks: NavLink[];
    pathname: string;
    onClose: () => void;
    onOpenProjectModal: () => void;
    navLoaded: boolean;
    isScrolled?: boolean;
    isTransparentPage?: boolean;
}

export default function MobileNav({
    isOpen,
    navLinks,
    pathname,
    onClose,
    onOpenProjectModal,
    navLoaded,
    isScrolled = false,
    isTransparentPage = false
}: MobileNavProps) {
    // Close menu when pathname changes
    useEffect(() => {
        if (isOpen) {
            onClose();
        }
    }, [pathname, onClose, isOpen]);

    if (!isOpen) return null;

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.stopPropagation();
        onClose();
    };

    const handleProjectModalClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClose();
        onOpenProjectModal();
    };

    return (
        <nav 
            id="mobile-menu" 
            aria-label="Mobil navigasyon" 
            className={`md:hidden absolute top-full left-0 right-0 max-h-[75vh] overflow-y-auto z-40 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-lg shadow-2xl border-t border-slate-200/50'
                : isTransparentPage
                  ? 'bg-white/90 backdrop-blur-lg shadow-2xl border-t border-white/20'
                  : 'bg-white/95 backdrop-blur-lg shadow-2xl border-t border-slate-200/50'
            }`}
        >
            <div className="container-main py-4">
                <div className="space-y-1">
                    {navLinks.map((link, index) => {
                        const isActive = pathname === link.href;
                        const LinkIcon = link.icon;

                        const baseClasses = `
                            flex items-center gap-3 
                            px-4 py-3 
                            rounded-lg 
                            font-medium text-sm
                            transition-all duration-200 
                            focus-visible:outline-none 
                            focus-visible:ring-2 
                            focus-visible:ring-brand-primary-600 
                            focus-visible:ring-offset-2
                            ${isActive
                                ? 'bg-brand-primary-100 text-brand-primary-900 shadow-sm'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-800'
                            }
                        `;

                        const content = (
                            <>
                                <LinkIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                <span className="flex-1">{link.label}</span>
                                {isActive && (
                                    <span 
                                        className="w-2 h-2 rounded-full bg-brand-primary-600 flex-shrink-0" 
                                        aria-hidden="true"
                                    />
                                )}
                            </>
                        );

                        if (link.isExternal) {
                            return (
                                <a
                                    key={index}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleLinkClick}
                                    className={baseClasses}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {content}
                                </a>
                            );
                        }

                        return (
                            <PrefetchLink
                                key={index}
                                href={link.href}
                                className={baseClasses}
                                aria-current={isActive ? 'page' : undefined}
                                onClick={handleLinkClick}
                            >
                                {content}
                            </PrefetchLink>
                        );
                    })}
                </div>

                {/* CTA Button Section */}
                {navLoaded && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <button
                            onClick={handleProjectModalClick}
                            className={`
                                w-full
                                flex items-center justify-center gap-2
                                px-5 py-3
                                rounded-lg
                                font-semibold text-sm
                                transition-all duration-200
                                focus-visible:outline-none 
                                focus-visible:ring-2 
                                focus-visible:ring-brand-primary-600 
                                focus-visible:ring-offset-2
                                bg-brand-primary-900 text-white
                                hover:bg-brand-primary-800
                                shadow-md hover:shadow-lg
                                active:scale-95
                            `}
                            aria-label="Proje başvurusu formunu aç"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" aria-hidden="true" />
                            <span>Proje Başvurusu</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
