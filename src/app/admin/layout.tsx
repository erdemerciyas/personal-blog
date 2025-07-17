'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminRootLayout({ children }: AdminLayoutProps) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    </SessionProvider>
  );
}