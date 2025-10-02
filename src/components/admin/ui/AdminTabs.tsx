'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AdminTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export default function AdminTabs({
  tabs,
  defaultTab,
  onChange,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string, index: number) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevTab = tabs[index - 1];
      if (!prevTab.disabled) {
        handleTabChange(prevTab.id);
      }
    } else if (e.key === 'ArrowRight' && index < tabs.length - 1) {
      const nextTab = tabs[index + 1];
      if (!nextTab.disabled) {
        handleTabChange(nextTab.id);
      }
    }
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8" role="tablist">
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
                className={cn(
                  'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-brand-primary-600 text-brand-primary-700 dark:text-brand-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300',
                  tab.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {tab.icon && <tab.icon className="w-5 h-5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        className="py-6"
      >
        {activeTabContent}
      </div>
    </div>
  );
}
