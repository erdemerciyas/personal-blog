import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  role?: string;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

interface UseJWTAuthReturn {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: TokenData) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

const TOKEN_STORAGE_KEY = 'access_token';
const USER_STORAGE_KEY = 'user_data';

export function useJWTAuth(): UseJWTAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      // Clear invalid data
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback((tokens: TokenData) => {
    try {
      setAccessToken(tokens.accessToken);
      setUser(tokens.user);
      
      // Store in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tokens.user));
      
    } catch (error) {
      console.error('Login error:', error);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Clear refresh token cookie by calling logout endpoint
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(error => {
      console.error('Logout endpoint error:', error);
    });
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies for refresh token
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tokens: TokenData = await response.json();
        // Update state directly to avoid circular dependency
        setAccessToken(tokens.accessToken);
        setUser(tokens.user);
        localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tokens.user));
        return true;
      } else {
        // Refresh failed, logout user
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      return false;
    }
  }, []);

  // Update user data
  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  }, []);

  // Auto-refresh token on page load if it's about to expire
  useEffect(() => {
    if (accessToken && !isLoading) {
      // Check if token is close to expiry (within 5 minutes)
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        // If token expires within 5 minutes, refresh it
        if (timeUntilExpiry < 5 * 60 * 1000) {
          refreshToken();
        } else {
          // Set up auto refresh
          const refreshTime = timeUntilExpiry - 60 * 1000; // Refresh 1 minute before expiry
          setTimeout(() => {
            refreshToken();
          }, refreshTime);
        }
      } catch (error) {
        console.error('Token expiry check error:', error);
        logout();
      }
    }
  }, [accessToken, isLoading, refreshToken, logout]);

  return {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    refreshToken,
    updateUser
  };
}

// HTTP client with automatic token handling
export function createAuthenticatedFetch() {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If token is expired, try to refresh
    if (response.status === 401) {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        const tokens = await refreshResponse.json();
        localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
        
        // Retry original request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${tokens.accessToken}`
          }
        });
      } else {
        // Refresh failed, clear auth state
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        throw new Error('Authentication failed');
      }
    }

    return response;
  };
}

export default useJWTAuth;