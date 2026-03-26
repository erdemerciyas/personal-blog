'use client';

import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import LanguageSwitch from '../ui/LanguageSwitch';

interface TopBarProps {
    currentLang: string;
    isTransparentPage: boolean;
    visible: boolean;
}

export default function TopBar({ currentLang, isTransparentPage, visible }: TopBarProps) {
    return (
        <div
            className={`hidden lg:block transition-all duration-300 relative z-10 ${
                visible
                    ? 'opacity-100'
                    : '-mt-9 opacity-0 pointer-events-none'
            }`}
        >
            <div className={`border-b ${
                isTransparentPage
                    ? 'bg-black/30 backdrop-blur-md border-white/[0.08]'
                    : 'bg-slate-900 border-slate-800/80'
            }`}>
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between h-9">
                        {/* Left: Contact info */}
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/${currentLang}/contact`}
                                className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors"
                            >
                                <PhoneIcon className="w-3 h-3" />
                                <span>İletişim</span>
                            </Link>
                            <div className="w-px h-3 bg-white/15" />
                            <a
                                href="mailto:info@fixral.com"
                                className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors"
                            >
                                <EnvelopeIcon className="w-3 h-3" />
                                <span>info@fixral.com</span>
                            </a>
                        </div>

                        {/* Right: Language switch */}
                        <LanguageSwitch currentLang={currentLang} variant="topbar" />
                    </div>
                </div>
            </div>
        </div>
    );
}
