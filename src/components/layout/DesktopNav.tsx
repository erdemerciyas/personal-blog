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
    ClipboardDocumentListIcon,
    MagnifyingGlassIcon,
    Cog6ToothIcon,
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
    onOpenSearch?: () => void;
    compact?: boolean;
}

export default function DesktopNav({
    navLinks,
    pathname,
    isScrolled,
    isTransparentPage,
    onOpenProjectModal,
    onOpenSearch,
    compact = false,
}: DesktopNavProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const isTransparent = !isScrolled && isTransparentPage;

    const { cartCount, cart } = useCart();
    const { data: session } = useSession();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);
    const accountTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const cartTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const currentLang = ['tr', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';
    const isAdmin = session?.user && (session.user as any).role === 'admin';

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) setIsAccountOpen(false);
            if (cartRef.current && !cartRef.current.contains(e.target as Node)) setIsCartOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleAccountEnter = () => { clearTimeout(accountTimeoutRef.current); setIsAccountOpen(true); setIsCartOpen(false); };
    const handleAccountLeave = () => { accountTimeoutRef.current = setTimeout(() => setIsAccountOpen(false), 200); };
    const handleCartEnter = () => { clearTimeout(cartTimeoutRef.current); setIsCartOpen(true); setIsAccountOpen(false); };
    const handleCartLeave = () => { cartTimeoutRef.current = setTimeout(() => setIsCartOpen(false), 200); };

    const cartItems = cart?.items?.slice(0, 3) || [];
    const cartTotal = cart?.items?.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0;

    const iconBtnClass = (active: boolean) => `p-2 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 ${
        isTransparent
            ? `text-white/70 hover:text-white hover:bg-white/10 ${active ? 'bg-white/10 text-white' : ''}`
            : `text-slate-500 hover:text-slate-700 hover:bg-slate-100 ${active ? 'bg-slate-100 text-slate-700' : ''}`
    }`;

    return (
        <div className="flex items-center gap-2">
            {/* Nav Links */}
            <nav role="navigation" aria-label="Ana navigasyon">
                <div className={`flex items-center ${compact ? 'gap-0.5' : 'gap-1'} relative`}>
                    {navLinks.map((link, index) => {
                        const isActive = pathname === link.href;

                        const linkClasses = `
                            relative ${compact ? 'px-2.5 py-1.5 text-[13px]' : 'px-3.5 py-2 text-sm'}
                            font-medium whitespace-nowrap
                            transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2
                            rounded-md
                            ${isActive
                                ? isTransparent ? 'text-white' : 'text-brand-primary-800'
                                : isTransparent ? 'text-white/75 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                            }
                        `;

                        const content = (
                            <>
                                {hoveredIndex === index && !isActive && (
                                    <motion.span
                                        layoutId="desktop-nav-hover"
                                        className={`absolute inset-0 rounded-md ${isTransparent ? 'bg-white/[0.08]' : 'bg-slate-50'}`}
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                                {isActive && (
                                    <motion.span
                                        layoutId="desktop-nav-active"
                                        className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full ${
                                            isTransparent
                                                ? 'bg-white'
                                                : 'bg-gradient-to-r from-brand-primary-500 to-brand-primary-600'
                                        }`}
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
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

            {/* Separator */}
            <div className={`h-4 w-px mx-1.5 ${isTransparent ? 'bg-white/15' : 'bg-slate-200'}`} />

            {/* Action icons -- always visible */}
            <div className="flex items-center gap-0.5">
                {/* Search */}
                <button
                    onClick={onOpenSearch}
                    className={iconBtnClass(false)}
                    aria-label="Ara (Ctrl+K)"
                >
                    <MagnifyingGlassIcon className="w-[18px] h-[18px]" />
                </button>

                {/* Account */}
                <div ref={accountRef} className="relative" onMouseEnter={handleAccountEnter} onMouseLeave={handleAccountLeave}>
                    <button
                        onClick={() => setIsAccountOpen(!isAccountOpen)}
                        className={iconBtnClass(isAccountOpen)}
                        aria-label="Hesabım"
                        aria-expanded={isAccountOpen}
                    >
                        {session?.user ? (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-primary-400 to-brand-primary-700 flex items-center justify-center text-white text-[10px] font-bold ring-1 ring-white/20">
                                {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                            </div>
                        ) : (
                            <UserIcon className="w-[18px] h-[18px]" />
                        )}
                    </button>
                    <AnimatePresence>
                        {isAccountOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                            >
                                {session?.user ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary-400 to-brand-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                    {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{session.user.name || 'Kullanıcı'}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="py-1 border-b border-slate-100">
                                                <Link
                                                    href="/admin/dashboard"
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-primary-700 hover:bg-brand-primary-50 transition-colors"
                                                    onClick={() => setIsAccountOpen(false)}
                                                >
                                                    <Cog6ToothIcon className="w-4 h-4" />
                                                    <span>Admin Paneli</span>
                                                </Link>
                                            </div>
                                        )}

                                        <div className="py-1">
                                            <Link
                                                href={`/${currentLang}/account`}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <UserIcon className="w-4 h-4 text-slate-400" />
                                                <span>Hesabım</span>
                                            </Link>
                                            <Link
                                                href={`/${currentLang}/account?tab=orders`}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <ClipboardDocumentListIcon className="w-4 h-4 text-slate-400" />
                                                <span>Siparişlerim</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-slate-100 py-1">
                                            <Link
                                                href="/api/auth/signout"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                                            className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-brand-primary-900 text-white hover:bg-brand-primary-800 transition-colors"
                                            onClick={() => setIsAccountOpen(false)}
                                        >
                                            Giriş Yap
                                        </Link>
                                        <Link
                                            href={`/${currentLang}/register`}
                                            className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                                            onClick={() => setIsAccountOpen(false)}
                                        >
                                            Kayıt Ol
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Cart */}
                <div ref={cartRef} className="relative" onMouseEnter={handleCartEnter} onMouseLeave={handleCartLeave}>
                    <Link href={`/${currentLang}/cart`} className={`relative block ${iconBtnClass(isCartOpen)}`} aria-label="Sepete git">
                        <ShoppingCartIcon className="w-[18px] h-[18px]" />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white"
                                >
                                    {cartCount > 9 ? '9+' : cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                    <AnimatePresence>
                        {isCartOpen && cartCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                            >
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                    <p className="text-sm font-semibold text-slate-900">Sepet ({cartCount})</p>
                                </div>
                                <div className="max-h-52 overflow-y-auto">
                                    {cartItems.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                                            {item.image ? (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                    <Image src={item.image} alt={item.name || ''} width={40} height={40} className="object-cover w-full h-full" />
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
                                    <div className="flex items-center justify-between mb-2.5">
                                        <span className="text-xs text-slate-500">Toplam</span>
                                        <span className="text-sm font-bold text-slate-900">{cartTotal.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <Link
                                        href={`/${currentLang}/cart`}
                                        className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-semibold bg-brand-primary-900 text-white hover:bg-brand-primary-800 transition-colors"
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

            {/* CTA */}
            {onOpenProjectModal && (
                <button
                    onClick={onOpenProjectModal}
                    className={`
                        group relative ${compact ? 'h-8 px-3.5 text-xs' : 'h-9 px-5 text-sm'}
                        rounded-lg font-semibold
                        flex items-center gap-2 whitespace-nowrap flex-shrink-0
                        transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600
                        hover:shadow-md active:scale-[0.97]
                        overflow-hidden ml-1
                        ${isTransparent
                            ? 'bg-white/95 text-brand-primary-900 shadow-sm hover:bg-white'
                            : 'bg-brand-primary-800 text-white hover:bg-brand-primary-700'
                        }
                    `}
                    aria-label="Proje başvurusu formunu aç"
                >
                    <PaperAirplaneIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    <span>Proje Başvurusu</span>
                </button>
            )}
        </div>
    );
}
