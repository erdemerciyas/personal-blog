'use client';

import Link from 'next/link';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface NavLink {
    href: string;
    label: string;
    icon: any;
    isExternal?: boolean;
}

interface DynamicMobileNavProps {
    isOpen: boolean;
    navLinks: NavLink[];
    pathname: string;
    onClose: () => void;
    onOpenProjectModal: () => void;
    navLoaded: boolean;
    isScrolled?: boolean;
    isTransparentPage?: boolean;
}

export default function DynamicMobileNav({
    isOpen,
    navLinks,
    pathname,
    onClose,
    onOpenProjectModal,
    navLoaded,
    isScrolled = false,
    isTransparentPage = false
}: DynamicMobileNavProps) {
    if (!isOpen) return null;

    const handleNavClick = (callback?: () => void) => {
        onClose();
        callback?.();
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
                <div className="space-y-2">
                    {navLinks.map((link, index) => {
                        const isActive = pathname === link.href;
                        const LinkIcon = link.icon;

                        const baseClasses = `
                            flex items-center gap-3 
                            px-5 py-4
                            rounded-xl 
                            font-medium text-sm
                            transition-all duration-200 
                            focus-visible:outline-none 
                            focus-visible:ring-2 
                            focus-visible:ring-brand-primary-600 
                            focus-visible:ring-offset-2
                            ${isActive
                                ? 'bg-brand-primary-100 text-brand-primary-900 shadow-md'
                                : 'text-slate-700 hover:bg-brand-primary-50 hover:text-brand-primary-800'
                            }
                        `;

                        const content = (
                            <>
                                <LinkIcon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                                <span className="flex-1">{link.label}</span>
                                {isActive && (
                                    <span 
                                        className="w-2.5 h-2.5 rounded-full bg-brand-primary-600 flex-shrink-0 animate-pulse" 
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
                                    onClick={() => handleNavClick()}
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
                                onClick={() => handleNavClick()}
                                className={baseClasses}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {content}
                            </Link>
                        );
                    })}
                </div>

                {/* CTA Button Section */}
                {navLoaded && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <button
                            onClick={() => handleNavClick(onOpenProjectModal)}
                            className={`
                                w-full
                                flex items-center justify-center gap-2
                                px-6 py-4
                                rounded-xl
                                font-semibold text-sm
                                transition-all duration-200
                                focus-visible:outline-none 
                                focus-visible:ring-2 
                                focus-visible:ring-brand-primary-600 
                                focus-visible:ring-offset-2
                                bg-gradient-to-r from-brand-primary-700 to-brand-primary-900 text-white
                                hover:shadow-lg
                                active:scale-95
                                shadow-md
                            `}
                            aria-label="Proje başvurusu formunu aç"
                        >
                            <PaperAirplaneIcon className="w-5 h-5 transition-transform duration-200 hover:rotate-45" aria-hidden="true" />
                            <span>Proje Başvurusu</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
