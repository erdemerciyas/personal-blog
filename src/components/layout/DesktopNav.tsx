'use client';

import { motion, AnimatePresence } from 'framer-motion';
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

    const isTransparent = !isScrolled && isTransparentPage;
    const currentLang = ['tr', 'en', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';

    return (
        <div className="hidden lg:flex items-center gap-2 xl:gap-4 flex-1 justify-end ml-12">
            {/* Navigation Links */}
            <nav
                role="navigation"
                aria-label="Ana navigasyon"
                className="flex items-center gap-1 lg:gap-6"
            >
                {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    const LinkIcon = link.icon;

                    const linkClasses = `
                        relative
                        py-2 px-1
                        text-sm font-medium
                        transition-colors duration-150
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-primary-500
                        focus-visible:ring-offset-2
                        rounded-sm
                        flex items-center gap-1.5
                        group
                        ${isActive
                            ? isTransparent
                                ? 'text-white'
                                : 'text-brand-primary-900'
                            : isTransparent
                                ? 'text-white/70 hover:text-white'
                                : 'text-slate-500 hover:text-slate-900'
                        }
                    `;

                    const content = (
                        <>
                            {LinkIcon && (
                                <LinkIcon
                                    className={`w-4 h-4 flex-shrink-0 ${isActive ? '' : 'opacity-60 group-hover:opacity-100'} transition-opacity duration-150`}
                                    aria-hidden="true"
                                />
                            )}
                            <span>{link.label}</span>
                            {isActive && (
                                <motion.span
                                    layoutId="nav-active-indicator"
                                    className={`absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full ${isTransparent ? 'bg-white' : 'bg-brand-primary-600'
                                        }`}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
                                className={linkClasses}
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
                            className={linkClasses}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {content}
                        </PrefetchLink>
                    );
                })}
            </nav>

            {/* Action Buttons - separated by border */}
            <div className={`flex items-center gap-1 ml-4 pl-4 border-l ${isTransparent ? 'border-white/20' : 'border-slate-200'
                }`}>
                {/* Account */}
                <Link
                    href={`/${currentLang}/account`}
                    className={`
                        p-2 rounded-lg
                        transition-colors duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2
                        ${isTransparent
                            ? 'text-white/70 hover:text-white hover:bg-white/10'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }
                    `}
                    aria-label="Hesabım"
                >
                    <UserIcon className="w-5 h-5" />
                </Link>

                {/* Cart */}
                <Link
                    href={`/${currentLang}/cart`}
                    className={`
                        relative p-2 rounded-lg
                        transition-colors duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2
                        ${isTransparent
                            ? 'text-white/70 hover:text-white hover:bg-white/10'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }
                    `}
                    aria-label="Sepete git"
                >
                    <ShoppingCartIcon className="w-5 h-5" />
                    <AnimatePresence>
                        {cartCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white"
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* CTA Button */}
            {onOpenProjectModal && (
                <button
                    onClick={onOpenProjectModal}
                    className={`
                        h-9 lg:h-10
                        px-4 lg:px-5
                        rounded-lg
                        font-semibold text-xs lg:text-sm
                        flex items-center gap-2
                        whitespace-nowrap flex-shrink-0
                        transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2
                        hover:-translate-y-px hover:shadow-md
                        active:scale-[0.98]
                        ${isTransparent
                            ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-lg'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                        }
                    `}
                    aria-label="Proje başvurusu formunu aç"
                >
                    <PaperAirplaneIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Proje Başvurusu</span>
                </button>
            )}
        </div>
    );
}
