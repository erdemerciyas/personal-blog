'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrefetchLink from '../PrefetchLink';
import Link from 'next/link';
import Image from 'next/image';
import {
    PaperAirplaneIcon,
    ShoppingCartIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,
    ClipboardDocumentListIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';

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
    const { cartCount, cart } = useCart();
    const { data: session } = useSession();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const accountRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const accountTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const cartTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const isTransparent = !isScrolled && isTransparentPage;
    const currentLang = ['tr', 'en', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
                setIsAccountOpen(false);
            }
            if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
                setIsCartOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Handle search submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/${currentLang}/products?q=${encodeURIComponent(searchQuery.trim())}`;
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    // Close search on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        if (isSearchOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isSearchOpen]);

    const handleAccountEnter = () => {
        clearTimeout(accountTimeoutRef.current);
        setIsAccountOpen(true);
        setIsCartOpen(false);
    };
    const handleAccountLeave = () => {
        accountTimeoutRef.current = setTimeout(() => setIsAccountOpen(false), 200);
    };
    const handleCartEnter = () => {
        clearTimeout(cartTimeoutRef.current);
        setIsCartOpen(true);
        setIsAccountOpen(false);
    };
    const handleCartLeave = () => {
        cartTimeoutRef.current = setTimeout(() => setIsCartOpen(false), 200);
    };

    // Cart items for mini preview
    const cartItems = cart?.items?.slice(0, 3) || [];
    const cartTotal = cart?.items?.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0;

    return (
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-end ml-8">
            {/* Navigation Links */}
            <nav
                role="navigation"
                aria-label="Ana navigasyon"
                className="flex items-center flex-nowrap"
            >
                <div className="flex items-center flex-nowrap gap-0.5 relative">
                    {navLinks.map((link, index) => {
                        const isActive = pathname === link.href;

                        const linkClasses = `
                            relative px-2.5 xl:px-3.5 py-2
                            text-[12px] xl:text-sm font-medium tracking-wide
                            whitespace-nowrap
                            transition-all duration-200
                            focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2
                            rounded-lg
                            ${isActive
                                ? isTransparent
                                    ? 'text-white'
                                    : 'text-brand-primary-900'
                                : isTransparent
                                    ? 'text-white/80 hover:text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                            }
                        `;

                        const content = (
                            <>
                                {/* Hover pill background */}
                                {hoveredIndex === index && !isActive && (
                                    <motion.span
                                        layoutId="nav-hover-pill"
                                        className={`absolute inset-0 rounded-lg ${isTransparent ? 'bg-white/10' : 'bg-slate-100'}`}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                                {/* Active gradient underline */}
                                {isActive && (
                                    <motion.span
                                        layoutId="nav-active-indicator"
                                        className="absolute -bottom-[1px] left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-brand-primary-400 via-brand-primary-600 to-brand-primary-400"
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
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
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
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {content}
                            </PrefetchLink>
                        );
                    })}
                </div>
            </nav>

            {/* Divider */}
            <div className={`h-5 w-px mx-2 ${isTransparent ? 'bg-white/20' : 'bg-slate-200'}`} />

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Search */}
                <div ref={searchRef} className="relative">
                    <button
                        onClick={() => { setIsSearchOpen(!isSearchOpen); setIsAccountOpen(false); setIsCartOpen(false); }}
                        className={`
                            relative p-2.5 rounded-xl flex-shrink-0
                            transition-colors duration-200
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2
                            ${isTransparent
                                ? 'text-white/80 hover:text-white hover:bg-white/10'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }
                            ${isSearchOpen ? (isTransparent ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700') : ''}
                        `}
                        aria-label="Ara"
                        aria-expanded={isSearchOpen}
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    </button>

                    {/* Search Dropdown */}
                    <AnimatePresence>
                        {isSearchOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                            >
                                <form onSubmit={handleSearchSubmit} className="p-3">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Ürün, hizmet veya sayfa ara..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between px-1">
                                        <span className="text-[11px] text-slate-400">Enter ile ara, Esc ile kapat</span>
                                        <button
                                            type="submit"
                                            disabled={!searchQuery.trim()}
                                            className="text-xs font-medium text-brand-primary-600 hover:text-brand-primary-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Ara
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Account Dropdown */}
                <div
                    ref={accountRef}
                    className="relative"
                    onMouseEnter={handleAccountEnter}
                    onMouseLeave={handleAccountLeave}
                >
                    <button
                        onClick={() => setIsAccountOpen(!isAccountOpen)}
                        className={`
                            relative p-2.5 rounded-xl flex-shrink-0
                            transition-colors duration-200
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2
                            ${isTransparent
                                ? 'text-white/80 hover:text-white hover:bg-white/10'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }
                            ${isAccountOpen ? (isTransparent ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700') : ''}
                        `}
                        aria-label="Hesabım"
                        aria-expanded={isAccountOpen}
                    >
                        {session?.user ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-primary-400 to-brand-primary-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20">
                                {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                            </div>
                        ) : (
                            <UserIcon className="w-5 h-5" />
                        )}
                    </button>

                    {/* Account Dropdown Menu */}
                    <AnimatePresence>
                        {isAccountOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                            >
                                {session?.user ? (
                                    <>
                                        {/* User info */}
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{session.user.name || 'Kullanıcı'}</p>
                                            <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href={`/${currentLang}/account`}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <UserIcon className="w-4 h-4 text-slate-400" />
                                                <span>Hesabım</span>
                                            </Link>
                                            <Link
                                                href={`/${currentLang}/account?tab=orders`}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <ClipboardDocumentListIcon className="w-4 h-4 text-slate-400" />
                                                <span>Siparişlerim</span>
                                            </Link>
                                        </div>
                                        <div className="border-t border-slate-100 py-1">
                                            <Link
                                                href="/api/auth/signout"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                                <span>Çıkış Yap</span>
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-3 space-y-2">
                                        <Link
                                            href={`/${currentLang}/login`}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-brand-primary-900 text-white hover:bg-brand-primary-800 transition-colors"
                                            onClick={() => setIsAccountOpen(false)}
                                        >
                                            <span>Giriş Yap</span>
                                        </Link>
                                        <Link
                                            href={`/${currentLang}/register`}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                                            onClick={() => setIsAccountOpen(false)}
                                        >
                                            <span>Kayıt Ol</span>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Cart with Mini Preview */}
                <div
                    ref={cartRef}
                    className="relative"
                    onMouseEnter={handleCartEnter}
                    onMouseLeave={handleCartLeave}
                >
                    <Link
                        href={`/${currentLang}/cart`}
                        className={`
                            relative p-2.5 rounded-xl flex-shrink-0 block
                            transition-colors duration-200
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2
                            ${isTransparent
                                ? 'text-white/80 hover:text-white hover:bg-white/10'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }
                            ${isCartOpen ? (isTransparent ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700') : ''}
                        `}
                        aria-label="Sepete git"
                    >
                        <ShoppingCartIcon className="w-5 h-5 flex-shrink-0" />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                    className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white"
                                >
                                    {cartCount > 9 ? '9+' : cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Mini Cart Preview */}
                    <AnimatePresence>
                        {isCartOpen && cartCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                            >
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                    <p className="text-sm font-semibold text-slate-900">Sepetim ({cartCount})</p>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {cartItems.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                                            {item.image ? (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name || ''}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-700 truncate">{item.name || 'Ürün'}</p>
                                                <p className="text-xs text-slate-400">{item.quantity}x {item.price?.toLocaleString('tr-TR')} ₺</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-500">Toplam</span>
                                        <span className="text-sm font-bold text-slate-900">{cartTotal.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <Link
                                        href={`/${currentLang}/cart`}
                                        className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-primary-900 text-white hover:bg-brand-primary-800 transition-colors"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Sepete Git
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* CTA Button - Premium with shimmer */}
            {onOpenProjectModal && (
                <button
                    onClick={onOpenProjectModal}
                    className={`
                        group relative h-10 xl:h-11
                        px-5 xl:px-6
                        rounded-xl
                        font-semibold text-xs xl:text-sm
                        flex items-center gap-2.5
                        whitespace-nowrap flex-shrink-0
                        transition-all duration-300
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2
                        hover:-translate-y-0.5 hover:shadow-lg
                        active:scale-[0.97]
                        overflow-hidden
                        ml-2
                        ${isTransparent
                            ? 'bg-white text-brand-primary-900 shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-brand-primary-800 via-brand-primary-700 to-brand-primary-800 text-white shadow-md hover:shadow-brand-primary-500/25 bg-[length:200%_100%] animate-gradient-x'
                        }
                    `}
                    aria-label="Proje başvurusu formunu aç"
                >
                    {/* Shimmer effect */}
                    <span className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none ${isTransparent ? 'via-brand-primary-100/30' : ''}`} />
                    <PaperAirplaneIcon className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    <span className="relative z-10">Proje Başvurusu</span>
                </button>
            )}
        </div>
    );
}
