'use client';

import { motion } from 'framer-motion';
import PrefetchLink from '../PrefetchLink';

interface MobileNavLinkProps {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    isExternal?: boolean;
    index: number;
    onClick: () => void;
}

export default function MobileNavLink({
    href,
    label,
    icon: Icon,
    isActive,
    isExternal,
    index,
    onClick,
}: MobileNavLinkProps) {
    const classes = `
        flex items-center gap-4
        px-5 py-3.5
        rounded-xl
        text-base font-medium tracking-wide
        transition-all duration-200
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-white/40
        focus-visible:ring-offset-2
        focus-visible:ring-offset-transparent
        ${isActive
            ? 'bg-white/15 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }
    `;

    const content = (
        <>
            <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${isActive ? 'bg-white/10' : 'bg-white/5'} transition-colors duration-200`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/50'}`} aria-hidden="true" />
            </span>
            <span className="flex-1">{label}</span>
            {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
        </>
    );

    return (
        <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {isExternal ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClick}
                    className={classes}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {content}
                </a>
            ) : (
                <PrefetchLink
                    href={href}
                    onClick={onClick}
                    className={classes}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {content}
                </PrefetchLink>
            )}
        </motion.div>
    );
}
