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
        flex items-center gap-3
        px-4 py-3
        rounded-lg
        text-[15px] font-medium
        transition-colors duration-150
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-primary-600
        focus-visible:ring-offset-2
        ${isActive
            ? 'bg-brand-primary-50 text-brand-primary-900 border-l-2 border-brand-primary-600 pl-[14px]'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
    `;

    const content = (
        <>
            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-primary-600' : ''}`} aria-hidden="true" />
            <span className="flex-1">{label}</span>
        </>
    );

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2, ease: 'easeOut' }}
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
