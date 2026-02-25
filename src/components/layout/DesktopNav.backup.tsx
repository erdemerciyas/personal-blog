'use client';

import PrefetchLink from '../PrefetchLink';
import Link from 'next/link';
import { PaperAirplaneIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

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
    isTransparentPage: boolean;
    onOpenProjectModal?: () => void;
}

export default function DesktopNav({
    navLinks,
    pathname,
    isScrolled,
    isTransparentPage,
    onOpenProjectModal
}: DesktopNavProps) {
    const { cartCount } = useCart();


    // Determine text color based on scroll state and page type
    const textColorClass = isScrolled
        ? 'text-slate-700'
        : isTransparentPage
            ? 'text-white drop-shadow'
            : 'text-slate-700';

    const activeColorClass = isScrolled
        ? 'bg-brand-primary-100 text-brand-primary-900'
        : isTransparentPage
            ? 'bg-white/20 text-white backdrop-blur-sm shadow-lg'
            : 'bg-brand-primary-100 text-brand-primary-900';

    const hoverColorClass = isScrolled
        ? 'hover:bg-slate-100 hover:text-brand-primary-800'
        : isTransparentPage
            ? 'hover:bg-white/20 hover:text-white'
            : 'hover:bg-slate-100 hover:text-brand-primary-800';

    const underlineColorClass = isScrolled
        ? 'bg-brand-primary-700'
        : isTransparentPage
            ? 'bg-white/80'
            : 'bg-brand-primary-700';

    return (
        <div className="hidden lg:flex items-center gap-2 xl:gap-6 flex-1 justify-end ml-12 on-desktop-nav-container">
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
                        h-10 lg:h-11
                        px-3 lg:px-4
                        rounded-full
                        font-medium text-sm
                        transition-all duration-200 
                        group 
                        flex items-center justify-center gap-2 
                        whitespace-nowrap
                        focus-visible:outline-none 
                        focus-visible:ring-2 
                        focus-visible:ring-brand-primary-600 
                        focus-visible:ring-offset-2
                        ${isActive ? activeColorClass : `${textColorClass} ${hoverColorClass}`}
                    `;

                    const content = (
                        <>
                            <LinkIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`} aria-hidden="true" />
                            <span>{link.label}</span>
                            {/* Animated underline indicator */}
                            <span
                                aria-hidden="true"
                                className={`
                                    pointer-events-none 
                                    absolute left-4 right-4 bottom-2
                                    h-0.5 
                                    origin-center
                                    scale-x-0 
                                    rounded-full
                                    transition-transform duration-300 ease-out
                                    ${underlineColorClass}
                                    ${isActive ? 'scale-x-100' : 'group-hover:scale-x-50'}
                                `}
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
                        >
                            {content}
                        </PrefetchLink>
                    );
                })}
            </nav>

            {/* Cart Button */}
            <div className="flex items-center mx-2 gap-2">
                {/* User Menu */}
                <Link
                    href={'/account'}
                    className={`
                        relative
                        p-2
                        rounded-full
                        transition-all duration-200
                        ${isScrolled
                            ? 'text-slate-700 hover:bg-slate-100'
                            : isTransparentPage
                                ? 'text-white hover:bg-white/20'
                                : 'text-slate-700 hover:bg-slate-100'
                        }
                    `}
                    aria-label="Hesabım"
                >
                    <UserIcon className="w-6 h-6" />
                </Link>

                <Link
                    href="/cart"
                    className={`
                        relative
                        p-2
                        rounded-full
                        transition-all duration-200
                        ${isScrolled
                            ? 'text-slate-700 hover:bg-slate-100'
                            : isTransparentPage
                                ? 'text-white hover:bg-white/20'
                                : 'text-slate-700 hover:bg-slate-100'
                        }
                    `}
                    aria-label="Sepete git"
                >
                    <ShoppingCartIcon className="w-6 h-6" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>

            {/* Desktop CTA Button - Separate Group */}
            {onOpenProjectModal && (
                <button
                    onClick={onOpenProjectModal}
                    className={`
                        h-10 lg:h-11
                        px-4 lg:px-6
                        rounded-full
                        font-semibold text-xs lg:text-sm
                        flex items-center gap-2
                        whitespace-nowrap
                        flex-shrink-0
                        transition-all duration-300
                        focus-visible:outline-none 
                        focus-visible:ring-2 
                        focus-visible:ring-brand-primary-600 
                        focus-visible:ring-offset-2
                        ml-4
                        ${isScrolled
                            ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                            : isTransparentPage
                                ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-lg hover:shadow-xl drop-shadow hover:-translate-y-0.5'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                        }
                    `}
                    aria-label="Proje başvurusu formunu aç"
                >
                    <PaperAirplaneIcon className="w-4 h-4" aria-hidden="true" />
                    <span>Proje Başvurusu</span>
                </button>
            )}
        </div>
    );
}
