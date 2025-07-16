'use client';

import React, { useState, useEffect } from 'react';
import ContentSkeleton from './ContentSkeleton';
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
  return <ContentSkeleton type="card" count={1} className="p-4" />;
}