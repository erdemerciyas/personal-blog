'use client';
import { SkeletonHero } from '../components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="min-h-screen">
      <SkeletonHero />
    </div>
  );
} 