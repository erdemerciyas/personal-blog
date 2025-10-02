'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface Message {
  _id: string;
  name: string;
  subject: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const lastCheckedRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;
    
    // Only fetch if on admin pages
    if (!pathname?.startsWith('/admin')) return;

    isFetchingRef.current = true;
    
    try {
      const response = await fetch('/api/messages', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const unreadMessages = data.filter((m: Message) => !m.isRead);
        
        // Check for new messages since last check
        const newMessages = unreadMessages.filter((m: Message) => 
          new Date(m.createdAt) > lastCheckedRef.current
        );

        // Show browser notification for new messages
        if (newMessages.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          newMessages.forEach((msg: Message) => {
            const notification = new Notification('Yeni Mesaj', {
              body: `${msg.name}: ${msg.subject}`,
              tag: msg._id,
            });

            notification.onclick = () => {
              window.focus();
              router.push(`/admin/messages?id=${msg._id}`);
              notification.close();
            };
          });
        }

        setMessages(unreadMessages);
        setUnreadCount(unreadMessages.length);
        lastCheckedRef.current = new Date();
      }
    } catch {
      // Silently fail - notification system is not critical
    } finally {
      isFetchingRef.current = false;
    }
  }, [pathname, router]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Initial fetch and polling - only on admin pages
  useEffect(() => {
    // Only run on admin pages
    if (!pathname?.startsWith('/admin')) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchMessages();
    
    // Set up polling (every 60 seconds instead of 30)
    intervalRef.current = setInterval(fetchMessages, 60000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pathname, fetchMessages]);

  const handleNotificationClick = (messageId: string) => {
    setIsOpen(false);
    router.push(`/admin/messages?id=${messageId}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    return `${Math.floor(seconds / 86400)} gün önce`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        aria-label="Bildirimler"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Bildirimler
              </h3>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {unreadCount} okunmamış mesaj
                </p>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {messages.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Yeni mesaj yok
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <button
                    key={message._id}
                    onClick={() => handleNotificationClick(message._id)}
                    className="w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          Yeni mesaj
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {message.name}: {message.subject}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {formatTimeAgo(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {messages.length > 0 && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/admin/messages');
                  }}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Tümünü gör
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
