"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { navigationConfig } from '@/lib/constants';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-48 bg-[#2A3142] text-white flex flex-col px-0">
      {/* Logo */}
      <div className="flex justify-center my-4">
        <Image 
          src="/stamp_003.png" 
          alt="Sarco Studio Logo" 
          width={48} 
          height={48} 
          className="h-12 w-auto" 
          priority
        />
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col">
        {navigationConfig.map((section) => (
          <div key={section.title}>
            {/* Section Title (if needed) */}
            {section.showTitle && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            
            {/* Navigation Items */}
            {section.items.map((item) => {
              const isActive = pathname === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`px-4 py-3 text-sm transition-colors duration-150 ${
                    isActive 
                      ? "bg-white text-black font-semibold border-r-4 border-blue-500" 
                      : "text-white hover:bg-gray-600 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer (if needed) */}
      <div className="mt-auto p-4 text-xs text-gray-400">
        <div>Sarco Studio</div>
        <div>v{process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'}</div>
      </div>
    </nav>
  );
}