'use client';

import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from './SkeletonLoader';
import { getLoadingConfig } from '@/lib/config';

export default function DefaultLoading() {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const config = await getLoadingConfig();
        setShouldShow(config.systemInstalled && config.globalEnabled);
      } catch (error) {
        console.error('Failed to load loading config:', error);
        setShouldShow(true); // Fallback to showing loading
      }
    };

    checkConfig();
  }, []);

  if (!shouldShow) return null;
  return <SkeletonLoader className="p-4" />;
}