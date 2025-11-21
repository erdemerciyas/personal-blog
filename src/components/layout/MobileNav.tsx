'use client';

import Link from 'next/link';
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
}

export default function MobileNav({
    isOpen,
    navLinks,
    pathname,
    onClose,
    onOpenProjectModal,
    navLoaded
}: MobileNavProps) {
    if (!isOpen) return null;

    return (
        <nav id="mobile-menu" aria-label="Mobil navigasyon" className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-2xl border-t border-slate-200/50 max-h-[75vh] overflow-y-auto">
            <div className="py-4 px-6">
                {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    const LinkIcon = link.icon;

                    const commonClasses = `flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600/70 focus-visible:ring-offset-2 ${isActive
                            ? 'bg-brand-primary-100 text-brand-primary-800'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
                        }`;

                    const content = (
                        <>
                            <LinkIcon className="w-5 h-5" />
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
                                onClick={onClose}
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
                            onClick={onClose}
                            className={commonClasses}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {content}
                        </Link>
                    );
                })}
                {navLoaded && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <button
                            onClick={onOpenProjectModal}
                            className="flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-primary text-white rounded-xl font-semibold w-full"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            <span>Proje Başvurusu</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
