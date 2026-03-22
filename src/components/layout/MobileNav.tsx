'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
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
}

export default function MobileNav({
    isOpen,
    navLinks,
    pathname,
    onClose,
    onOpenProjectModal,
    navLoaded,
}: MobileNavProps) {
    const { cartCount } = useCart();
    const currentLang = ['tr', 'en', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';

    const handleProjectModalClick = () => {
        onClose();
        onOpenProjectModal();
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50 lg:hidden">
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
                </Transition.Child>

                {/* Drawer Panel */}
                <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-out duration-300"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in duration-200"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                >
                    <Dialog.Panel className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[320px] bg-white shadow-2xl flex flex-col">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-100">
                            <Dialog.Title className="text-lg font-semibold text-slate-900">
                                Menu
                            </Dialog.Title>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500"
                                aria-label="Menüyü kapat"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav
                            aria-label="Mobil navigasyon"
                            className="flex-1 overflow-y-auto px-3 py-4"
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

                        {/* Bottom Actions */}
                        {navLoaded && (
                            <div className="border-t border-slate-100 p-4 space-y-3">
                                {/* Account & Cart Row */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/${currentLang}/account`}
                                        onClick={onClose}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150"
                                        aria-label="Hesabım"
                                    >
                                        <UserIcon className="w-5 h-5" />
                                        <span>Hesap</span>
                                    </Link>
                                    <Link
                                        href={`/${currentLang}/cart`}
                                        onClick={onClose}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 relative"
                                        aria-label="Sepete git"
                                    >
                                        <ShoppingCartIcon className="w-5 h-5" />
                                        <span>Sepet</span>
                                        {cartCount > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={handleProjectModalClick}
                                    className="
                                        w-full flex items-center justify-center gap-2
                                        px-5 py-3
                                        rounded-lg
                                        font-semibold text-sm
                                        bg-slate-900 text-white
                                        hover:bg-slate-800
                                        active:scale-[0.98]
                                        transition-all duration-150
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2
                                        shadow-sm
                                    "
                                    aria-label="Proje başvurusu formunu aç"
                                >
                                    <PaperAirplaneIcon className="w-4.5 h-4.5" aria-hidden="true" />
                                    <span>Proje Başvurusu</span>
                                </button>
                            </div>
                        )}
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
