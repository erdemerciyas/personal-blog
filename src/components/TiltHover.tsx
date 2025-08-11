'use client';
import React, { useEffect, useRef } from 'react';

interface TiltHoverProps {
  children: React.ReactNode;
  maxTiltDeg?: number;
  className?: string;
}

// Lightweight hover tilt effect. Respects prefers-reduced-motion and coarse pointers.
const TiltHover: React.FC<TiltHoverProps> = ({ children, maxTiltDeg = 6, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (reduceMotion || coarsePointer) return; // do nothing on touch or reduced motion

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) - 0.5;
      const py = (y / rect.height) - 0.5;
      const rx = (-py * maxTiltDeg).toFixed(2);
      const ry = (px * maxTiltDeg).toFixed(2);
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const reset = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', reset);
    el.addEventListener('mouseenter', reset);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', reset);
      el.removeEventListener('mouseenter', reset);
    };
  }, [maxTiltDeg]);

  return (
    <div ref={ref} className={className} style={{ transition: 'transform 150ms ease-out', willChange: 'transform' }}>
      {children}
    </div>
  );
};

export default TiltHover;


