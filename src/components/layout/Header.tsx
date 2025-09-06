"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { UserDropdown } from './UserDropdown';
import { navigationConfig } from '@/lib/constants';

export function Header() {
  const pathname = usePathname();

  // Find the current page title
  const getCurrentPageTitle = () => {
    for (const section of navigationConfig) {
      const item = section.items.find(item => item.path === pathname);
      if (item) return item.name;
    }
    return 'Sarco Studio';
  };

  return (
    <header className="bg-white text-black p-6 flex justify-between items-center shadow-md h-20 border-b border-gray-200">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getCurrentPageTitle()}
        </h1>
        {/* Breadcrumb could go here if needed */}
      </div>
      
      {/* Right side - User actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications or other actions could go here */}
        
        {/* User Dropdown */}
        <UserDropdown />
      </div>
    </header>
  );
}