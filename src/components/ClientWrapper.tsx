'use client';

import { SessionProvider } from 'next-auth/react';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
} 