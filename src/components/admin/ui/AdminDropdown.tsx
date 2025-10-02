'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface AdminDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export default function AdminDropdown({
  trigger,
  items,
  align = 'left',
  className,
}: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, item: DropdownItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-slide-down',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-left transition-colors',
                  item.disabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'
                )}
                role="menuitem"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
