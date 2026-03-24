'use client';

import { Fragment, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    PaperAirplaneIcon,
    ShoppingCartIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import MobileNavLink from './MobileNavLink';

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
    logoText?: string;
}

export default function MobileNav({
    isOpen,
    navLinks,
    pathname,
    onClose,
    onOpenProjectModal,
    navLoaded,
    logoText,
}: MobileNavProps) {
    const { cartCount } = useCart();
    const { data: session } = useSession();
    const currentLang = ['tr', 'en', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';

    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleProjectModalClick = () => {
        onClose();
        onOpenProjectModal();
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/${currentLang}/products?q=${encodeURIComponent(searchQuery.trim())}`;
            onClose();
            setSearchQuery('');
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50 lg:hidden">
                {/* Full-screen backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-brand-primary-900/90 backdrop-blur-xl" aria-hidden="true" />
                </Transition.Child>

                {/* Full-screen panel */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Panel className="fixed inset-0 flex flex-col h-[100dvh]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                            <Dialog.Title className="text-xl font-bold text-white/90 tracking-wide">
                                {logoText || 'Menü'}
                            </Dialog.Title>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                aria-label="Menüyü kapat"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Decorative line */}
                        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-shrink-0" />

                        {/* Search Bar */}
                        <div className="px-4 pt-4 pb-1 flex-shrink-0">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ara..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                                />
                            </form>
                        </div>

                        {/* Navigation Links - scrollable */}
                        <nav
                            aria-label="Mobil navigasyon"
                            className="flex-1 overflow-y-auto px-4 py-6 min-h-0"
                        >
                            <div className="space-y-1">
                                {navLinks.map((link, index) => (
                                    <MobileNavLink
                                        key={index}
                                        href={link.href}
                                        label={link.label}
                                        icon={link.icon}
                                        isActive={pathname === link.href}
                                        isExternal={link.isExternal}
                                        index={index}
                                        onClick={onClose}
                                    />
                                ))}
                            </div>
                        </nav>

                        {/* Bottom Actions - fixed at bottom */}
                        {navLoaded && (
                            <div className="flex-shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-2 space-y-3">
                                {/* Decorative line */}
                                <div className="mx-2 mb-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                                {/* User info or login prompt */}
                                {session?.user ? (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mx-1 mb-2">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary-300 to-brand-primary-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10">
                                            {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{session.user.name || 'Kullanıcı'}</p>
                                            <p className="text-xs text-white/50 truncate">{session.user.email}</p>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Account & Cart Row */}
                                <div className="flex items-center gap-2 mx-1">
                                    {session?.user ? (
                                        <>
                                            <Link
                                                href={`/${currentLang}/account`}
                                                onClick={onClose}
                                                className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-white/80 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/5"
                                                aria-label="Hesabım"
                                            >
                                                <UserIcon className="w-5 h-5" />
                                                <span>Hesabım</span>
                                            </Link>
                                            <Link
                                                href={`/${currentLang}/cart`}
                                                onClick={onClose}
                                                className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-white/80 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/5 relative"
                                                aria-label="Sepete git"
                                            >
                                                <ShoppingCartIcon className="w-5 h-5" />
                                                <span>Sepet</span>
                                                {cartCount > 0 && (
                                                    <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white">
                                                        {cartCount > 9 ? '9+' : cartCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href={`/${currentLang}/login`}
                                                onClick={onClose}
                                                className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 transition-all duration-200 border border-white/10"
                                            >
                                                <UserIcon className="w-5 h-5" />
                                                <span>Giriş Yap</span>
                                            </Link>
                                            <Link
                                                href={`/${currentLang}/cart`}
                                                onClick={onClose}
                                                className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-white/80 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/5 relative"
                                                aria-label="Sepete git"
                                            >
                                                <ShoppingCartIcon className="w-5 h-5" />
                                                <span>Sepet</span>
                                                {cartCount > 0 && (
                                                    <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white">
                                                        {cartCount > 9 ? '9+' : cartCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* CTA Button - Premium */}
                                <button
                                    onClick={handleProjectModalClick}
                                    className="
                                        group relative w-full flex items-center justify-center gap-2.5
                                        px-6 py-3.5
                                        rounded-xl
                                        font-semibold text-sm
                                        bg-white text-brand-primary-900
                                        hover:bg-white/95
                                        active:scale-[0.98]
                                        transition-all duration-200
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary-900
                                        shadow-lg shadow-black/10
                                        mx-1
                                        overflow-hidden
                                    "
                                    aria-label="Proje başvurusu formunu aç"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary-100/40 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none" />
                                    <PaperAirplaneIcon className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                                    <span className="relative z-10">Proje Başvurusu</span>
                                </button>
                            </div>
                        )}
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
