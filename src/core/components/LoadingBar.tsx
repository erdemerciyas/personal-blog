'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingBar() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        // Start loading on route change
        setLoading(true);
        setProgress(15);

        // Simulate realistic loading progress with easing
        const progressSteps = [
            { delay: 100, value: 35 },
            { delay: 300, value: 55 },
            { delay: 600, value: 75 },
            { delay: 1000, value: 85 },
        ];

        const timers = progressSteps.map(step =>
            setTimeout(() => setProgress(step.value), step.delay)
        );

        // Complete loading
        const completeTimer = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 300);
        }, 1200);

        return () => {
            timers.forEach(timer => clearTimeout(timer));
            clearTimeout(completeTimer);
        };
    }, [pathname]);

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div
                className="h-1.5 bg-gradient-to-r from-brand-primary-600 via-brand-primary-500 to-blue-500 shadow-lg transition-all duration-500 ease-out"
                style={{
                    width: `${progress}%`,
                    boxShadow: progress > 0 ? '0 0 20px rgba(6, 132, 199, 0.6)' : 'none'
                }}
            />
            {/* Shimmer effect on progress bar */}
            {loading && progress < 100 && (
                <div className="absolute top-0 right-0 w-32 h-1.5 bg-gradient-to-l from-white/40 via-white/20 to-transparent animate-pulse" />
            )}
        </div>
    );
}
