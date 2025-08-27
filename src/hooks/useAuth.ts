import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status === 'unauthenticated') {
      setUser(null);
      setLoading(false);
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        role: (session.user as any).role || 'user',
      });
    }

    setLoading(false);
  }, [session, status]);

  const login = () => {
    router.push('/admin/login');
  };

  const logout = () => {
    router.push('/admin/login');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}