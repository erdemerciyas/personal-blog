'use client';

import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingCta() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => setIsMounted(true), []);

  // İlk yüklemede kulakçığı otomatik aç-kapa (reduced motion değilse)
  useEffect(() => {
    if (!isMounted) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const openTimer = setTimeout(() => setIsOpen(true), 300); // hafif gecikme
    const closeTimer = setTimeout(() => setIsOpen(false), 2400); // kısa gösterim
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [isMounted]);

  // Admin sayfalarında gösterme
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // GA4 güvenli çağrı yardımcıları (tipli)
  type GtagFn = (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
  const getGtag = (): GtagFn | undefined => {
    if (typeof window === 'undefined') return undefined;
    const w = window as typeof window & { gtag?: GtagFn };
    return w.gtag;
  };
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    const gtag = getGtag();
    if (gtag) {
      gtag('event', eventName, params);
    }
  };

  const handleClick = () => {
    // GA4: CTA tıklandığında modal açılma niyeti
    trackEvent('open_project_modal', {
      location: 'floating_cta',
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('openProjectModal'));
    }
  };

  if (!isMounted) return null;

  return (
    <div className="hidden md:block fixed right-0 top-[42%] -translate-y-1/2 z-[60]" style={{ right: 'max(0px, env(safe-area-inset-right))' }}>
      <button
        onClick={handleClick}
        aria-label="Proje başvurusu formunu aç"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`group relative isolate overflow-hidden flex items-center h-16 ${isOpen ? 'w-56' : 'w-14'} hover:w-56 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out ${isOpen ? 'translate-x-0' : 'translate-x-3'} hover:translate-x-0 rounded-l-2xl text-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary-300/60 bg-gradient-to-b from-brand-primary-700 to-brand-primary-900 motion-safe:hover:scale-[1.01] drop-shadow-[0_10px_28px_rgba(0,52,80,0.35)]`}
      >
        {/* İç glow ve ince iç hat */}
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute inset-0 rounded-l-2xl ring-1 ring-white/10 group-hover:ring-white/25 motion-safe:transition" />
          <span className="absolute inset-y-0 left-0 w-px bg-white/30 opacity-30 group-hover:opacity-60 motion-safe:transition" />
          {/* dalga */}
          <svg className="absolute -left-10 top-0 h-full w-24 opacity-10 group-hover:opacity-20 motion-safe:transition-opacity" viewBox="0 0 100 200" preserveAspectRatio="none" aria-hidden>
            <path d="M0,0 C30,40 30,80 0,120 C-30,160 -30,200 0,240" stroke="white" strokeWidth="6" fill="none" />
          </svg>
        </span>

        {/* Kulak gövdesi – dar başlangıç, hover’da yazı belirir */}
        <div className="relative z-10 flex items-center gap-2 px-3">
          <PaperAirplaneIcon className="w-5 h-5 text-white/95 drop-shadow-[0_2px_6px_rgba(255,255,255,0.25)] motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-0.5" />
          <span className={`font-semibold whitespace-nowrap overflow-hidden ${isOpen ? 'max-w-[11rem]' : 'max-w-0'} group-hover:max-w-[11rem] motion-safe:transition-all`}>Proje Başvurusu</span>
        </div>

        {/* Üst ve alt kavis vurgusu */
        }
        <span aria-hidden className="absolute -top-6 right-0 w-10 h-10 rounded-full bg-brand-primary-900/50 blur-xl" />
        <span aria-hidden className="absolute -bottom-6 right-0 w-10 h-10 rounded-full bg-brand-primary-700/40 blur-xl" />
        {/* Dış glow – arka plandan ayrışma */}
        <span aria-hidden className="absolute -inset-y-6 right-2 w-24 bg-brand-primary-900/20 blur-2xl pointer-events-none" />

        {/* Diagonal kesimli sağ uç */}
        <span aria-hidden className="absolute right-[-18px] top-0 h-full w-12 bg-brand-primary-900/90 shadow-[inset_0_0_20px_rgba(255,255,255,0.06)] transform -skew-x-12" />
        {/* Diagonal highlight çizgisi */}
        <span aria-hidden className="absolute right-[-6px] top-0 h-full w-px bg-white/20 transform -skew-x-12 opacity-0 group-hover:opacity-60 motion-safe:transition-opacity" />
      </button>
    </div>
  );
}
